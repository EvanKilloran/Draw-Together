var draw = {
  active: false,
  x: 0,
  y: 0,
  prevx: 0,
  prevy: 0,
  drawprev: false,
  size: 5
}
var socket = io();
var download = false;
var i;
var angle;
var drawList = [];
var timer = 0;
var color = 'black';
var store;
var imgData;
var dataStored;


var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth-30;
canvas.height = window.innerHeight-190;
var context = canvas.getContext('2d');
context.fillStyle = 'white';
context.fillRect(0, 0, 1850, 780);
context.fillStyle = 'black';


var colourCanvas = document.getElementById("colorCanvas");
var colourContext = colourCanvas.getContext("2d");
var gradientImage = new Image();
gradientImage.onload = function(){ //wait for image to load before doing stuff
	colourContext.drawImage(gradientImage, 0, 0);	
}
gradientImage.src = "/static/colourGradient.png";


socket.emit('new player');

window.onresize = function(event) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	
	canvas.width = window.innerWidth-30;
	canvas.height = window.innerHeight-190;
	
	image.onload = function(){ //wait for image to load before doing stuff
		context.drawImage(image, 0, 0, canvas.width, canvas.height);	
	}
	
	
};

document.addEventListener('mousedown', function(event) {
	draw.active = true;
	
	
	var rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;
	draw.x = (event.clientX - rect.left) * scaleX+10;
	draw.y = (event.clientY - rect.top) * scaleY + 10;
});

document.addEventListener('touchstart', function(event) {
	draw.active = true;
	var rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;
	draw.x = (event.changedTouches[0].pageX - rect.left) * scaleX+10;
	draw.y = (event.changedTouches[0].pageY - rect.top) * scaleY + 10;
});

document.addEventListener('touchmove', function(event) {
	draw.active = true;
	var rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;
	draw.x = (event.changedTouches[0].pageX - rect.left) * scaleX+10;
	draw.y = (event.changedTouches[0].pageY - rect.top) * scaleY + 10;
});

document.addEventListener('mouseup', function(event) {
	draw.active = false;
});

document.addEventListener('touchend', function(event) {
	draw.active = false;
});

onmousemove = function(e){
	if (e != undefined){
		var rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;
		draw.x = (event.clientX - rect.left) * scaleX+10;
		draw.y = (event.clientY - rect.top) * scaleY + 10;
	}
}

setInterval(function() {
	// This logic is making sure that it is within the bounds of the canvas AND that the cursor is in a new position (waste of memory to draw same place twice)
	if (draw.x > 0 && draw.x < (window.innerWidth+30) && draw.y>0 && draw.y < (window.innerHeight+30) && draw.active == true){
		if (draw.x != draw.prevx || draw.y != draw.prevy){
			//prevent console editing values
			if (draw.size > 20){
				draw.size = 20;
			}
			context.beginPath();
			context.fillStyle = color;
			context.arc(draw.x-12, draw.y-10, draw.size*Math.min((window.innerHeight-190)/780, (window.innerWidth-30)/1850), 10, 0, 2 * Math.PI);
			context.fill();
			//it draws circles and then draws rectangles in between each circle to make for a smoother appearence
			if (draw.drawprev == true){
				context.beginPath();
				context.strokeStyle = color;
				context.lineWidth = draw.size*2*Math.min(window.innerHeight/780, window.innerWidth/1850);
				context.moveTo(draw.x-12,draw.y-10);
				context.lineTo(draw.prevx-12,draw.prevy-10);
				context.stroke();
			}
			var rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;
			drawList.push([((draw.x-10)/scaleX + rect.left)/ canvas.width,((draw.y-10)/scaleY + rect.top)/canvas.height, ((draw.prevx-10)/scaleX + rect.left)/canvas.width, ((draw.prevy-10)/scaleY + rect.top)/canvas.height, draw.drawprev ? 1:0,draw.size]);
			draw.drawprev = true;
			draw.prevx = draw.x;
			draw.prevy = draw.y;
		}
	} else{
		draw.drawprev = false;
	}
	// emits every 4 ticks, and it sends a whole batch of draw requests rather than one at a time
	// this functionality is to reduce resource use
	if (timer == 4){
		timer = 0;
		if (drawList.length != 0){
			socket.emit('drawing', drawList, color);
			drawList = []
		}
	}
	timer += 1;
}, 0);

// When the user clicks the 'colour canvas' (colour picker) it gets the color info at that position and sets color equal to it
colourCanvas.onclick = function(mouseEvent){
	imgData = colourContext.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
	dataStored = imgData.data;
	color = "rgba("+dataStored[0]+","+dataStored[1] + "," + dataStored[2] + "," + dataStored[3] + ")";
}

// timeout to prevent abuse
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

//creates a new div and appends new players to it (this is for the player list)
function addRow(named) {
  const div = document.createElement('div');
  div.className = 'inline';
  div.innerHTML = `
    <p id = '`+named+`'> `+named+` </p>
 
  `;
  document.getElementById('players').appendChild(div);
}

//remove from player list when disconnects
function removeRow(elementId) {
	var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function changeSize(size) {
	//draw.active = false to prevent clicking size slider and drawing around with varying widths
	draw.active = false;
	draw.size = size;
}

//toggle for download button
function toggleDownload(){
	if (download == false){
		download = true;
	}else{
		download = false;
	}
}

//same drawing logic as before but with requests from the server
socket.on('drawnew', function(details, fillStyle) {
	
	for (i=0; i<details.length; i++){
		context.beginPath();
		context.fillStyle = fillStyle
		
		rect = canvas.getBoundingClientRect(), scaleX = canvas.width/rect.width, scaleY = canvas.height / rect.height;

		details[i][0] *= canvas.width;
		details[i][1] *= canvas.height;
		details[i][2] *= canvas.width;
		details[i][3] *= canvas.height;

		


		context.arc(details[i][0]-12, details[i][1]-10, details[i][5]*Math.min(window.innerHeight/780, window.innerWidth/1850), 10, 0, 2 * Math.PI);
		context.fill();
		if (details[i][4] == 1){
			context.beginPath();
			context.strokeStyle = fillStyle;
			context.lineWidth = details[i][5]*2*Math.min(window.innerHeight/780, window.innerWidth/1850);
			context.moveTo(details[i][0]-12,details[i][1]-10);
			context.lineTo(details[i][2]-12,details[i][3]-10);
			context.stroke();
		}
	}
});

//clearing the board
socket.on('clearrect', function() {
	//when download is true it downloads the image as an octet stream
	if (download == true){
		var link = document.getElementById('link');
		link.setAttribute('download', 'canvas.png');
		link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
		link.click();
	}
	//draw white square then return to previous selected colour
	var store = context.fillStyle;
	context.fillStyle = 'white'
	context.fillRect(0, 0, 9999, 9999);
	context.fillStyle = store;
});

//insert and remove players
socket.on('insert', function(named) {
	addRow(named);
});

socket.on('remove', function(idremove) {
	removeRow(idremove);
});

//sends the image data to new user
socket.on('updateNewPlayer', function() {
	socket.emit('canvasData',canvas.toDataURL("image/png"));
});

//draws the image the new user recieves
socket.on('canvasUpdate', function(canvasData) {
	var canvasImage = new Image();
	canvasImage.onload = function(){ //wait for image to load before doing stuff
		context.drawImage(canvasImage, 0, 0, window.innerWidth+20, window.innerHeight-190);	
	}
	canvasImage.src = canvasData;
});

