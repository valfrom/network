var Actor = function(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
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

Actor.prototype.render = function(ctx) {
	ctx.beginPath();
	ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
	ctx.stroke();
}