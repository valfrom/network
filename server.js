var TICK_TIME = 1000/100;
var REQUESTS_MAX = 3;
var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 440;
var MAX_SPEED = 4;
var REQUEST_MIN_TIME = 1000;
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

var Client = function(socket) {
	this.date = new Date();
	this.counter = 0;
	this.socket = socket;
	var a = new Actor(actorId++);
	a.x = Math.random() * 640;
	a.y = Math.random() * 300 + 20;
	a.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	a.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;

	game.spawnActor(a);
	this.actor = a;

	socket.emit('actorId', a.id);
}

Client.prototype.onDisconnect = function() {
	game.destroyActor(this.actor.id);
}

Client.prototype.onInput = function(pos) {
	this.actor.x = pos.x;
	this.actor.y = pos.y;
	this.actor.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	this.actor.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
}

Client.prototype.onMessage = function(msg) {
	this.counter = 0;
	this.socket.send("hi");
}

Client.prototype.update = function(gameInfo) {
	var now = new Date();
	if(this.counter < REQUESTS_MAX || (now.getTime() - this.date.getTime()) > REQUEST_MIN_TIME) {
		this.counter ++;
		this.date = now;
		this.socket.emit('gameInfo', gameInfo);
	}
}

var game = new Game();

var io = require('socket.io').listen(9090);
var clients = [];

io.sockets.on('connection', function (socket) {
	var client = new Client(socket);
	clients.push(client);
	game.active = clients.length != 0;

	socket.on('message', function (msg) { 
		client.onMessage(msg);
	});

	socket.on('input', function (pos) { 
		client.onInput(pos);
	});

	socket.on('disconnect', function () {		
		var index = clients.indexOf(client);
		if(index != -1) {
			clients.splice(index);
		}
		game.active = clients.length != 0;
		client.onDisconnect();
	});
});

console.log("Server started..");

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	var gameInfo = game.gameInfo();
	for(var i=0;i<clients.length;i++) {
		var client = clients[i];
		client.update(gameInfo);
	}
}, TICK_TIME);
