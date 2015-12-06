// Setting up variables for server.
var http = require('http').createServer(serverHandler);
var ioServer = require('socket.io').listen(http, { log: false });
var fs = require('fs');

var mapFile = require('./map');
var itemFile = require('./Item')

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
                //players[foundPlayer.name].inventory.push(new WeaponItem(itemName.SWORD, 0, 0));
              
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

//For testing
function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}

var map = mapFile.getMap();
var players = {};
var items = {};

/********************* Player class *********************
    ID: socket.id of client
    Name: player name
    x: x-coordinate
    y: y-coordinate
*/

var ItemTypeEnum = {
  WEAPON: 1,
  HELTH: 2
};

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
    self.inventory = [];
    return self;
}

/********************* Item class *********************/
Item = function(id,name, itemType, x, y, img){
    var self = {
        id:id,
        name:name,
        itemType:itemType,
        x:x,
        y:y,
        img:img
    };
    return self;
}

items[12347] = new Item(12347,'axe', ItemTypeEnum.WEAPON, 1868, 594, 'axes');
items[12348] = new Item(12348,'scimitar', ItemTypeEnum.WEAPON, 2358, 788, 'swords2');
items[12350] = new Item(12350,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
items[12351] = new Item(12351,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
items[12352] = new Item(12352,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
items[12353] = new Item(12353,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
items[12354] = new Item(12354,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
items[12355] = new Item(12355,'axe', ItemTypeEnum.WEAPON, 1768, 1148, 'axes');
