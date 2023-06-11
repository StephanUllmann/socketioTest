const express = require("express");
const { Server } = require("socket.io");
const authSocket = require("./middlewares/authSocket");
const app = express();
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const port = process.env.PORT || 5555;
const connectDB = require("./dbinit");
const Room = require("./schemas/Room");
const User = require("./schemas/User");
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://luxury-mochi-9f35c6.netlify.app/",
    ],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/user");

app.get("/", (req, res) => {
  res.send("socket.io server listening");
});

app.use("/user", userRoutes);
const wrap = (middleware) => (socket, next) => middleware(socket, next);
io.use(wrap(authSocket));

io.on("connection", (socket) => {
  console.log(`a user connected with as: ${socket.user}`);
  socket.emit("get-user-rooms", socket.user.rooms);
  // console.log("This is the socket: ", socket);

  socket.on("join-room", async (room, callback) => {
    const foundRoom = await Room.findOneAndUpdate(
      { roomName: room },
      { $setOnInsert: { roomName: room } },
      { upsert: true, new: true }
    );
    const user = await User.findOneAndUpdate(
      {
        username: socket.user.username,
      },
      { $addToSet: { rooms: foundRoom.roomName } }
    );
    socket.join(foundRoom.roomName);
    callback({ roomName: foundRoom.roomName, messages: foundRoom.messages });
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
  });

  socket.on("message", async (message, time, room) => {
    if (!room || room === "") {
      // console.log("no room message: ", message);
      // console.log("username: ", socket.user.username);
      socket.broadcast.emit("receiveMessages", {
        message,
        username: socket.user.username,
        time,
      });
    } else {
      // console.log(`${room} message: `, message);
      // console.log("username: ", socket.user.username);
      // console.log("user: ", socket.user);
      // console.log("time: ", time);

      const messageDB = await Room.findOneAndUpdate(
        { roomName: room },
        {
          $push: {
            messages: {
              message,
              username: socket.user.username,
              userId: socket.user._id,
              time,
            },
          },
        },
        { upsert: true }
      );
      // console.log(messageDB);
      socket.to(room).emit("receiveMessages", {
        message,
        username: socket.user.username,
        time,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("the user disconnected");
  });
});

server.listen(port, () => {
  console.log(`socket.io server listening on http://localhost:${port}`);
});
