const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get("/", function (req, res) {
  //   console.log("index");
  res.redirect(`/${uuidv4()}`);
  res.render("index", { title: "ROOM by Khánh Nòi" });
});

router.get("/:roomId", function (req, res) {
  console.log(req.params.roomId);
  // res.setHeader("Content-Type", "text/html");
  res.render("room", { title: "ROOM ID", roomId: req.params.roomId });
});
module.exports = router;
