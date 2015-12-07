var itemId = 0; //item ids, every time an item is created it gets a new id
function returnNextId() {
	itemId ++;
	return itemId;
}
//utility functions **
var ItemTypeEnum = {
	WEAPON: 1,
	DRINK: 2,
};

/* ItemName, every sort of item that can be created must have an ItemName.
 * the actual name should be the same 
 */
var ItemProperties= {
	//weapons [name, ItemTypeEnum.WEAPON, img, rarity, damage]
	SWORD: ['sword', ItemTypeEnum.WEAPON, 'sword', 100, 10],
	AXE: ['axe', ItemTypeEnum.WEAPON, 'axe', 50, 12],
	SCIMITAR: ['scimitar', ItemTypeEnum.WEAPON, 'scimitar', 10, 17],
	//health [name, ItemTypeEnum.DRINK, img, rarity, +hp]
	HP100: ['hp100', ItemTypeEnum.DRINK, 'hp100', 20, 100],
	
};

var summedRarity = 0;
for(var key in ItemProperties) {
	summedRarity += ItemProperties[key][3];
	ItemProperties[key][3] = summedRarity;
}

function WeaponItem(id,name,itemType, img, x, y, dmg){
    this.id = id;
    this.name = name;
    this.itemType = ItemTypeEnum.WEAPON;
	this.x = x;
	this.y = y;
    this.img = img;
	this.dmg = dmg;
}

function DrinkItem(id,name,itemType, img, x, y, amount){
    this.id = id;
    this.name = name;
    this.itemType = ItemTypeEnum.DRINK;
	this.x = x;
	this.y = y;
    this.img = img;
	this.amount = amount;
}


function createItem(itemProperties, x, y) {
	if(itemProperties[1] === ItemTypeEnum.WEAPON) {
		return new WeaponItem(returnNextId(), itemProperties[0], itemProperties[1], itemProperties[2], x, y, itemProperties[4]);
	} else if(itemProperties[1] === ItemTypeEnum.DRINK) {
		return new DrinkItem(returnNextId(), itemProperties[0], itemProperties[1], itemProperties[2], x, y, itemProperties[4]);
	}
	
}

var keys = Object.keys(ItemProperties);
var k_len = keys.length;
function spawnRandomItem(x, y) {
	//Item name should be same as image variable name.
    var itemProperties;
	var itemToSpawn = Math.floor((Math.random() * summedRarity) + 1);
    
	for(var i = 0; i < k_len; i++) {
        itemProperties = ItemProperties[keys[i]];
		if(itemToSpawn <= itemProperties[2]) {
			break;
		}
	}
	return createItem(itemProperties, x, y);
	var returnItem;
}