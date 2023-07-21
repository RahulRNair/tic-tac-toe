const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server, {
  cors: {
    origin: '*',
  }
});

//const activeUsers = new Set();
let activeUsers = []

io.on("connection", function (socket) {
  console.log(`⚡: ${socket.id} user just connected!`)
  console.log("Made socket connection");
  socket.on("connected", function () {
    io.emit("newUserResponse", [...activeUsers]);
  });
  socket.on("createNewUser", function (data) {

    var user = { username: data, socketid: socket.id, connected: false }
    activeUsers.push(user);
    io.emit("newUserResponse", [...activeUsers]);
  });
  socket.on("connectUser", function (connectionsocketid, currentusername, currentusersocketid, xIsNext) {

    activeUsers.some(function (item) {
      if (item.socketid == connectionsocketid || item.socketid == currentusersocketid) {
        //change the value here
        item.connected = true

      }
    });

    io.emit("newUserResponse", [...activeUsers]);
    io.to(connectionsocketid).emit('userConnected', { username: currentusername, socketid: currentusersocketid });
    io.to(connectionsocketid).emit('nextPlayer', currentusername);
    io.to(currentusersocketid).emit('nextPlayer', currentusername);
    io.to(currentusersocketid).emit('nextX', xIsNext);
    io.to(connectionsocketid).emit('nextX', xIsNext);
  });
  socket.on("userPlay", function (socketid, data, username, xIsNext, currentusersocketid) {

    io.to(socketid).emit('userPlayResponse', data);
    io.to(socketid).emit('nextPlayer', username);
    io.to(socketid).emit('nextX', xIsNext);
    io.to(currentusersocketid).emit('nextX', xIsNext);
    io.to(currentusersocketid).emit('nextPlayer', username);
  });



});