var ItemTypeEnum = {
  WEAPON: 1,
  POWERUP: 2,
};

var WEAPONSORTS = {
  SWORD: 1,
  AXE: 2,
};


Item = function(itemType,sortName, image){
    var self = {
        itemType : itemType,
        itemSort : sortName,
        image : image
    };
    return self;
}

WeaponItem = function(weaponSort){
    var self = {
        damage
    }
}