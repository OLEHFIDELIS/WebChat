const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

