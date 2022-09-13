//引入模块
const express = require('express');
const http = require('http');
const cors = require('cors');

//初始化
const app = express();
const server = http.createServer(app);

app.use(cors());

//初始化io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

//服务器socket连接
io.on('connection', (socket) => {
  socket.emit('me', socket.id);
  //断开通信
  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', (data) => {
    //将数据传递给通信的接听方
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answerCall', (data) => {
    //将数据传递给通信的发起方
    console.log(data);
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

server.listen(5001, () => {
  console.log('服务器正在5001端口号运行....');
});
