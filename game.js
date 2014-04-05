var TICK_TIME = 1000/60;

var Game=function() {
	this.actors = {};
	this.active = false;
}

Game.prototype.update = function(dt) {
	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.myActor = (network.actorId == id);
		actor.update(dt);
	}
}

Game.prototype.render = function(ctx) {
	gctx.fillStyle = "rgb(100, 120, 100)";
	gctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	gctx.font = "20px Arial";
	gctx.fillStyle = "rgb(0, 0, 0)";
	gctx.fillText(network.pingTime+"ms", 10, 30);

	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.render(gctx);
	}
}

Game.prototype.spawnActor = function(actor) {
	actor.game = this;
	this.actors[actor.id] = actor;
}

Game.prototype.destroyActor = function(id) {
	delete this.actors[id];
}

Game.prototype.input = function(pos) {
	network.sendInput(pos);
}

Game.prototype.networkUpdate = function(data) {
	var actorData = data.actors;
	for(var id in actorData) {
		var actor = this.actors[id];
		if(actor === undefined) {
			actor = new Actor(id);
			this.spawnActor(actor);
		}
		var val = actorData[id];
		actor.x = val.x;
		actor.y = val.y;
		actor.speed = val.speed;
	}

	var destroyedActors = {};
	for(var id in this.actors) {
		if(actorData[id] == null) {
			destroyedActors[id] = id;
		}
	}

	for(var id in destroyedActors) {
		this.destroyActor(id);
	}
}

var game = new Game();

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	game.render();
	network.update();
}, TICK_TIME);