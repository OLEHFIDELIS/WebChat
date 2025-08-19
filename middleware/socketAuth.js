const jwt = require("jsonwebtoken");
const Room = require("../models/chatRoom");
const Message = require("../models/massage");

async function validateRoom(roomId) {
  const room = await Room.findById(roomId).populate("members", "role");
  if (!room) return { ok: false, reason: "Room not found" };

  if (room.isDirect) {
    if (room.members.length !== 2) return { ok: false, reason: "Direct must be 2 users" };
    const roles = new Set(room.members.map(u => u.role));
    const valid = roles.has("admin") && roles.has("member");
    return valid ? { ok: true, room } : { ok: false, reason: "Member↔Member DM not allowed" };
  }

  return { ok: true, room };
}

function attachSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));
      const user = jwt.verify(token, process.env.JWT_KEY);
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const me = socket.user;

    socket.on("joinRoom", async (roomId) => {
      const room = await Room.findById(roomId);
      if (!room || !room.members.includes(me.id)) return;
      socket.join(`room:${roomId}`);
    });

    socket.on("message:send", async ({ roomId, content }, cb) => {
      try {
        if (!content || !roomId) throw new Error("Missing content/roomId");

        const room = await Room.findById(roomId);
        if (!room || !room.members.includes(me.id)) throw new Error("Not in room");

        const validation = await validateRoom(roomId);
        if (!validation.ok) throw new Error(validation.reason);

        const msg = new Message({ roomId, senderId: me.id, content });
        await msg.save();

        io.to(`room:${roomId}`).emit("message:new", {
          id: msg._id,
          roomId,
          senderId: me.id,
          senderName: me.username,
          content: msg.content,
          createdAt: msg.createdAt
        });

        cb?.({ ok: true, id: msg._id });
      } catch (err) {
        cb?.({ ok: false, error: err.message });
      }
    });
  });
}

module.exports = { attachSocket };


