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

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.use("/", roomRouter);

server.listen(PORT, function () {
  console.log(`Sever is running at ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, peerId } = data;
    console.log(`+ ${peerId} JOINED ROOM ${roomId}`);
    socket.join(roomId);
    socket
      .to(roomId)
      .broadcast.emit("user-connected", { anotherUserId: peerId });
  });
  socket.on("disconnect", () => {
    console.log("+ user disconnected: ");
    // console.log(socket.id);
  });
});
