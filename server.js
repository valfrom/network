var TICK_TIME = 1000/100;
var REQUESTS_MAX = 3;
var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 440;
var MAX_SPEED = 4;
var actorId = 1;

var Actor = function(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.speed = {x:0, y:0};
	this.active = false;
}

Actor.prototype.update = function(dt) {
	this.x = this.x + this.speed.x * dt;
	this.y = this.y + this.speed.y * dt;

	if(this.x > SCREEN_WIDTH && this.speed.x > 0) {
		this.speed.x = -this.speed.x;
	} else if(this.x < 0 && this.speed.x < 0) {
		this.speed.x = -this.speed.x;
	}

	if(this.y > SCREEN_HEIGHT && this.speed.y > 0) {
		this.speed.y = -this.speed.y;
	} else if(this.y < 0 && this.speed.y < 0) {
		this.speed.y = -this.speed.y;
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

Game.prototype.destroyActor = function(id) {
	console.log("DestroyActor: "+id);
	delete this.actors[id];
}

Game.prototype.gameInfo = function() {
	var result = {};
	for(var id in this.actors) {
		var actor = this.actors[id];
		result[id] = {x:actor.x, y:actor.y, speed:actor.speed};
	}
	result = {actors:result};
	return result;
}

var game = new Game();

var io = require('socket.io').listen(9090);
var sockets = [];

io.sockets.on('connection', function (socket) {
	sockets.push(socket);
	game.active = sockets.length != 0;
	var a = new Actor(actorId++);
	a.x = Math.random() * 640;
	a.y = Math.random() * 300 + 20;
	a.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	a.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;

	game.spawnActor(a);

	socket.emit('actorId', a.id);

	socket.on('message', function () { 
		socket.counter = 0;
		socket.send("hi");
	});

	socket.on('input', function (pos) { 
		a.x = pos.x;
		a.y = pos.y;
		a.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
		a.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	});

	socket.on('disconnect', function () {		
		var index = sockets.indexOf(socket);
		if(index != -1) {
			sockets.splice(index);
		}
		game.active = sockets.length != 0;
		game.destroyActor(a.id);
	});
});

console.log("Server started..");

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	var gameInfo = game.gameInfo();
	for(var i=0;i<sockets.length;i++) {
		var socket = sockets[i];
		if(socket.counter < REQUESTS_MAX) {
			socket.counter ++;
			socket.emit('gameInfo', gameInfo);
		}
	}
}, TICK_TIME);
