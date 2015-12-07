//Player class representing a player
Player = function(name,x,y,width,height,velocity){
    
    //Player constructor variables
    var self = {
        name:name,
        x:x,
        y:y,
        width:width,
        height:height,
        velocity:velocity
    };

    //Variables to know if the player is moving
    self.moveLeft = false;
    self.moveUp = false;
    self.moveRight = false;
    self.moveDown = false;
    
    //Variable to determine the players direction
    self.direction = 2;
    
    //Animation variables
    self.animationCounter = 0;
    self.animationCounterWeapon = 0;
    
    //True if player is attacking
    self.attacking = false;

    self.inventory = [];
    
    //the active item of the player
    self.activeWeapon = null;
    
    //Update loop that updates all game logic, is called from mainLoop.
    //delta is a timestamp used to make all clients synced.
    self.update = function(delta){

        //The number of pixels to move
        var movement = self.velocity * delta;
        
        //Set the next position to the current position
        var nextX = self.x;
        var nextY = self.y;
        
        //If the player is moving then set the next position to a new position
        if(self.moveLeft) nextX -= movement;
        if(self.moveUp) nextY -= movement;
        if(self.moveRight) nextX += movement;
        if(self.moveDown) nextY += movement;
        
        //Get the tile that the next position is in
        var nextObjectX = Math.floor((nextX+22) / 32) - 1;
        var nextObjectY = Math.floor((nextY+45) / 32) - 1;
        
        //Collision detection. If the next tile is a collision object it is a collision
        if(mapLayer1[nextObjectY][nextObjectX].toString().substr(4,1) == 1 || mapLayer2[nextObjectY][nextObjectX].toString().substr(4,1) == 1){
            //Collision
        }else{
            //Move the player by setting the current position to the next position
            self.x = nextX;
            self.y = nextY;
        }
        
        for(key in items){
            if(Math.abs(items[key].x - self.x) < 32 && Math.abs(items[key].y - self.y) < 32){
                self.inventory.push(items[key]);
                delete items[key];
                updateInventory();
            }
        }
        
        //Increase the animationCounter by 0.1 every time the update function run.
        self.animationCounter += 0.1;
        
        //If the player is attacking
        if(self.attacking == true){
            //Check if the weapon animation is going on and then continue it by increasing animationCounterWeapon
            if(self.animationCounterWeapon > 0 && self.animationCounterWeapon < 3.8){
                self.animationCounterWeapon += 0.3;
            }else{
                //Else the weapon animation is done and then set the animationCounterWeapon to 0 and stop attacking
                self.animationCounterWeapon = 0;
                self.attacking = false;
            }
            //Send information to the server about the new animation status
            socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter'                 : self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
        }
    };
    
    //Draw function that draws everything on the screen. Runs from mainLoop.
    self.draw = function(){
        //Current player sprite is set to 0, 1 or 2 since the player animation is three sprites
        var currentSprite = Math.floor(self.animationCounter) % 3;
        
        //If the player is moving then change the players direction
        if(self.moveLeft) self.direction = 3;
        else if(self.moveUp) self.direction = 0;
        else if(self.moveRight) self.direction = 1;
        else if(self.moveDown) self.direction = 2;
        else{
            //If the player is not moving then use sprite 1 and set animationCounter back to 1 to prevent animation
            currentSprite = 1;
            self.animationCounter = 1;
            //Send information to the server about the new animation status
            socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter'                 : self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
        }
        
        var weaponImage = Img[self.inventory[self.activeWeapon].getItemImage()]; //maybe change this later to returnImg()
        
        //Draw the weapon in the correct direction and with the correct sprite using the animationCounterWeapon
        if(self.direction == 1){
            ctx.drawImage(weaponImage,32*Math.floor(self.animationCounterWeapon),0,32,32,ctx.canvas.width/2+tileSize-10,ctx.canvas.height/2+5,tileSize,tileSize);
        }else if(self.direction == 3){
            ctx.drawImage(weaponImage,32*Math.floor(self.animationCounterWeapon),32,32,32,ctx.canvas.width/2-tileSize+25,ctx.canvas.height/2+8,tileSize,tileSize);
        }else if(self.direction == 0){
            ctx.drawImage(weaponImage,32*Math.floor(self.animationCounterWeapon),64,32,32,ctx.canvas.width/2+tileSize-12,ctx.canvas.height/2+4,tileSize,tileSize);
        }
        
        //Draw the players name above the player
        ctx.fillText(self.name,ctx.canvas.width/2+22, ctx.canvas.height/2-8);
        //Draw the player using the current sprite and direction
        ctx.drawImage(Img.player,48*currentSprite,52*self.direction,52,52,ctx.canvas.width/2,ctx.canvas.height/2,self.width,self.height);
        
        //Draw the weapon if direction equals to 2
        if(self.direction == 2){
            ctx.drawImage(weaponImage,32*Math.floor(self.animationCounterWeapon),64,32,32,ctx.canvas.width/2-tileSize+28,ctx.canvas.height/2+10,tileSize,tileSize);
        }
    };
    
    //If the space button is clicked
    self.SpaceButton = function(){
        //Run player attack
        self.attack();
    };
    
    //If the left mouse button is clicked
    self.LeftMouse = function(mouse){
        //Run player attack
        self.attack();
    };
    
    //Player attack function
    self.attack = function(){
        //Set the player attacking variable to true and start the weapon animation
        self.attacking = true;
        self.animationCounterWeapon += 0.3;
        //Send information to the server with the new animation data
        socket.emit('player_move', { 'name' : self.name , 'x' : self.x , 'y' : self.y, 'direction' : self.direction, 'animationCounter' :               self.animationCounter, 'animationCounterWeapon' : self.animationCounterWeapon});
    };
    
    self.switchWeapon = function(){
        var current = self.activeWeapon;
        while(true){
            current++;
            if(current >= self.inventory.length) current = 0;
            if(self.inventory[current].itemType == ItemTypeEnum.WEAPON){
                self.activeWeapon = current;
                break;
            }
        }
    };
    
    //Return the new player
    return self;
}