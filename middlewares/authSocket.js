const jwt = require("jsonwebtoken");
const User = require("../schemas/User");

const authSocket = async (socket, next) => {
  try {
    const { auth } = socket.handshake;
    if (!auth) throw new Error("Not Authorized");

    const token = auth.token.split(" ")[1];
    const { _id } = jwt.verify(token, process.env.SECRET);
    socket.user = await User.findOne({ _id }, { username: 1, rooms: 1 });
    if (!socket.user) throw new Error("Not Authorized");
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authSocket;
