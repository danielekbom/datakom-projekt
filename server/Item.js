var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

var ItemTypeEnum = {
  WEAPON: 1,
  POWERUP: 2,
};

var WeaponSorts= {
  SWORD: 1,
  AXE: 2,
};
console.log('Test ' + ItemTypeEnum.WEAPON);

/*var Item = function(itemType, image){
    var self = {
        itemType : itemType,
        imageSource : image
    };
    return self;
};*/
var Item = function(itemType, image) {
    this.itemType = itemType;
    this.image = image;
};


Item.prototype.write = function() {
    console.log(this.itemType);
};

var WeaponItem = function(weaponSort, image){
    this.damage = 10;
    this.itemSort = weaponSort;
    
};
inheritsFrom(WeaponItem, Item);

var item = new Item(ItemTypeEnum.WEAPON, "hig");
item.write();
var sword = new WeaponItem(ItemTypeEnum.WEAPON, "hdifhi");
sword.protype.itemType = ItemTypeEnum.WEAPON;
//inheritsFrom(sword, new Item(ItemTypeEnum.WEAPON, "image"));
sword.write();