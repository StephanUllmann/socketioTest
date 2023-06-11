const mongoose = require("mongoose");

const roomMessages = new mongoose.Schema({
  message: String,
  username: String,
  userId: mongoose.ObjectId,
  time: String,
});

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    unique: true,
  },
  messages: {
    type: [roomMessages],
  },
});

module.exports = mongoose.model("room", roomSchema);
