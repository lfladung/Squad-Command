const E = require('./Equipment.js');
const Equipment = E.Equipment;
const Dice = E.Dice;


/**
 * Class representing a weapon.
 * @extends Equipment
 */
class Weapon extends Equipment
{

	/**
	 * Creates a weapon
	 *
	 * @param {String} tag the tag associated with this Weapon
	 * @param {String} name the name of this weapon
	 * @param {Object} damage a dice representing the damage possibilities
	 * @param {number} range the effective range of this weapon
	 * @param {Object} speed the range of time between each attack this weapon is capable of
	 * @param {weaponType} type the type of weapon this is (ranged or melee)
	 */
	constructor(tag, name, damage, range, speed, type)
	{
		super(tag, name);
		this.damage = new Dice(damage.min, damage.max);
		this.range = range;
		this.speed = new Dice(speed.min, speed.max);
		this.type = type;
	}


	/**
	 * getDamage - returns a random damage in the range of this weapons damage capabilities
	 *
	 * @return {number} a random damage in the range of this weapons damage capabilities
	 */
	getDamage()
	{
		return this.damage.roll();
	}


	/**
	 * getRange - returns the range of this weapon
	 *
	 * @return {number} the range this weapon is capable of
	 */
	getRange()
	{
		return this.range;
	}


	/**
	 * getSpeed - returns a random speed that this weapon will be able to attack again
	 *
	 * @return {number} number between the min and max attack speed of this weapon	
	 */
	getSpeed()
	{
		return this.speed.roll();
	}
}

exports.Weapon = Weapon;
