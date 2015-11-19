/********************* Server stuff *********************/
var http = require('http');
var io = require('socket.io');

var httpServer = http.createServer(function(request,response){
 response.writeHead(200, {'Content-Type': 'text/plain'});
 response.end("This is the node.js HTTP server.");
});

httpServer.listen(9000,function(){
 console.log('Server has started listening on port 9000');
});

ioServer = io.listen(httpServer, { log: false });

var players = {};

ioServer.sockets.on('connection', function(socket){
	
	socket.on('player_connect', function(data){
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
	});

	//Game Loop
	setInterval(function(){
		socket.emit('players_position', players);
	}, 60);

});

/********************* Player class *********************/
Player = function(id,name,x,y){
    var self = {
        id:id,
        name:name,
        x:x,
        y:y
    };
    return self;
}
