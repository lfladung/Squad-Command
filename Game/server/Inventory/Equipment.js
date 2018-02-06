/**
 * Class representing a Dice
 */
class Dice
{

	/**
	 * Creates a new Dice
	 *
	 * @param {number} min the minimum number of this dice
	 * @param {number} max the maximum number of this dice
	 */
	constructor(min, max)
	{
		this.min = min;
		this.max = max;
	}


	/**
	 * roll - returns a random number between this max value and this min value
	 *
	 * @return {number} a random number between max and min
	 */
	roll()
	{
		return (Math.random() * (this.max - this.min) + this.min);
	}
}


/**
 * Class representing a piece of equipment such as Armor or Weapon
 */
class Equipment
{

	/**
	 * Creates a new piece of equipment
	 *
	 * @param {String} tag the tag of the new equipment
	 * @param {String} name the name of the new equipment
	 */
	constructor(tag, name)
	{
		this.tag = tag;
		this.name = name;
	}
}

exports.Equipment = Equipment;
exports.Dice = Dice;
