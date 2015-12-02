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

var Item = function(itemType, image) {
    this.itemType = itemType;
    this.image = image;
};


Item.prototype.write = function() {
    console.log(this.itemType);
};

function WeaponItem(weaponSort, WeaponSprite, image) {
	Item.call(this, ItemTypeEnum.WEAPON, image);
	
	this.damage = 10;
    this.WeaponSprite = WeaponSprite;
	this.itemSort = weaponSort;
}
inheritsFrom(WeaponItem, Item);

Item.prototype.getItemType = function() {
  console.log("itemType = " + this.itemType);
};

Item.prototype.getItemImage = function() {
  return this.image;
};

WeaponItem.prototype.getWeaponSprite = function() {
  return this.WeaponSprite;
};

var item = new Item(ItemTypeEnum.WEAPON, "hig");
item.write();
var sword = new WeaponItem(WeaponSorts.SWORD, "SwordSprite", "SwordImage");
console.log(sword.getItemImage());
console.log(sword.getWeaponSprite());