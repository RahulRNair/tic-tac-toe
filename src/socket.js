import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5000';

// export const socket = io(URL);

// import io from 'socket.io-client';
 var socket;
export const initiateSocket = (room) => {
  socket = io(URL);
  console.log(`Connecting socket...`);
  if (socket && room) socket.emit('join', room);
}
export const createUser = (value) => {
    socket = io(URL);
    console.log("new user ",value)
    socket.emit('new user', value)
  }
export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}
export const subscribeToChat = () => {
    socket.emit('users', value => {
        console.log('Websocket event received!', value);
    })
//   if (!socket) return(true);
//   socket.on('users', msg => {
//     console.log('Websocket event received!');
//     return cb(null, msg);
//   });
}
export const sendMessage = (room, message) => {
  if (socket) socket.emit('chat', { message, room });
}