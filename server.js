const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const roomRouter = require("./router/room");

app.use("/", roomRouter);

app.listen(PORT, function () {
  console.log(`Sever is running at ${PORT}`);
});
