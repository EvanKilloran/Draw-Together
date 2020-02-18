var socket = io();
//socket.on('message', function(data) {
//  console.log(data);
//});
var draw = {
  active: false,
  x: 0,
  y: 0,
}
var download = false;
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
		socket.emit('drawing', draw, color);
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
var color = 'black';
var store;
 
context.fillStyle = 'white';
context.fillRect(0, 0, 1900, 800);
context.fillStyle = 'black';
socket.on('drawnew', function(details,fillStyle) {
	context.fillStyle = fillStyle
	context.beginPath();
	context.arc(details.x-12, details.y-10, 10, 0, 2 * Math.PI);
	context.fill();
});
socket.on('clearrect', function() {
	if (download == true){
		var link = document.getElementById('link');
		link.setAttribute('download', 'canvas.png');
		link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
		link.click();
	}
	var store = context.fillStyle;
	context.fillStyle = 'white'
	context.fillRect(0, 0, 1900, 800);
	context.fillStyle = store;
});
socket.on('insert', function(named) {
	addRow(named);
});

socket.on('remove', function(idremove) {
	removeRow(idremove);
});

function boardReset(){
	if (document.getElementById("button").disabled == false){
		socket.emit('clear',1);
		document.getElementById("button").disabled = true;
		setTimeout(function(){document.getElementById("button").disabled = false;},10000);
	}
}

function changeColor(colorpicker){
	color = colorpicker;
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

function toggleDownload(){
	if (download == false){
		download = true;
	}else{
		download = false;
	}
}