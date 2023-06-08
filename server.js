const express = require("express");
const { Server } = require("socket.io");
const app = express();
const http = require("http");
require("dotenv").config();
const port = process.env.PORT || 5555;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://main--luxury-mochi-9f35c6.netlify.app/",
    ],
  },
});

app.get("/", (req, res) => {
  res.send("socket.io server listening");
});

io.on("connection", (socket) => {
  console.log(`a user connected on socket.id: ${socket.id}`);

  socket.on("message", (message) => {
    console.log(message);
    socket.broadcast.emit("serverEvent", { message, id: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("the user disconnected");
  });
});

server.listen(port, () => {
  console.log(`socket.io server listening on http://localhost:${port}`);
});
