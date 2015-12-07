/***** Game Settings *****/
var tileSize = 32;
var canvasWidth = tileSize*30;
var canvasHeight = tileSize*20;

var lastFrameTimeMs = 0;
var maxFPS = 50;
var delta = 0;
var timestep = 1000 / 50;
/*************************/

var canvas = null;
var ctx = null; //canvas context variable
var mapCtx = null;
var player = null;
var socket = null;
var mapLayer1 = null;
var mapLayer2 = null;

socket = io.connect('http://127.0.0.1:9000/');

var players = {};
var items = {};

var Img = {};
Img.map0001 = new Image();
Img.map0001.src = "client/images/ground_tiles.png";
Img.map0002 = new Image();
Img.map0002.src = "client/images/graphics-tiles-waterflow.png";
Img.map0003 = new Image();
Img.map0003.src = "client/images/beach_sand_woa.png";
Img.map0004 = new Image();
Img.map0004.src = "client/images/beach_sand_woa3.png";
Img.map0005 = new Image();
Img.map0005.src = "client/images/object-layer.png";
Img.map0006 = new Image();
Img.map0006.src = "client/images/Cliff_tileset.png";
Img.map0007 = new Image();
Img.map0007.src = "client/images/mountain_landscape.png";

Img.player = new Image();
Img.player.src = "client/images/player.png";
Img.sword = new Image();
Img.sword.src = "client/images/sword.png";
Img.scimitar = new Image();
Img.scimitar.src = "client/images/scimitar.png";
Img.axe = new Image();
Img.axe.src = "client/images/axe.png";

Img.hp100 = new Image();
Img.hp100.src = "client/images/hp100.png";

/**
 * Initialization function
 *
 */
$(document).ready(function(){
    
    canvas = $('#game-canvas').get(0);
    
    var mapCanvas = $('#map-canvas').get(0);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    mapCanvas.width = 138;
    mapCanvas.height = 138;
    
    ctx = canvas.getContext('2d');
    mapCtx = mapCanvas.getContext('2d');
    
    ctx.textAlign="center";
    ctx.font='bold 12px Arial';
    mapLayer1 = getMapLayer1();
    mapLayer2 = getMapLayer2();
    
    //Load sound file with the detected extension
    var sound = new Audio();
    sound.src = "/client/music/Main.mp3";
    sound.play();
});

/**
 * function for updating movement of the player.
 *
 */
function update(delta) {
    player.update(delta);
    if(player.moveLeft || player.moveUp || player.moveRight || player.moveDown){
        emitMoved();
    }
}

/**
 * Draws the canvas. (Clears it then draws the map then the players)
 *
 */
function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawMap();
    player.draw();
    drawPlayers();
    drawItems();
}

function drawMap(){
    var mapValue = null;
    var mapImage = null;
    
    var tileX = 0;
    var tileY = 0;
    
    var restY = player.y % tileSize;
    tileY -= restY;
    for(y = Math.floor(player.y / tileSize - 11); y < Math.floor(player.y / tileSize + 11); y++){
        var restX = player.x % tileSize;
        tileX -= restX;
        for(x = Math.floor(player.x / tileSize - 16); x < Math.floor(player.x / tileSize + 16); x++){
            
            mapValue = mapLayer1[y][x].toString();
            mapImage = "map"+mapValue.substr(5,4);
            ctx.drawImage(Img[mapImage], mapValue.substr(9,3), mapValue.substr(12,3), 32, 32, tileX, tileY, tileSize, tileSize);

            mapValue = mapLayer2[y][x].toString();
            if(mapValue !== "100000000000000"){
                mapImage = "map"+mapValue.substr(5,4);
                ctx.drawImage(Img[mapImage], mapValue.substr(9,3), mapValue.substr(12,3), 32, 32, tileX, tileY, tileSize, tileSize);
            }
            
            tileX += tileSize;
        }
        tileX = 0;
        tileY += tileSize;
    }
}

/**
 * Game main loop!
 * Calculates time since last frame was drawn then updates the world since that time.
 * 
 *
 */
function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;
    }
    draw();
    requestAnimationFrame(mainLoop);
}

/**
 * Key is pressed and detected
 * perform player action for the keypress
 * example: left arrow -> player moves left.
 */ 
document.onkeydown = function(event){
    switch(event.keyCode){
        case 37:
            event.preventDefault();
            player.moveLeft = true;
            break;
        case 38:
            event.preventDefault();
            player.moveUp = true;
            break;
        case 39:
            event.preventDefault();
            player.moveRight = true;
            break;
        case 40:
            event.preventDefault();
            player.moveDown = true;
            break;
        case 32:
            event.preventDefault();
            player.SpaceButton();
            break;
        case 81:
            event.preventDefault();
            player.switchWeapon();
            updateInventory();
            break;
    }
};

/**
 * Key is released
 * stops performing player action for the keypress
 * example: left arrow -> player stops moving left.
 */
document.onkeyup = function(event){
    switch(event.keyCode){
        case 37:
            player.moveLeft = false;
            break;
        case 38:
            player.moveUp = false;
            break;
        case 39:
            player.moveRight = false;
            break;
        case 40:
            player.moveDown = false;
            break;
    }
};

/**
 * Mouse press action
 */
document.onmousedown = function(mouse){
    //Function to get map value when clicking on a tile
	if(mouse.which === 1 && player !== null){
        var rect = canvas.getBoundingClientRect();
        var mouseX = mouse.clientX - rect.left;
        var mouseY = mouse.clientY - rect.top;
        
        var playerXTile = player.x / 32 - 1;
        var playerYTile = player.y / 32 - 1;
        
        var clickedTileX = Math.floor(playerXTile + (mouseX - (canvasWidth / 2)) / 32);
        var clickedTileY = Math.floor(playerYTile + (mouseY - (canvasHeight / 2)) / 32);
        
        console.log(mapLayer1[clickedTileY][clickedTileX]);
    }
}

/**
 * Draws all players
 * 
 */
function drawPlayers(){
    var currentSprite = 0;
    for (var key in players) {
        var xDelta = players[key].x - player.x;
        var yDelta = players[key].y - player.y;
        if(Math.abs(xDelta) < tileSize * 16 && Math.abs(yDelta) < tileSize * 11){
            currentSprite = Math.floor(players[key].animationCounter) % 3;
            
            if(players[key].direction == 1){
                ctx.drawImage(Img.swords,32*Math.floor(players[key].animationCounterWeapon),0,32,32,canvasWidth/2+xDelta+tileSize-10,canvasHeight/2+yDelta+5,tileSize,tileSize);
            }else if(players[key].direction == 3){
                ctx.drawImage(Img.sword,32*Math.floor(players[key].animationCounterWeapon),32,32,32,canvasWidth/2+xDelta-tileSize+25,canvasHeight/2+yDelta+8,tileSize,tileSize);
            }else if(players[key].direction == 0){
                ctx.drawImage(Img.sword,32*Math.floor(players[key].animationCounterWeapon),64,32,32,canvasWidth/2+xDelta+tileSize-12,canvasHeight/2+yDelta+4,tileSize,tileSize);
            }
            
            ctx.fillText(players[key].name,canvasWidth/2+xDelta+22, canvasHeight/2+yDelta-8);
            ctx.drawImage(Img.player,48*currentSprite,52*players[key].direction,52,52,canvasWidth/2+xDelta,canvasHeight/2+yDelta,50,50);
            
            if(players[key].direction == 2){
                ctx.drawImage(Img.sword,32*Math.floor(players[key].animationCounterWeapon),64,32,32,canvasWidth/2+xDelta-tileSize+28,canvasHeight/2+yDelta+10,tileSize,tileSize);
            }
        }
    }
}

function drawItems(){
    for(var key in items){
        var xDelta = items[key].x - player.x;
        var yDelta = items[key].y - player.y;
        
        var itemImage = Img[items[key].img];
        
        if(Math.abs(xDelta) < tileSize * 16 && Math.abs(yDelta) < tileSize * 11){
            ctx.drawImage(itemImage,0,0,32,32,canvasWidth/2+xDelta,canvasHeight/2+yDelta,32,32);
        }
    }
}

/**
 * Sends to node that this player whas moved.
 * 
 */
function emitMoved(){
    socket.emit('player_move', { 'name' : player.name , 'x' : player.x , 'y' : player.y, 'direction' : player.direction, 'animationCounter' : player.animationCounter, 'animationCounterWeapon' : player.animationCounterWeapon});
}

/**
 * Gets all the other players from the server and places them in the players array.
 * 
 */
socket.on('init_game', function (mapFromServer, playerList, itemList, tempPlayer){
    //map = mapFromServer;
    player = new Player(tempPlayer.name, tempPlayer.x, tempPlayer.y, 50, 50, 0.1);
    
    for (var key in playerList) {
        if(playerList[key].name == player.name){ continue; }
        players[key] = playerList[key];
    }
    for (var key in itemList) {
        items[key] = itemList[key];
    }
    
    player.inventory = tempPlayer.inventory;
    player.activeWeapon = 0;
    
    $("#startpage").hide();
    $("#game-canvas").css({"height": canvasHeight, "width": canvasWidth, "visibility": "visible"});
    $("#map-canvas").css({"height": 138, "width": 138, "visibility": "visible"});
    $("#inventory-div").css({"height": 68, "width": 128, "visibility": "visible"});
    
    updateInventory();
    initMiniMap();
    
    requestAnimationFrame(mainLoop);
});

function updateInventory(){
    $("#inventory-div").html("");
    for(var i = 0, len = player.inventory.length; i < len; i++){
        if(player.activeWeapon == i){
            $("#inventory-div").append("<div id='inventory-item-"+i+"' style='width:32px; height:32px; background-repeat: no-repeat; float:left; background-color: #404040; border-radius: 5px;'></div>");   
        }else{
            $("#inventory-div").append("<div id='inventory-item-"+i+"' style='width:32px; height:32px; background-repeat: no-repeat; float:left;'></div>");
        }
        $("#inventory-item-"+i).css("background-image", "url("+Img[player.inventory[i].img].src+")");   
    } 
}

function initMiniMap(){
    var mapValue = null;
    var mapImage = null;
    
    var tileX = 0;
    var tileY = 0;
    
    for(y = 0; y < mapLayer1.length; y++){

        for(x = 0; x < mapLayer1[0].length; x++){
            
            mapValue = mapLayer1[y][x].toString();
            mapImage = "map"+mapValue.substr(5,4);
            
            if(Img[mapImage] == undefined) console.log(mapValue);

            mapCtx.drawImage(Img[mapImage], mapValue.substr(9,3), mapValue.substr(12,3), 32, 32, tileX, tileY, tileSize/35, tileSize/35);

            mapValue = mapLayer2[y][x].toString();
            if(mapValue !== "100000000000000"){
                mapImage = "map"+mapValue.substr(5,4);
                mapCtx.drawImage(Img[mapImage], mapValue.substr(9,3), mapValue.substr(12,3), 32, 32, tileX, tileY, tileSize/35, tileSize/35);
            }
            
            tileX += tileSize/35;
        }
        tileX = 0;
        tileY += tileSize/35;
    }
}

/**
 * Gets a newly connected player from the server and places it in the players array.
 * 
 */
socket.on('player_connect', function (data){
    players[data.name] = new Player(data.name,data.x,data.y,50,50,0.1);
});

/**
 * Gets a newly disconnected player from the server and removes it from the players array.
 * 
 */
socket.on('player_disconnect', function (data){
    delete players[data.name];
});

/**
 * Gets a players positions from the server.
 *
 */
socket.on('players_positions', function (data){
    if(players[data.name] != undefined){
        players[data.name].x = data.x;
        players[data.name].y = data.y;
        players[data.name].direction = data.direction;
        players[data.name].animationCounter = data.animationCounter;
        players[data.name].animationCounterWeapon = data.animationCounterWeapon;
    }
});

function login(){
    var name = $("#username-login-input").val();
    var password = $("#password-login-input").val();
    socket.emit('player_login', { 'name' : name, 'password' : password});
}

function signup(){
    var name = $("#username-signup-input").val();
    var password = $("#password-signup-input").val();
    socket.emit('player_signup', { 'name' : name, 'password' : password});
}

socket.on('player_signed_up', function(data){
    $("#name-already-in-use-text").hide();
    $("#player-not-found-text").hide();
    $("#signed-up-text").html("Signed up with username: " + data.name);
    $("#signed-up-text").show();
    $("#username-signup-input").val("");
    $("#password-signup-input").val("");
});

socket.on('player_not_found', function (){
    $("#username-login-input").val("");
    $("#password-login-input").val("");
    $("#name-already-in-use-text").hide();
    $("#player-not-found-text").show();
});

socket.on('name_already_in_use', function(){
    $("#username-signup-input").val("");
    $("#password-signup-input").val("");
    $("#player-not-found-text").hide();
    $("#name-already-in-use-text").show();
});

var ItemTypeEnum = {
  WEAPON: 1,
  HELTH: 2
};


function WeaponItem(id,name,itemType, img, x, y, dmg){
    this.id = id;
    this.name = name;
    this.itemType = ItemTypeEnum.WEAPON;
	this.x = x;
	this.y = y;
    this.img = img;
	this.dmg = dmg;
}

function DrinkItem(id,name,itemType, img, x, y, amount){
    this.id = id;
    this.name = name;
    this.itemType = ItemTypeEnum.DRINK;
	this.x = x;
	this.y = y;
    this.img = img;
	this.amount = amount;
}
    
function getItemImage(item) {
	return Img[item.img];
}