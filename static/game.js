var socket = io();
//socket.on('message', function(data) {
//  console.log(data);
//});
var draw = {
  active: false,
  x: 0,
  y: 0,
  prevx: 0,
  prevy: 0,
  drawprev: false
}
var download = false;
var i;
var angle;

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
		context.beginPath();
		context.fillStyle = color;
		context.arc(draw.x-12, draw.y-10, 10, 0, 2 * Math.PI);
		context.fill();
		if (draw.drawprev == true){
			context.beginPath();
			context.lineWidth = 20;
			context.strokeStyle = color;
			context.moveTo(draw.x-12,draw.y-10);
			context.lineTo(draw.prevx-12,draw.prevy-10);
			context.stroke();
		}
		draw.drawprev = true;
		draw.prevx = draw.x;
		draw.prevy = draw.y;
	} else{
		draw.drawprev= false;
	}
}, 0);

onmousemove = function(e){
	if (e != undefined){
		draw.x = e.clientX,
		draw.y = e.clientY
	}
}

var canvas = document.getElementById('canvas');
canvas.width = 1850;
canvas.height = 780;
var context = canvas.getContext('2d');
var color = 'black';
var store;
context.fillStyle = 'white';
context.fillRect(0, 0, 1850, 780);
context.fillStyle = 'black';

socket.on('drawnew', function(details,fillStyle) {
	context.beginPath();
	context.fillStyle = fillStyle
	context.arc(details.x-12, details.y-10, 10, 0, 2 * Math.PI);
	context.fill();
	if (details.drawprev == true){
		context.beginPath();
		context.lineWidth = 20;
		context.strokeStyle = fillStyle;
		context.moveTo(details.x-12,details.y-10);
		context.lineTo(details.prevx-12,details.prevy-10);
		context.stroke();
	}
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
	context.fillRect(0, 0, 1850, 780);
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