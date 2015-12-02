//utility functions **
var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
};
var itemId = 0;
function returnNextId() {
	itemId ++;
	return itemId;
}
//utility functions **
var ItemTypeEnum = {
	WEAPON: 1,
	HEALTH: 2,
};
var ItemConstructor = {};

/* ItemName, every sort of item that can be created must have an ItemName.
 * the actual name should be the same 
 */
var ItemName= {
	//weapons
	SWORD: ['sword', ItemTypeEnum.WEAPON],
	AXE: ['axe', ItemTypeEnum.WEAPON],
	SWORD2: ['sword2', ItemTypeEnum.WEAPON],
	
};
var itemRarity = {};
itemRarity[ItemName.SWORD] = 100;
itemRarity[ItemName.AXE] = 50;
itemRarity[ItemName.SWORD2] = 10;

var summedRarity = 0;
for(var key in itemRarity) {
	summedRarity += itemRarity[key];
	itemRarity[key] = summedRarity;
}


var weaponSortDamage = {};
weaponSortDamage[ItemName.SWORD] = 10;
weaponSortDamage[ItemName.AXE] = 12;
weaponSortDamage[ItemName.SWORD2] = 17;


var Item = function(name, itemType, x, y) {
    this.id = returnNextId();
    this.name = name;
    this.itemType = itemType;
    this.x = x;
    this.y = y;
};

ItemConstructor[ItemTypeEnum.WEAPON] = function(itemName, x, y, dmg) {
	Item.call(this, itemName, ItemTypeEnum.WEAPON, x, y);
	this.damage = weaponSortDamage[itemName];
    return this;
    
};
inheritsFrom(ItemConstructor[ItemTypeEnum.WEAPON], Item);

Item.prototype.getItemType = function() {
	console.log(this.getItemType);
};

Item.prototype.getItemImage = function() {
	//Item name should be same as image variable name.
	return this.name[0];
};

function returnCreationArray(itemName, x, y) {
	var returnArray;
	if(itemName[1] == ItemTypeEnum.WEAPON) {
		returnArray = [itemName, x, y, weaponSortDamage[itemName]];
	}
	return returnArray;
}

var keys = Object.keys(ItemName);
var k_len = keys.length;
function spawnRandomItem(x, y) {
	//Item name should be same as image variable name.
    var itemName;
	var itemToSpawn = Math.floor((Math.random() * summedRarity) + 1);
    
	for(var i = 0; i < k_len; i++) {
        itemName = ItemName[keys[i]];
		if(itemToSpawn <= itemRarity[itemName]) {
			break;
		}
	}
    console.log(returnCreationArray(itemName, x ,y));
	var returnItem = ItemConstructor[itemName[1]].apply(returnItem, returnCreationArray(itemName, x ,y));
	return returnItem;
}
var newItem = ItemConstructor[ItemTypeEnum.WEAPON](ItemName.SWORD, 1, 2, 10);
console.log(newItem);
newItem = ItemConstructor[ItemTypeEnum.WEAPON](ItemName.SWORD, 1, 2, 10);
console.log(newItem);
newItem = ItemConstructor[ItemTypeEnum.WEAPON](ItemName.SWORD, 1, 2, 10);
console.log(newItem);

console.log(newItem.getItemImage());