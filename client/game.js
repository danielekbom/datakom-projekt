/*
Denna fil får innehålla all klientens javaskript. 
Inget i själva HTML filen.
Detta verkar vara standard så vi kör likadant.
*/
var tileSize = 32;
    
    $(document).ready(function(){
        
        var canvasW = tileSize*30;
        var canvasH = tileSize*20;
        
        var canvas = $('#game-canvas').get(0);
        canvas.width = canvasW;
        canvas.height = canvasH;
        var ctx = canvas.getContext('2d');
        
        draw(ctx);
        
    });
    
    function draw(ctx){
        drawMap(ctx);
        
        ctx.fillStyle="#000000";
        ctx.fillRect(150,150,tileSize,tileSize);
    }
    
    function drawMap(ctx){
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
    