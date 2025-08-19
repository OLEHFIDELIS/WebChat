// server.js
require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const { register, login, signToken, authMiddleware, requireAdmin } = require("./routes/auth");
const User = require("./models/user");
const Room = require("./models/chatRoom");
const Message = require("./models/massage");
const { attachSocket } = require("./middleware/socketAuth");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
attachSocket(io);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  

// --- Auth Routes ---
app.post("/auth/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await register({ username, password, role });
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const user = await login(req.body);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken(user);
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// --- Room Routes ---
app.post("/rooms", authMiddleware, requireAdmin, async (req, res) => {
  const { name, memberIds } = req.body;
  const room = new Room({ name, createdBy: req.user.id, members: [req.user.id].concat(memberIds || []) });
  await room.save();
  res.json({ roomId: room._id, name: room.name });
});

app.post("/rooms/direct", authMiddleware, requireAdmin, async (req, res) => {
  const { memberId } = req.body;
  const member = await User.findById(memberId);
  if (!member || member.role !== "member") {
    return res.status(400).json({ error: "Direct chat must be with a member" });
  }
  let room = await Room.findOne({
    isDirect: true,
    members: { $all: [req.user.id, memberId], $size: 2 }
  });
  if (!room) {
    room = new Room({
      name: `DM-${req.user.id}-${memberId}`,
      isDirect: true,
      createdBy: req.user.id,
      members: [req.user.id, memberId]
    });
    await room.save();
  }
  res.json({ roomId: room._id, name: room.name, isDirect: true });
});

app.get("/rooms", authMiddleware, async (req, res) => {
  const rooms = await Room.find({ members: req.user.id });
  res.json(rooms.map(r => ({ id: r._id, name: r.name, isDirect: r.isDirect })));
});

// GET /users - return all members (only for admins)
app.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  const users = await User.find({ role: "member" }, "username _id");
  res.json(users); // [{_id: "...", username: "member1"}, ...]
});


app.get("/rooms/:roomId/messages", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId).populate("members", "role");
  if (!room || !room.members.some(u => u._id.equals(req.user.id))) {
    return res.status(403).json({ error: "Not in room" });
  }
  if (room.isDirect) {
    const roles = new Set(room.members.map(u => u.role));
    if (!(roles.has("admin") && roles.has("member"))) {
      return res.status(403).json({ error: "Member↔Member DM not allowed" });
    }
  }
  const msgs = await Message.find({ roomId }).populate("senderId", "username").sort({ createdAt: 1 });
  res.json(msgs.map(m => ({
    id: m._id,
    content: m.content,
    createdAt: m.createdAt,
    sender: { id: m.senderId._id, username: m.senderId.username }
  })));
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

