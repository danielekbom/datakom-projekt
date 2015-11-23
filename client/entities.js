Player = function(name,x,y,width,height,velocity){
    
    var self = {
        name:name,
        x:x,
        y:y,
        width:width,
        height:height,
        velocity:velocity
    };
    
    self.moveLeft = false;
    self.moveUp = false;
    self.moveRight = false;
    self.moveDown = false;
    self.direction = 2;
    self.animationCounter = 0;
    self.animationCounterWeapon = 0;
    
    self.attacking = false;
    
    self.update = function(delta, map){

        var movement = self.velocity * delta;
        var nextX = self.x;
        var nextY = self.y;
        
        if(self.moveLeft) nextX -= movement;
        if(self.moveUp) nextY -= movement;
        if(self.moveRight) nextX += movement;
        if(self.moveDown) nextY += movement;
        
        var nextObjectX = Math.floor(nextX / 32);
        var nextObjectY = Math.floor(nextY / 32);
        
        if(map[nextObjectY][nextObjectX] >= 1000 && nextX < nextObjectX*32 + 32 && nextX + 50 > nextObjectX*32 && nextY < nextObjectY*32 + 32 && nextY + 50 > nextObjectY*32){
            //Collision
        }else{
            self.x = nextX;
            self.y = nextY;
        }

        self.animationCounter += 0.1;
        
        if(self.attacking == true){
            if(self.animationCounterWeapon > 0 && self.animationCounterWeapon < 3.8){
                self.animationCounterWeapon += 0.3;
            }else{
                self.animationCounterWeapon = 0;
                self.attacking = false;
            }
            socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter' : self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
        }
    };
    
    self.draw = function(){
        var currentSprite = Math.floor(self.animationCounter) % 3;
        
        if(self.moveLeft) self.direction = 3;
        else if(self.moveUp) self.direction = 0;
        else if(self.moveRight) self.direction = 1;
        else if(self.moveDown) self.direction = 2;
        else{
            currentSprite = 1;
            self.animationCounter = 1;
            socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter' : self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
        }
        
        if(self.direction == 1){
            ctx.drawImage(Img.swords,32*Math.floor(self.animationCounterWeapon),0,32,32,ctx.canvas.width/2+tileSize-10,ctx.canvas.height/2+5,tileSize,tileSize);
        }else if(self.direction == 3){
            ctx.drawImage(Img.swords,32*Math.floor(self.animationCounterWeapon),32,32,32,ctx.canvas.width/2-tileSize+25,ctx.canvas.height/2+8,tileSize,tileSize);
        }else if(self.direction == 0){
            ctx.drawImage(Img.swords,32*Math.floor(self.animationCounterWeapon),64,32,32,ctx.canvas.width/2+tileSize-12,ctx.canvas.height/2+4,tileSize,tileSize);
        }
        
        ctx.fillText(self.name,ctx.canvas.width/2+22, ctx.canvas.height/2-8);
        ctx.drawImage(Img.player,48*currentSprite,52*self.direction,52,52,ctx.canvas.width/2,ctx.canvas.height/2,self.width,self.height);
        
        if(self.direction == 2){
            ctx.drawImage(Img.swords,32*Math.floor(self.animationCounterWeapon),64,32,32,ctx.canvas.width/2-tileSize+28,ctx.canvas.height/2+10,tileSize,tileSize);
        }
    };
      
    self.SpaceButton = function(){
        self.attack();
    };
    
    self.LeftMouse = function(mouse){
        self.attack();
    };
    
    self.attack = function(){
        self.attacking = true;
        self.animationCounterWeapon += 0.3;
        socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter' : self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
    };
    
    return self;
    
}