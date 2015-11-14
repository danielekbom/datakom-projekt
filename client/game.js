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

var Img = {};
Img.ground1 = new Image();
Img.ground1.src = "client/images/ground_tiles.png";
Img.ground2 = new Image();
Img.ground2.src = "client/images/graphics-tiles-waterflow.png";

$(document).ready(function(){

    var canvas = $('#game-canvas').get(0);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    player = new Player(150,250,50,50,0.1);
    
    requestAnimationFrame(mainLoop);
});

function update(delta) {
    player.update(delta);
}

function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawMap();
    player.draw();
}

function drawMap(){
    var map = getMap();

    var tileX = 0;
    var tileY = 0;
    
    $.each(map, function(key, value){
        $.each(map[key], function(innerKey, innerValue){
            if(innerValue == 0) ctx.drawImage(Img.ground1,32,64,64,64,tileX,tileY,tileSize,tileSize);
            if(innerValue == 1) ctx.drawImage(Img.ground2,0,0,64,64,tileX,tileY,tileSize,tileSize);
            if(innerValue == 3) ctx.drawImage(Img.ground1,32,160,64,64,tileX,tileY,tileSize,tileSize);
            tileX += tileSize
        });
        tileX = 0;
        tileY += tileSize;
    });
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
            player.moveLeft = true;
            break;
        case 38:
            player.moveUp = true;
            break;
        case 39:
            player.moveRight = true;
            break;
        case 40:
            player.moveDown = true;
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

    