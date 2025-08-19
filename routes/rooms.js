const express = require("express");
const jwt = require("jsonwebtoken");
const ChatRoom = require("../models/chatRoom");
const User = require("./models/user");

const router = express.Router();

function auth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.redirect("/login");
  try {
    req.user = jwt.verify(token, process.env.JWT_KEY);
    next();
  } catch {
    res.redirect("/login");
  }
}

// Show create room form (admin only)
router.get("/create", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.send("Only admins can create rooms");
  const members = await User.find({ role: "member" });
  res.render("create-room", { user: req.user, members, title: "Create Room" });
});

// Handle form submission
router.post("/create", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.send("Only admins can create rooms");

  const { name, memberIds } = req.body;
  const room = await ChatRoom.create({
    name,
    type: memberIds.length > 1 ? "group" : "direct",
    users: [req.user.id, ...(Array.isArray(memberIds) ? memberIds : [memberIds])],
    createdBy: req.user.id
  });

  res.redirect("/chat"); // redirect back to chat view
});

module.exports = router;
