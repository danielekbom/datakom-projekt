Player = function(x,y,width,height,velocity){
    
    var self = {
        x:x,
        y:y,
        width:width,
        height:height,
        velocity:velocity
    };
    
    self.update = function(delta){
        self.x += self.velocity * delta;
    };
    
    self.draw = function(){
        ctx.fillStyle="#000000";
        ctx.fillRect(self.x,self.y,self.width,self.height);
    };
    
    return self;
    
}