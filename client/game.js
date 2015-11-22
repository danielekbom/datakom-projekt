/***** Game Settings *****/
var tileSize = 32;
var canvasWidth = tileSize*30;
var canvasHeight = tileSize*20;

var lastFrameTimeMs = 0;
var maxFPS = 50;
var delta = 0;
var timestep = 1000 / 50;
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
    ctx.textAlign="center";
    ctx.font='bold 12px Arial';

    var randomName = Math.floor((Math.random() * 1000) + 1);
    player = new Player("Player " + randomName,900,900,50,50,0.1); 
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

function emitConnected(){
    socket.emit('player_connect', { 'name' : player.name , 'x' : player.x, 'y' : player.y });
}

function emitMoved(){
    socket.emit('player_move', { 'name' : player.name , 'x' : player.x , 'y' : player.y, 'direction' : player.direction, 'animationCounter' : player.animationCounter, 'animationCounterWeapon' : player.animationCounterWeapon});
}

socket = io.connect('http://127.0.0.1:9000');

socket.on('init_players', function (data){
    for (var key in data) {
        if(data[key].name == player.name){ continue; }
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
    if(players[data.name] != undefined){
        players[data.name].x = data.x;
        players[data.name].y = data.y;
        players[data.name].direction = data.direction;
        players[data.name].animationCounter = data.animationCounter;
        players[data.name].animationCounterWeapon = data.animationCounterWeapon;
    }
});
    