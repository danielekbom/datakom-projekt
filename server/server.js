var http = require('http').createServer(serverHandler);
var ioServer = require('socket.io').listen(http, { log: false });
var fs = require('fs');

http.listen('9000');

var defaultUrl = "/index.html";
var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
};

var getExtension = function(url){
	try{
		var extensionRegex = /^.*(\.[a-z]*)$/i;
		return url.match(extensionRegex)[1];
	}catch(e){
		return '.html';
	}
};

function serverHandler (req, res) {
	var url = req.url === "/" ? defaultUrl: req.url;

  	fs.readFile('.' + url,
	  	function (err, data) {
	    	if (err) {
	    		console.log(err);
	      	res.writeHead(404);
	      	return res.end('File not founddd');
	    	}
			res.writeHead(200, {"Content-Type": contentTypesByExtension[getExtension(req.url)]});
		 	res.end(data);
  });
}

var players = {};

ioServer.sockets.on('connection', function(socket){
	
	socket.on('player_connect', function(data){
        socket.emit('init_players', players);
		players[data.name] = new Player(socket.id, data.name, data.x, data.y);
		socket.broadcast.emit('player_connect', {'name' : data.name, 'x' : data.x, 'y' : data.y});
		console.log('Client connected: ' + data.name);
	})
    
    socket.on('player_disconnect', function(){
		for (key in players){
			if(players[key].socketId  == socket.id){
				console.log('Client disconnected: ' + key);
				socket.broadcast.emit('player_disconnect', {'name' : players[key].name});
				delete players[key];
			}
		}
	})

	socket.on('player_move', function (data){
		players[data.name].x = data.x;
		players[data.name].y = data.y;
        players[data.name].direction = data.direction;
        players[data.name].animationCounterWeapon = data.animationCounterWeapon;
        socket.broadcast.emit('players_positions', {'name' : data.name, 'x' : data.x, 'y' : data.y, 'direction' : data.direction, 'animationCounter' : data.animationCounter, 'animationCounterWeapon' : data.animationCounterWeapon});
	});

	//setInterval(function(){
	//	socket.broadcast.emit('players_positions', players);
	//}, 60);

});

/********************* Player class *********************/
Player = function(id,name,x,y){
    var self = {
        id:id,
        name:name,
        x:x,
        y:y
    };
    self.direction = 2;
    self.animationCounter = 0;
    self.animationCounterWeapon = 0;
    return self;
}
