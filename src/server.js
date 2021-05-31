'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = '/public/index.html';

const server = express()
.use((req, res) => res.sendFile(path.join(__dirname + '/public/index.html')))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


const io = socketIO(server);

let connectedUsers = [];

io.on('connection', socket => {
  connectedUsers.push(socket.id);

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(user => user !== socket.id)
    socket.broadcast.emit('update-user-list', { userIds: connectedUsers })
  })

  socket.on('mediaOffer', data => {
    socket.to(data.to).emit('mediaOffer', {
      from: data.from,
      offer: data.offer
    });
  });
  
  socket.on('mediaAnswer', data => {
    socket.to(data.to).emit('mediaAnswer', {
      from: data.from,
      answer: data.answer
    });
  });

  socket.on('iceCandidate', data => {
    socket.to(data.to).emit('remotePeerIceCandidate', {
      candidate: data.candidate
    })
  })

  socket.on('requestUserList', () => {
    socket.emit('update-user-list', { userIds: connectedUsers });
    socket.broadcast.emit('update-user-list', { userIds: connectedUsers });
  });
});


// http.listen(port, () => {
//   console.log('listening on *:'+port);
// });
