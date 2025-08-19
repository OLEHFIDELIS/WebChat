const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const TOKEN_TTL = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: TOKEN_TTL }
  );
}

async function register({ username, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash: hash, role: role || "member" });
  await user.save();
  return user;
}

async function login({ username, password }) {
  const user = await User.findOne({ username });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_KEY);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

module.exports = { signToken, register, login, authMiddleware, requireAdmin };


