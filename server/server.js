// Setting up variables for server.
var http = require('http').createServer(serverHandler);
var ioServer = require('socket.io').listen(http, { log: false });
var fs = require('fs');

var mapFile = require('./map');

http.listen('9000'); // Listen on port 9000.

var dbPlayers = require('./models/players');

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
    
	socket.on('player_login', function(data){
        //Find player in database
        dbPlayers.findOne({ name: data.name }, function(err, foundPlayer) {
          if (err) return console.error(err);
            
          //If the player was found in the database
          if(foundPlayer) {
                //Add the player found in the database to the game
                players[foundPlayer.name] = new Player(socket.id, foundPlayer.name, foundPlayer.x, foundPlayer.y);
              
                console.log('User: ' + foundPlayer.name + ' - Connected');
                
                //Send data needed to initiate the game to the connected player
                socket.emit('init_game', map, players, items, players[foundPlayer.name]);
              
                //Tell all players about the connected player
                socket.broadcast.emit('player_connect', {'name' : foundPlayer.name, 'x' : foundPlayer.x, 'y' : foundPlayer.y}); // Tell other clients of new player.
                return;
            }
            //If player not found tell the user
            socket.emit('player_not_found');
        });
	});
    
    socket.on('player_signup', function(data){
        //Find player in database
        dbPlayers.findOne({ name: data.name }, function(err, oldPlayer) {
          if (err) return console.error(err); // Error handling
            
          //If the player was not found in the database
          if(!oldPlayer) {
              //Create the new player
              var newPlayer = new dbPlayers({
                                    name: data.name, 
                                    x: 900, 
                                    y: 900, 
                                    healthPoints: 100, 
                                    inventory: {
                                        item1: 1,  // 1 for starting sword
                                        item2: 0, 
                                        item3: 0, 
                                        item4: 0, 
                                        item5: 0
                                    } 
                                });

                // Save the new player to the database
                newPlayer.save(function (err, newPlayer) {
                  if (err) return console.error(err);
                });
                
                socket.emit('player_signed_up', {'name' : newPlayer.name});
                return;
            }
            //If player found then tell user that the name is already in use
            socket.emit('name_already_in_use');
        });
	});

    socket.on('disconnect', function() {
        //Find the player among the players
        for (key in players){
            if(players[key].id  == socket.id){
                
                //Update player position in the database
                dbPlayers.findOneAndUpdate({ name: key }, { x: players[key].x, y: players[key].y }, function(err, user) {
                    if (err) throw err;
                    console.log("User: " + user.name + " - Positions saved in database");
                });
                
                //Tell all players that the player has left the game
                socket.broadcast.emit('player_disconnect', {'name' : players[key].name});
                
                //Delete the player from the players array
                delete players[key];
                console.log("User: " + key + " - Disconnected");
            }
        }
    });
    
    socket.on('timeout', function() {
        //Find the player among the players
        for (key in players){
            if(players[key].id  == socket.id){
                
                //Update player position in the database
                dbPlayers.findOneAndUpdate({ name: key }, { x: players[key].x, y: players[key].y }, function(err, user) {
                    if (err) throw err;
                    console.log("User: " + user.name + " - Positions saved in database");
                });
                
                //Tell all players that the player has left the game
                socket.broadcast.emit('player_disconnect', {'name' : players[key].name});
                
                //Delete the player from the players array
                delete players[key];
                console.log("User: " + key + " - Disconnected (Timeout)");
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
items[12347] = new Item(12347,'Axe', 800, 800);
