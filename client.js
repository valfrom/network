
var REQUESTS_MAX = 2;

var Network = function(url) {
	this.url = url;
	this.counter = 0;
}

Network.prototype.start = function(game) {
	var socket = io.connect(this.url);

	this.socket = socket;

	socket.on('connect', function () {
		var start = new Date();
		socket.send('hi');

		socket.on('gameInfo', function (msg) {
			var now = new Date();
			console.log("message.. "+(now.getTime()-start.getTime())+"ms ");
			console.log(msg);
			game.networkUpdate(msg);
			network.counter = 0;
		});
	});

	socket.on('disconnect', function () {
		network.start(game);
	});
}

Network.prototype.update = function() {
	if(this.counter < REQUESTS_MAX)  {
		this.counter ++;
		this.socket.send("hi");
	}
}

var network = new Network('http://localhost:9090');

network.start(game);