var socket = io();
//socket.on('message', function(data) {
//  console.log(data);
//});
var draw = {
  active: false,
  x: 0,
  y: 0,
}

document.addEventListener('mousedown', function(event) {
	draw.active = true;
	draw.x  = event.pageX;
	draw.y = event.pageY;
});

document.addEventListener('mouseup', function(event) {
	draw.active = false;
});

socket.emit('new player');
setInterval(function() {
	if (draw.active == true){
		socket.emit('drawing', draw);
	}
}, 0);

onmousemove = function(e){
	if (e != undefined){
		draw.x = e.clientX, 
		draw.y = e.clientY
	}
}

var canvas = document.getElementById('canvas');
canvas.width = 1900;
canvas.height = 800;
var context = canvas.getContext('2d');
 
context.clearRect(0, 0, 1900, 800);
socket.on('drawnew', function(details) {
    context.fillStyle = 'green';
	context.beginPath();
	context.arc(details.x-12, details.y-10, 10, 0, 2 * Math.PI);
	context.fill();
});
socket.on('clearrect', function() {
	context.clearRect(0, 0, 1900, 800);
});
socket.on('insert', function(named) {
	addRow(named);
});

socket.on('remove', function(idremove) {
	removeRow(idremove);
});

function boardReset(){
	socket.emit('clear',1)
}

function addRow(named) {
  const div = document.createElement('div');

  div.className = 'inline';

  div.innerHTML = `
    <p id = '`+named+`'> `+named+` </p>
 
  `;

  document.getElementById('players').appendChild(div);
}

function removeRow(elementId) {
	var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}