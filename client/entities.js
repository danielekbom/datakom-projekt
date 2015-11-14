Player = function(x,y,width,height,velocity){
    
    var self = {
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
    
    self.update = function(delta){
        if(self.moveLeft) self.x -= self.velocity * delta;
        if(self.moveUp) self.y -= self.velocity * delta;
        if(self.moveRight) self.x += self.velocity * delta;
        if(self.moveDown) self.y += self.velocity * delta;

        self.animationCounter += 0.1;
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
            self.animationCounter = 0;
        }
        ctx.drawImage(Img.player,48*currentSprite,52*self.direction,52,52,ctx.canvas.width/2,ctx.canvas.height/2,self.width,self.height);
    };
    
    return self;
    
}