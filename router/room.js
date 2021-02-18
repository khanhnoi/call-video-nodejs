const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get("/", function (req, res) {
  //   console.log("index");
  // res.redirect(`/${uuidv4()}`);
  res.render("index", { title: "CALL VIDEO IN ROOM by Khánh Nòi" });
});

router.get("/:roomId", function (req, res) {
  // console.log(req.params.roomId);
  // res.setHeader("Content-Type", "text/html");
  res.render("room", {
    title: "ROOM " + req.params.roomId,
    roomId: req.params.roomId,
  });
});
module.exports = router;
