// Setting up variables for server.
var http = require('http').createServer(serverHandler);
var ioServer = require('socket.io').listen(http, { log: false });
var fs = require('fs');

var mapFile = require('./map');

http.listen('9000'); // Listen on port 9000.

// Setting up mongoDB database using mongoose.
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error:'));
db.once('open', function (callback) {
    console.log("DB connection OK");
});

// Schema used by mongoose to define items stored in db.
var playerSchema = new mongoose.Schema({
  name:  { type: String },
  x: Number,
  y: Number,
  healthPoints: Number,
  inventory: {item1: Number, item2: Number, item3: Number, item4: Number, item5: Number } // ID numbers of items.
});

var nPlayer = mongoose.model('nPlayer', playerSchema);

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
        //socket.emit('init_game', map, players, items); // Send array with already connected players.
		console.log('Client connected: ' + data.name + '. With socket id:' + socket.id);

        // Check if player is in DB.
        nPlayer.findOne({ name: data.name }, function(err, oldPlayer) {
          if (err) return console.error(err); // Error handling
              if(!oldPlayer) { // If not found in DB create new player. (oldPlayer = NULL)
                  console.log('Player NOT found in DB.'); // For testing only
                  var newPlayer = new nPlayer({
                                        name: data.name, 
                                        x: 900, 
                                        y: 900, 
                                        healthPoints: 100, 
                                        inventory: {item1: 1,  // 1 for starting sword
                                                    item2: 0, 
                                                    item3: 0, 
                                                    item4: 0, 
                                                    item5: 0 } 
                    });

                    // Save the new player to db.
                    newPlayer.save(function (err, newPlayer) {
                      if (err) return console.error(err); // Error handling
                      //console.dir(newPlayer); // Prints whats been saved to DB. Remove later.
                    });
                    tempPlayer = new Player(socket.id, data.name, newPlayer.x, newPlayer.y);
                    players[data.name] = tempPlayer; // Adds new player to array
            
                } else {
                    console.log('Player found in DB.'); // For testing only
                    // Draw the old player
                    tempPlayer = new Player(socket.id, data.name, oldPlayer.x, oldPlayer.y);
                    players[data.name] = tempPlayer;
                }
                socket.emit('init_game', map, players, items, tempPlayer); // Send array with already connected players.
                socket.broadcast.emit('player_connect', {'name' : data.name, 'x' : data.x, 'y' : data.y}); // Tell other clients of new player.
        });
	});

    // Handles player disconnects
    // Stores players position when player disconnects.
    socket.on('disconnect', function() {
        for (key in players){
            if(players[key].id  == socket.id){
                console.log('Client disconnected: ' + key);
                // Find the player i database and update his position.
                nPlayer.findOne({ name: players[key].name }, function(err, discPlayer) {
                    if (err) return console.error(err); // Error handling
                        if(!discPlayer) { 
                            console.log('ERROR: Player not found in db while disconnecting.')
                        } else {
                            //discPlayer.x = players[key].x;
                            //discPlayer.y = players[key].y;
                        }
                });
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


var map = mapFile.getMap();
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
