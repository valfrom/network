
//var URL = 'http://localhost:9090';
var URL = 'http://ios.keitaitoys.com:9090';

var Network = function(url) {
	this.url = url;
	this.pingTime = 0;
	this.actorId = 0;
	this.sendingPing = false;
}

Network.prototype.ping = function() {
	if(this.sendingPing) {
		return;
	}
	this.sendingPing = true;
	this.startDate = new Date();
	this.socket.send("hi");
}

Network.prototype.start = function(game) {
	var socket = io.connect(this.url);

	this.socket = socket;

	socket.on('connect', function () {

		socket.on('message', function () {
			var now = new Date();
			network.pingTime = (now.getTime()-network.startDate.getTime());
			network.sendingPing = false;
		});

		socket.on('actorId', function (id) {
			network.actorId = id;
		});

		socket.on('gameInfo', function (msg) {
			game.networkUpdate(msg);
		});

		network.ping();
		game.active = true;
	});

	socket.on('disconnect', function () {
		network.start(game);
	});
}

Network.prototype.update = function() {
	this.ping();
}

Network.prototype.sendInput = function(pos) {
	this.socket.emit('input', pos);
}

var network = new Network(URL);

network.start(game);