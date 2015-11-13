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
    
    self.update = function(delta){
        if(self.moveLeft) self.x -= self.velocity * delta;
        if(self.moveUp) self.y -= self.velocity * delta;
        if(self.moveRight) self.x += self.velocity * delta;
        if(self.moveDown) self.y += self.velocity * delta;
    };
    
    self.draw = function(){
        ctx.fillStyle="#000000";
        ctx.fillRect(self.x,self.y,self.width,self.height);
    };
    
    return self;
    
}