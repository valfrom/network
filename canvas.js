var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 440;

var gcanvas = document.createElement("canvas");
var gctx = gcanvas.getContext("2d");
gcanvas.width = SCREEN_WIDTH;
gcanvas.height = SCREEN_HEIGHT;
document.body.appendChild(gcanvas);

function getMousePos(canvas, evt) {
	var rect = gcanvas.getBoundingClientRect();
	return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

gcanvas.addEventListener('mouseup', function(evt) {
	var mousePos = getMousePos(gcanvas, evt);
	game.input(mousePos);
}, false);