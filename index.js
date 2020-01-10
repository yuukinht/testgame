var express = require('express');
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));
var io = require('socket.io')(server);
io.sockets.on('connection',
  function (socket) { 
	socket.on('setUsername', function(data) {		
		console.log(data.name + " Join!");		
	});
	socket.on('other', function(data) {
		socket.broadcast.emit('other',{id:socket.id,data:data});
    });	
	socket.on('otherbullet', function(data) {
		socket.broadcast.emit('otherbullet',{id:socket.id,data:data});
    });	
    socket.on('disconnect', function() {
		socket.broadcast.emit('logout',{id:socket.id});
    });	
  }
);