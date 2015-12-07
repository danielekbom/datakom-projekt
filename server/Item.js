//utility functions **
var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
};
var itemId = 0; //item ids, every time an item is created it gets a new id
function returnNextId() {
	itemId ++;
	return itemId;
}
//utility functions **
var ItemTypeEnum = {
	WEAPON: 1,
	HEALTH: 2,
};

/* ItemName, every sort of item that can be created must have an ItemName.
 * the actual name should be the same 
 */
var ItemName= {
	//weapons [name, ItemTypeEnum.WEAPON, rarity, damage]
	SWORD: ['sword', ItemTypeEnum.WEAPON, 100, 10],
	AXE: ['axe', ItemTypeEnum.WEAPON, 50, 12],
	SCIMITAR: ['scimitar', ItemTypeEnum.WEAPON, 10, 17],
	//health [name, ItemTypeEnum.HEALTH, rarity, +hp]
	
};

var summedRarity = 0;
for(var key in ItemName) {
	summedRarity += ItemName[key][2];
	ItemName[key][2] = summedRarity;
}


var Item = function(name, x, y) {
    this.id = returnNextId();
    this.name = name;
    this.itemType = name[1];
    this.x = x;
    this.y = y;
};
Item.prototype.getItemImage = function() {
	//Item name should be same as image variable name.
	return this.name[0];
};

function WeaponItem(itemName, x, y) {
	Item.call(this, itemName, x, y);
	this.damage = itemName[3];    
}
inheritsFrom(WeaponItem, Item);

var keys = Object.keys(ItemName);
var k_len = keys.length;
function spawnRandomItem(x, y) {
	//Item name should be same as image variable name.
    var itemName;
	var itemToSpawn = Math.floor((Math.random() * summedRarity) + 1);
    
	for(var i = 0; i < k_len; i++) {
        itemName = ItemName[keys[i]];
		if(itemToSpawn <= itemName[2]) {
			break;
		}
	}
	var returnItem;
	if(itemName[1] == ItemTypeEnum.WEAPON) {//weapon constructor
		returnItem = new WeaponItem(itemName, x, y);
	} else if(itemName[1] == ItemTypeEnum.HEALTH) {//health constructor
		
	}
	
	return returnItem;
}