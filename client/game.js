/***** Game Settings *****/
var tileSize = 32;
var canvasWidth = tileSize*30;
var canvasHeight = tileSize*20;

var lastFrameTimeMs = 0;
var maxFPS = 60;
var delta = 0;
var timestep = 1000 / 60;
/*************************/

var ctx = null;
var player = null;
var socket = null;

var players = {};

var Img = {};
Img.ground1 = new Image();
Img.ground1.src = "client/images/ground_tiles.png";
Img.ground2 = new Image();
Img.ground2.src = "client/images/graphics-tiles-waterflow.png";
Img.ground3 = new Image();
Img.ground3.src = "client/images/beach_sand_woa.png";
Img.objects1 = new Image();
Img.objects1.src = "client/images/object-layer.png";
Img.player = new Image();
Img.player.src = "client/images/player.png";
Img.swords = new Image();
Img.swords.src = "client/images/swords.png";

$(document).ready(function(){
    
    var canvas = $('#game-canvas').get(0);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    var randomName = Math.floor((Math.random() * 10) + 1);
    player = new Player(randomName,canvasWidth,canvasHeight,50,50,0.1); 
    players[player.name] = player;
    emitConnected();
    
    requestAnimationFrame(mainLoop);
});

function update(delta) {
    player.update(delta);
    if(player.moveLeft || player.moveUp || player.moveRight || player.moveDown){
        emitMoved();
    }
}

function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawMap();
    player.draw();
    drawPlayers();
}

function drawMap(){
    var map = getMap();

    var tileX = 0;
    var tileY = 0;
    
    var restY = player.y % tileSize;
    tileY -= restY;
    for(y = Math.floor(player.y / tileSize - 11); y < Math.floor(player.y / tileSize + 11); y++){
        var restX = player.x % tileSize;
        tileX -= restX;
        for(x = Math.floor(player.x / tileSize - 16); x < Math.floor(player.x / tileSize + 16); x++){
            if(map[y][x] == 0) ctx.drawImage(Img.ground1,32,64,64,64,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 1) ctx.drawImage(Img.ground2,0,0,64,64,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 3) ctx.drawImage(Img.ground1,32,160,96,96,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 4) ctx.drawImage(Img.ground1,256,160,32,32,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 5) ctx.drawImage(Img.ground1,288,160,32,32,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 6) ctx.drawImage(Img.ground1,224,192,32,32,tileX,tileY,tileSize,tileSize);
            if(map[y][x] == 1000){
                ctx.drawImage(Img.ground1,32,64,64,64,tileX,tileY,tileSize,tileSize);
                ctx.drawImage(Img.objects1,160,70,64,64,tileX,tileY,tileSize,tileSize);
            }
            tileX += tileSize;
        }
        tileX = 0;
        tileY += tileSize;
    }
}

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
    }
};

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

document.onmousedown = function(mouse){
	if(mouse.which === 1){
		player.LeftMouse(mouse);
    }
}

function drawPlayers(){
    for (var key in players) {
        ctx.drawImage(Img.player,48,52,52,52,Math.floor(players[key].x/32),Math.floor(players[key].y/32),52,52);
    }
}

function emitConnected(){
    socket.emit('player_connect', { 'name' : player.name , 'x' : player.x, 'y' : player.y });
}

function emitMoved(){
    socket.emit('player_move', { 'name' : player.name , 'x' : player.x , 'y' : player.y });
}

socket = io.connect('http://127.0.0.1:9000');

socket.on('init_players', function (data){
    for (var key in data) {
        players[key] = data[key];
    }
});

socket.on('player_connect', function (data){
    players[data.name] = new Player(data.name,data.x,data.y,50,50,0.1);
});

socket.on('player_disconnect', function (data){
    delete players[data.name];
});

socket.on('players_positions', function (data){
    for (var key in data) {
        if(players[key] != undefined) {
            players[key].x = data[key].x;
            players[key].y = data[key].y;
        }
    }
});
    