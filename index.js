var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io')(server);
io.sockets.on('connection',
  function (socket) { 
	socket.on('mess', function(data) {
		socket.broadcast.emit('other',data);
    });	
  }
);
