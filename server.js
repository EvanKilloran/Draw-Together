// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();

// Set up server routing
var server = http.Server(app);
var io = socketIO(server);app.set('port', process.env.PORT || 5000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Start server.
server.listen(process.env.PORT || 5000, function() {
	console.log('Starting server on port 5000');
});

// WebsSocket Handlers
io.on('connection', function(socket) {
});

var names = ["panda","lion","tiger","bat","kiwi","pikachu","giraffe","deer","zebra"];
var players = {};
var i;
var sendTo;


io.on('connection', function(socket) {
	socket.on('new player', function() {
		// variable to keep id for requesting canvas image (new player)
		sendTo = socket.id;
		// Update new player's online div with everyone's name
		for (i in players){
			socket.emit('insert',players[i])
		}
		/* Request everyone to send the canvas -- should be improved in the future 
		   It currently works this way because sometimes players can close the tab without disconnecting properly
		   resulting in the new player not recieving the image when it is requested thus it just tries everyone */
		for (i in players){
			io.to(i).emit("updateNewPlayer");
		}
		while (names[0] == null){
			names.shift();
		}
		players[socket.id] = names[0];
		
		// This tells everyone connected to add the new player to the HTML player's list
		io.sockets.emit('insert',players[socket.id]);
		names.shift();
		// refresh names list if it runs out -- the shifting from before is to make sure everyone gets a unique name
		if (names.length == 0){
			names = ["panda","lion","tiger","bat","kiwi","pikachu","giraffe","deer","zebra"];
		}
	});

	socket.on('drawing', function(data,fillStyle) {
		//send to everyone except sender
		socket.broadcast.emit('drawnew',data,fillStyle);
	});
	
	// remove disconnected player and readd name to list
	socket.on('disconnect', function() {
		names.push(players[socket.id])
		io.sockets.emit('remove',players[socket.id]);
		delete players[socket.id];
	});
  
	// (clearing the board)
	socket.on('clear', function() {
		io.sockets.emit('clearrect');
	});
	
	// This is part of updating new users (sends the image to the user to paint the canvas with)
	socket.on('canvasData', function(canvasData) {
		io.to(sendTo).emit("canvasUpdate", canvasData);
	});
});



