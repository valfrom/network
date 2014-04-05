var TICK_TIME = 1000/10;
var REQUESTS_MAX = 2;

var Actor = function(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.speed = 1;
	this.active = false;
}

Actor.prototype.update = function(dt) {
	this.x = this.x + this.speed * dt;
	if(this.x > 640 && this.speed > 0) {
		this.x = 0;
	}
	if(this.x < 0 && this.speed < 0) {
		this.x = 640;
	}
}

var Game=function() {
	this.actors = {};
}

Game.prototype.update = function(dt) {
	if(!this.active) {
		return;
	}
	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.update(dt);
	}
}

Game.prototype.spawnActor = function(actor) {
	actor.game = this;
	this.actors[actor.id] = actor;
}

Game.prototype.gameInfo = function() {
	var result = {};
	for(var id in this.actors) {
		var actor = this.actors[id];
		result[id] = {x:actor.x, y:actor.y, speed:actor.speed};
	}
	return result;
}

var game = new Game();
var a1 = new Actor("1");
a1.x = 100;
a1.y = 100;
a1.speed = -0.3;
var a2 = new Actor("2");
a2.x = 200;
a2.y = 200;
a2.speed = 0.2;

game.spawnActor(a1);
game.spawnActor(a2);

var io = require('socket.io').listen(9090);
var sockets = [];

io.sockets.on('connection', function (socket) {
	sockets.push(socket);
	game.active = sockets.length != 0;
	socket.on('message', function () { 
		socket.counter = 0;
		socket.send("hi");
	});
	socket.on('disconnect', function () {		
		var index = sockets.indexOf(socket);
		if(index != -1) {
			sockets.splice(index);
		}
		game.active = sockets.length != 0;
	});
});

console.log("Server started..");

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	for(var i=0;i<sockets.length;i++) {
		var socket = sockets[i];
		if(socket.counter < REQUESTS_MAX) {
			socket.counter ++;
			socket.emit('gameInfo', game.gameInfo());
		}
	}
}, TICK_TIME);
