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

$(document).ready(function(){

    var canvas = $('#game-canvas').get(0);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    player = new Player(150,250,50,50,0.05);
    
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
            if(innerValue == 0) ctx.fillStyle="#33cc33";
            if(innerValue == 1) ctx.fillStyle="#66ccff";
            if(innerValue == 3) ctx.fillStyle="#663300";
            ctx.fillRect(tileX, tileY, tileSize, tileSize);
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
    