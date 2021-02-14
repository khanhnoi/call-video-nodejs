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
    console.log("+ A user join Room !");
    const { roomId, peerId } = data;
    const user = userJoin(peerId, socket.id, roomId, "No Name");
    console.log(`+ ${peerId} JOINED ROOM ${roomId}`);
    socket.join(roomId);
    socket
      .to(roomId)
      .broadcast.emit("user-connected", { anotherUserId: peerId });
    io.to(roomId).emit("update-room", { totalUsers: getUsersOnline() });
    socket.on("message", (data) => {
      const { msg } = data;
      // console.log(msg);

      io.to(roomId).emit("create-message", { msg });
    });
  });
  socket.on("disconnect", () => {
    console.log("+ user disconnected: ");
    const userL = userLeave(socket.id);
    if (userL) {
      io.to(userL.roomId).emit("update-room", {
        totalUsers: getUsersOnline(),
        peerIdUserDisconnect: userL.peerId,
      });
    }

    // console.log(socket.id);
  });
});
