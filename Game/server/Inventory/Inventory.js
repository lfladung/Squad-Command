const Armor = require('./Armor.js').Armor;
const Weapon = require('./Weapon.js').Weapon;


/**
 * Class representing a Unit's inventory
 */
class Inventory
{


	/**
	 * Creates a new inventory
	 *
	 * @param {Weapon} weapon the weapon this inventory holds
	 * @param {Armor} armor the armor that this inventory holds	
	 */
	constructor(weapon, armor)
	{
		this.weapon = weapon;
		this.armor = armor;
	}
}

exports.Inventory = Inventory;
exports.Armor = Armor;
exports.Weapon = Weapon;
