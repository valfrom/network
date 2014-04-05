
var URL = 'http://localhost:9090';
// var URL = 'http://ios.keitaitoys.com:9090';
var REQUESTS_MAX = 2;

var Network = function(url) {
	this.url = url;
	this.counter = 0;
	this.pingTime = 0;
}

Network.prototype.ping = function() {
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
		});

		socket.on('gameInfo', function (msg) {
			game.networkUpdate(msg);
			network.counter = 0;
		});

		network.ping();
		game.active = true;
	});

	socket.on('disconnect', function () {
		network.start(game);
	});
}

Network.prototype.update = function() {
	if(this.counter < REQUESTS_MAX)  {
		this.counter ++;
		this.ping();
	}
}

var network = new Network(URL);

network.start(game);