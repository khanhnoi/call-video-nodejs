const express = require("express");
const app = express();
require("dotenv").config();
const io = require("socket.io")(app);
const PORT = process.env.PORT || 5000;
const roomRouter = require("./router/room");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", roomRouter);

io.on("connection", (socket) => {
  console.log("A user connected !!");
  socket.on("join-room", () => {
    console.log("A User joined Room");
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(PORT, function () {
  console.log(`Sever is running at ${PORT}`);
});
