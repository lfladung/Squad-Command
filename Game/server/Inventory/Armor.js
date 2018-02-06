const E = require('./Equipment.js');
const Equipment = E.Equipment;
const Dice = E.Dice;


/**
 * Class representing a piece of armor.
 * @extends Equipment
 */
class Armor extends Equipment
{

	/**
	 * Creates a new piece of Armor
	 *
	 * @param {String} tag the tag associated with this armor
	 * @param {String} name the name associated with this armor
	 * @param {Object} defense representation of the min and max defense of this armor
	 */
	constructor(tag, name, defense)
	{
		super(tag, name);
		this.defense = new Dice(defense.min, defense.max);
	}


	/**
	 * getDefense - gets a random defense within this armors defense capabilities
	 *
	 * @return {number} a random defense value within this armors defense capabilities	
	 */
	getDefense()
	{
		return this.defense.roll();
	}
}

exports.Armor = Armor;
