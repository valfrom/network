var TICK_TIME = 1000/60;

var Game=function() {
	this.actors = {};
}

Game.prototype.update = function(dt) {
	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.update(dt);
	}
}

Game.prototype.render = function(ctx) {
	gctx.fillStyle = "rgb(100, 120, 100)";
	gctx.fillRect(0, 0, 640, 440);

	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.render(gctx);
	}
}

Game.prototype.spawnActor = function(actor) {
	actor.game = this;
	this.actors[actor.id] = actor;
}

Game.prototype.networkUpdate = function(data) {
	for(var id in data) {
		var actor = this.actors[id];
		var val = data[id];
		actor.x = val.x;
		actor.y = val.y;
		actor.speed = val.speed;
	}
}


var game = new Game();

var a1 = new Actor("1");
var a2 = new Actor("2");

game.spawnActor(a1);
game.spawnActor(a2);


setInterval(function() {
	game.update(TICK_TIME);
	game.render();
	network.update();
}, TICK_TIME);