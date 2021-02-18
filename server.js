const express = require("express");
const app = express();
const http = require("http");
const server = http.Server(app);
const io = require("socket.io")(server);
require("dotenv").config();
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const PORT = process.env.PORT || 5000;
const roomRouter = require("./router/room");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getUsersRoom,
  getUsersOnline,
  getNameUsers,
} = require("./utils/user");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.use("/", roomRouter);

server.listen(PORT, function () {
  console.log(`Sever is running at ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, peerId, userName } = data;
    console.log(`+ ${userName} join Room !`);
    const user = userJoin(peerId, socket.id, roomId, userName);
    // console.log(user);
    console.log(`+ ${peerId} JOINED ROOM ${roomId}`);
    console.log(getNameUsers());
    socket.join(roomId);
    socket
      .to(roomId)
      .broadcast.emit("user-connected", { anotherUserId: peerId });
    io.to(roomId).emit("update-room", {
      totalUsers: getUsersOnline(),
      nameUsers: getNameUsers(),
    });
    socket.on("message", (data) => {
      const { msg, socketId } = data;
      // console.log(msg);
      const userSend = getCurrentUser(socketId);
      const nameUserSend = userSend.userName;
      console.log("userSend");
      console.log(userSend);
      io.to(roomId).emit("create-message", { msg, nameUser: nameUserSend });
    });
  });
  socket.on("disconnect", () => {
    console.log("+ user disconnected: ");
    const userL = userLeave(socket.id);
    if (userL) {
      io.to(userL.roomId).emit("update-room", {
        totalUsers: getUsersOnline(),
        peerIdUserDisconnect: userL.peerId,
        nameUsers: getNameUsers(),
      });
    }

    // console.log(socket.id);
  });
});
