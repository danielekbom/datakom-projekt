/***** Game Settings *****/
var tileSize = 32;
var canvasWidth = tileSize*30;
var canvasHeight = tileSize*20;

var lastFrameTimeMs = 0;
var maxFPS = 50;
var delta = 0;
var timestep = 1000 / 50;
/*************************/

var ctx = null; //canvas context variable
var player = null;
var socket = null;
var map = null;

socket = io.connect('http://127.0.0.1:9000/');

var players = {};
var items = {};

var Img = {};
Img.ground1 = new Image();
Img.ground1.src = "client/images/ground_tiles.png";
Img.ground2 = new Image();
Img.ground2.src = "client/images/graphics-tiles-waterflow.png";
Img.ground3 = new Image();
Img.ground3.src = "client/images/beach_sand_woa.png";
Img.water1 = new Image();
Img.water1.src = "client/images/beach_sand_woa3.png";
Img.objects1 = new Image();
Img.objects1.src = "client/images/object-layer.png";
Img.player = new Image();
Img.player.src = "client/images/player.png";
Img.swords = new Image();
Img.swords.src = "client/images/swords.png";
Img.axes = new Image();
Img.axes.src = "client/images/axe.png";

/**
 * Initialization function
 *
 */
$(document).ready(function(){
    
    var canvas = $('#game-canvas').get(0);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    ctx.textAlign="center";
    ctx.font='bold 12px Arial';
    map = getMap();
    
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
    player.update(delta, map);
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

/**
 * Draws map
 * PENDING CHANGE
 *
 */
function drawMap(){
    var tileX = 0;
    var tileY = 0;
    
    var restY = player.y % tileSize;
    tileY -= restY;
    for(y = Math.floor(player.y / tileSize - 11); y < Math.floor(player.y / tileSize + 11); y++){
        var restX = player.x % tileSize;
        tileX -= restX;
        for(x = Math.floor(player.x / tileSize - 16); x < Math.floor(player.x / tileSize + 16); x++){
            if(map[y][x] == 0) ctx.drawImage(Img.ground1,32,64,64,64,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 1) ctx.drawImage(Img.water1,0,448,16,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 3) ctx.drawImage(Img.ground1,32,160,96,96,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 4) ctx.drawImage(Img.ground1,256,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 5) ctx.drawImage(Img.ground1,288,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 6) ctx.drawImage(Img.ground1,224,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 7) ctx.drawImage(Img.ground1,224,128,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 8) ctx.drawImage(Img.ground1,288,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 9) ctx.drawImage(Img.ground1,192,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10) ctx.drawImage(Img.ground1,320,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 11) ctx.drawImage(Img.ground1,320,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10012) ctx.drawImage(Img.ground1,416,256,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10013) ctx.drawImage(Img.ground1,448,292,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 14) ctx.drawImage(Img.ground1,448,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 15) ctx.drawImage(Img.ground1,512,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 16) ctx.drawImage(Img.ground1,416,128,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10017) ctx.drawImage(Img.water1,32,320,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 18) ctx.drawImage(Img.ground1,416,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10019) ctx.drawImage(Img.ground1,416,320,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 20) ctx.drawImage(Img.ground1,512,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10021) ctx.drawImage(Img.water1,32,256,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10022) ctx.drawImage(Img.ground1,384,288,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 23) ctx.drawImage(Img.ground1,384,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 24) ctx.drawImage(Img.ground1,480,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10025) ctx.drawImage(Img.water1,32,288,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 26) ctx.drawImage(Img.ground1,480,160,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10027) ctx.drawImage(Img.ground1,448,256,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10028) ctx.drawImage(Img.water1,32,352,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10029) ctx.drawImage(Img.ground1,384,256,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10030) ctx.drawImage(Img.ground1,448,320,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10031) ctx.drawImage(Img.ground1,384,320,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 32) ctx.drawImage(Img.ground1,384,128,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 33) ctx.drawImage(Img.ground1,448,128,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 34) ctx.drawImage(Img.ground1,384,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 35) ctx.drawImage(Img.ground1,448,192,32,32,tileX,tileY,tileSize,tileSize);
            else if(map[y][x] == 10000){
                ctx.drawImage(Img.ground1,32,64,64,64,tileX,tileY,tileSize,tileSize);
                ctx.drawImage(Img.objects1,160,70,64,64,tileX,tileY,tileSize,tileSize);
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
	if(mouse.which === 1){
	//	player.LeftMouse(mouse);
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
                ctx.drawImage(Img.swords,32*Math.floor(players[key].animationCounterWeapon),32,32,32,canvasWidth/2+xDelta-tileSize+25,canvasHeight/2+yDelta+8,tileSize,tileSize);
            }else if(players[key].direction == 0){
                ctx.drawImage(Img.swords,32*Math.floor(players[key].animationCounterWeapon),64,32,32,canvasWidth/2+xDelta+tileSize-12,canvasHeight/2+yDelta+4,tileSize,tileSize);
            }
            
            ctx.fillText(players[key].name,canvasWidth/2+xDelta+22, canvasHeight/2+yDelta-8);
            ctx.drawImage(Img.player,48*currentSprite,52*players[key].direction,52,52,canvasWidth/2+xDelta,canvasHeight/2+yDelta,50,50);
            
            if(players[key].direction == 2){
                ctx.drawImage(Img.swords,32*Math.floor(players[key].animationCounterWeapon),64,32,32,canvasWidth/2+xDelta-tileSize+28,canvasHeight/2+yDelta+10,tileSize,tileSize);
            }
        }
    }
}

function drawItems(){
    for(var key in items){
        var xDelta = items[key].x - player.x;
        var yDelta = items[key].y - player.y;
        if(Math.abs(xDelta) < tileSize * 16 && Math.abs(yDelta) < tileSize * 11){
            ctx.drawImage(Img.axes,0,0,32,32,canvasWidth/2+xDelta,canvasHeight/2+yDelta,32,32);
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
socket.on('init_game', function (mapFromServer, playerList,itemList, tempPlayer){
    //map = mapFromServer;
    player = new Player(tempPlayer.name, tempPlayer.x, tempPlayer.y, 50, 50, 0.1);
    
    for (var key in playerList) {
        if(playerList[key].name == player.name){ continue; }
        players[key] = playerList[key];
    }
    for (var key in itemList) {
        items[key] = itemList[key];
    }
    
    player.items['sword'] = new Item(123432435, 'sword', 0, 0);
    player.activeItem = 'sword';
    
    $("#startpage").hide();
    $("#game-canvas").css({"height": canvasHeight, "width": canvasWidth, "visibility": "visible"});
    
    requestAnimationFrame(mainLoop);
});

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

Item = function(id,name,x,y){
    var self = {
        id:id,
        name:name,
        x:x,
        y:y
    };
    return self;
}
    