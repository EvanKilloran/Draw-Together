// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
// Add the WebSocket handlers
io.on('connection', function(socket) {
});

var names = ["panda","lion","tiger","bat","kiwi","pikachu","giraffe","deer","zebra"];
var players = {};
var i;
io.on('connection', function(socket) {
  socket.on('new player', function() {
	for (i in players){
		socket.emit('insert',players[i])
	}
	while (names[0] == null){
		names.shift();
	}
    players[socket.id] = names[0];
	io.sockets.emit('insert',players[socket.id]);
	names.shift();
	if (names.length == 0){
		names = ["panda","lion","tiger","bat","kiwi","pikachu","giraffe","deer","zebra"];
	}
  });
  socket.on('drawing', function(data) {
	io.sockets.emit('drawnew',data);
  });
  socket.on('disconnect', function() {
    // remove disconnected player
	names.push(players[socket.id])
	io.sockets.emit('remove',players[socket.id]);
	delete players[socket.id];
  });
  socket.on('clear', function() {
	io.sockets.emit('clearrect');
  });
});



