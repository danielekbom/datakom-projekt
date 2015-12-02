var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
};

var ItemTypeEnum = {
  WEAPON: 1,
  POWERUP: 2,
};

var WeaponSorts= {
  SWORD: 1,
  AXE: 2,
};

var Item = function(id, itemType, x, y, image) {
    this.id = id;
    //this.name = name;
    this.itemType = itemType;
    this.x = x;
    this.y = y;
    this.img = image;
};


Item.prototype.write = function() {
    console.log(this.itemType);
};

function WeaponItem(id, itemType, x, y, image, weaponSort, weaponSprite, dmg) {
	Item.call(this, id, ItemTypeEnum.WEAPON, x, y, image);
	
    this.weaponSprite = weaponSprite;
	this.itemSort = weaponSort;
	this.damage = dmg;
    
}
inheritsFrom(WeaponItem, Item);

Item.prototype.getItemType = function() {
  console.log("itemType = " + this.itemType);
};

Item.prototype.getItemImage = function() {
  return this.img;
};

WeaponItem.prototype.getWeaponSprite = function() {
  return this.weaponSprite;
};

var item = new Item(ItemTypeEnum.WEAPON, "hig");
item.write();
var sword = new WeaponItem(WeaponSorts.SWORD, "SwordSprite", "SwordImage");
console.log(sword.getItemImage());
console.log(sword.getWeaponSprite());