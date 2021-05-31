const express = require('express');
const path = require('path');

const app = express();
var port=process.env.PORT;

const https = require('https').createServer(app);
const io = require('socket.io')(https);

app.use(express.static(path.join(__dirname, '../public')));

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


http.listen(port, () => {
  console.log('listening on *:3000');
});
