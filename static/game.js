var socket = io();
var draw = {
  active: false,
  x: 0,
  y: 0,
  prevx: 0,
  prevy: 0,
  drawprev: false,
  size: 5
}
var download = false;
var i;
var angle;
var drawList = [];
var timer = 0;

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
	if (draw.x > 0 && draw.x < (1850+30) && draw.y>0 && draw.y < (780+30) && draw.active == true){
		if (draw.x != draw.prevx || draw.y != draw.prevy){
			if (draw.size > 20){
				draw.size = 20;
			}
			context.beginPath();
			context.fillStyle = color;
			context.arc(draw.x-12, draw.y-10, draw.size, 10, 0, 2 * Math.PI);
			context.fill();
			if (draw.drawprev == true){
				context.beginPath();
				context.strokeStyle = color;
				context.lineWidth = draw.size*2;
				context.moveTo(draw.x-12,draw.y-10);
				context.lineTo(draw.prevx-12,draw.prevy-10);
				context.stroke();
			}
			drawList.push([draw.x,draw.y,draw.prevx,draw.prevy,draw.drawprev ? 1:0,draw.size]);
			draw.drawprev = true;
			draw.prevx = draw.x;
			draw.prevy = draw.y;
		}
	} else{
		draw.drawprev= false;
	}
	if (timer == 4){
		timer = 0;
		if (drawList.length != 0){
			socket.emit('drawing', drawList, color);
			drawList = []
		}
	}
	timer += 1;
}, 0);


onmousemove = function(e){
	if (e != undefined){
		draw.x = e.pageX,
		draw.y = e.pageY
	}
}

var canvas = document.getElementById('canvas');
canvas.width = 1850;
canvas.height = 780;
var context = canvas.getContext('2d');
var colourCanvas = document.getElementById("colorCanvas");
var colourContext = colourCanvas.getContext("2d");
var gradientImage = new Image();
gradientImage.onload = function(){ //wait for image to load before doing stuff
	colourContext.drawImage(gradientImage, 0, 0);	
}
gradientImage.src = "/static/colourGradient.png";
var color = 'black';
var store;
var imgData;
var dataStored;
context.fillStyle = 'white';
context.fillRect(0, 0, 1850, 780);
context.fillStyle = 'black';

socket.on('drawnew', function(details, fillStyle) {
	for (i=0; i<details.length; i++){
		context.beginPath();
		context.fillStyle = fillStyle
		context.arc(details[i][0]-12, details[i][1]-10, details[i][5], 10, 0, 2 * Math.PI);
		context.fill();
		if (details[i][4] == 1){
			context.beginPath();
			context.strokeStyle = fillStyle;
			context.lineWidth = details[i][5]*2;
			context.moveTo(details[i][0]-12,details[i][1]-10);
			context.lineTo(details[i][2]-12,details[i][3]-10);
			context.stroke();
		}
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

socket.on('updateNewPlayer', function() {
	socket.emit('canvasData',canvas.toDataURL("image/png"));
});

socket.on('canvasUpdate', function(canvasData) {
	var canvasImage = new Image();
	canvasImage.onload = function(){ //wait for image to load before doing stuff
		context.drawImage(canvasImage, 0, 0);	
	}
	canvasImage.src = canvasData;
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

function changeSize(size) {
	draw.active = false; //prevents clicking the slider and drawing around with varying widths
	draw.size = size;
	
}

function toggleDownload(){
	if (download == false){
		download = true;
	}else{
		download = false;
	}
}



colourCanvas.onclick = function(mouseEvent){
	imgData = colourContext.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
	dataStored = imgData.data;
	color = "rgba("+dataStored[0]+","+dataStored[1] + "," + dataStored[2] + "," + dataStored[3] + ")";
}

