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
    
    self.update = function(delta){
        if(self.moveLeft) self.x -= self.velocity * delta;
        if(self.moveUp) self.y -= self.velocity * delta;
        if(self.moveRight) self.x += self.velocity * delta;
        if(self.moveDown) self.y += self.velocity * delta;

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
        
        if(self.moveLeft){
            self.direction = 3;
        }else if(self.moveUp){
            self.direction = 0;
        }else if(self.moveRight){
            self.direction = 1;
        }else if(self.moveDown){
            self.direction = 2;
        }else{
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