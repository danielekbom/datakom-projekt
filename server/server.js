// Setting up variables for server.
var http = require('http').createServer(serverHandler);
var ioServer = require('socket.io').listen(http, { log: false });
var fs = require('fs');

http.listen('9000'); // Listen on port 9000.

var defaultUrl = "/index.html";

// Filetypes we want to be able to return to client.
var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
};

/* getExternsion
Gets URL and returns fileextension.
If none found return .html
*/
var getExtension = function(url){
	try{
		var extensionRegex = /^.*(\.[a-z]*)$/i;
		return url.match(extensionRegex)[1];
	}catch(e){
		return '.html';
	}
};

/* serverHandler
Gets a request for a file and returns the data of the file.
*/
function serverHandler (req, res) {
	var url = req.url === "/" ? defaultUrl: req.url; // If no specific URL asked for send defaultUrl.

    //Return file
  	fs.readFile('.' + url,
	  	function (err, data) {
	    	if (err) {
	    		console.log(err);
	      	res.writeHead(404);
	      	return res.end('File not found.');
	    	}
			res.writeHead(200, {"Content-Type": contentTypesByExtension[getExtension(req.url)]});
		 	res.end(data);
  });
}

// Handles connections to the port we are listening to.
ioServer.sockets.on('connection', function(socket){
    
	socket.on('player_connect', function(data){
        socket.emit('init_players', players, items); // Send array with already connected players.
		players[data.name] = new Player(socket.id, data.name, data.x, data.y); // Adds new player to array
		socket.broadcast.emit('player_connect', {'name' : data.name, 'x' : data.x, 'y' : data.y}); // Tell other clients of new player.
		console.log('Client connected: ' + data.name + '. With socket id:' + socket.id);
	});

    // Handles player disconnects
    socket.on('disconnect', function() {
        for (key in players){
            if(players[key].id  == socket.id){
                console.log('Client disconnected: ' + key);
                socket.broadcast.emit('player_disconnect', {'name' : players[key].name});
                delete players[key];
            }
        }
    });
    
    socket.on('timeout', function() {
        for (key in players){
            if(players[key].id  == socket.id){
                console.log('Client disconnected (Timeout): ' + key);
                socket.broadcast.emit('player_disconnect', {'name' : players[key].name});
                delete players[key];
            }
        }
    });

	socket.on('player_move', function (data){
		players[data.name].x = data.x;
		players[data.name].y = data.y;
        players[data.name].direction = data.direction;
        players[data.name].animationCounterWeapon = data.animationCounterWeapon;
        socket.broadcast.emit('players_positions', {'name' : data.name, 'x' : data.x, 'y' : data.y, 'direction' : data.direction, 'animationCounter' : data.animationCounter, 'animationCounterWeapon' : data.animationCounterWeapon});
	});
    
    socket.on('player_die', function (data){
        // TODO
    });

    socket.on('player_attack', function(data) {
        // TODO
    });
    
	//setInterval(function(){
	//	socket.broadcast.emit('players_positions', players);
	//}, 60);

});


var players = {};
var items = {};

/********************* Player class *********************
    ID: socket.id of client
    Name: player name
    x: x-coordinate
    y: y-coordinate
*/
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
    self.healthPoints = 100;
    return self;
}

/********************* Item class *********************/
Item = function(id,name,x,y){
    var self = {
        id:id,
        name:name,
        x:x,
        y:y
    };
    return self;
}

items[12345] = new Item(12345,'Axe', 1000, 1000);
items[12346] = new Item(12346,'Axe', 1500, 1500);
