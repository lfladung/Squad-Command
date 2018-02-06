const Vector = require('./Vector.js').Vector;

var Utils = {

	/**
	 * within - decides if the given point is within the rectangle generated from
	 *  the two points passed
	 *
	 * @param  {Vector} point  the point to be checked
	 * @param  {Vector} bleft  the bottom left corner of the bounding box
	 * @param  {Vector} tright the top right corner of the bounding box
	 * @return {boolean}        true if the point is within the given bounds, false
	 *  otherwise
	 */
	within: function(point, bleft, tright)
	{
		return point.x >= bleft.x && point.y <= bleft.y &&
			point.x <= tright.x && point.y >= tright.y;
	},


	/**
	 * idInvalid - decides if a given id is already used within the given list to ensure
	 *  no id overlaps
	 *
	 * @param  {Object[]} list the array containing the obejcts to check the ids of
	 * @param  {number} id   the id to be checked if it is already in use
	 * @return {boolean}     true if the id is already in use, false otherwise
	 */
	idInvalid: function(list, id)
	{
		for (var i = 0; i < list.length; i++)
		{
			if (list[i].id === id)
				return true;
		}

		return false;
	},


	/**
	 * generateId - generates an id to be used within the given list that avoids
	 *  overlaps
	 *
	 * @param  {Object[]} list the array of objects the id will be used in
	 * @return {number}      the available id
	 */
	generateId: function(list)
	{
		let id;
		do {
			id = Math.floor(Math.random() * 1000);
		} while (this.idInvalid(list, id));

		return id;
	},


	/**
	 * average - finds the average between the positions of the objects in the list
	 *
	 * @param  {Object[]} list array of objects to have their positions averaged
	 * @return {Vector}      the average of the positions of objects in the list
	 */
	average: function(list)
	{
		let avg = new Vector(0, 0);
		let vectorCheck = list[0].position;
		list.forEach(function(v)
		{
			avg.x += (typeof vectorCheck === "undefined") ? v.x : v.position.x;
			avg.y += (typeof vectorCheck === "undefined") ? v.y : v.position.y;
		});
		avg.x /= list.length;
		avg.y /= list.length;
		return avg;
	},

	/**
	 * rotationMatrix - Intended design is for group traversals
	 * @param toBeRotated
	 *		The point which is to be rotated
	 * @param center
	 *		The point which will be referenced as the new origin
	 * @param destCenter
	 * 		The point where we wish to rotate to
	 * @param newDestAngle
	 *		The angle by which we will be rotating
	 * @return
	 *		The vector center to toBeRotated will now be rotated by 'newDestAngle' in
	 *		the counterclockwise direction
	 * IMPORTANT NOTE: If you wish to rotate a -SINGLE- point, you will need to specify
	 * both toBeRotated and destCenter to be the same.
	 */
	rotationMatrix: function(toBeRotated, center, destCenter, newDestAngle)
	{
		let newUnitPos = this.newOrigin(toBeRotated, center);
		/* Experimental */
		// let newDestPos = this.newOrigin(destCenter, center);
		/**/
		let unitDestX = newUnitPos.x * Math.cos(newDestAngle) - newUnitPos.y * Math.sin(newDestAngle);
		let unitDestY = newUnitPos.x * Math.sin(newDestAngle) + newUnitPos.y * Math.cos(newDestAngle);
		if (toBeRotated.x != destCenter.x && toBeRotated.y != destCenter.y)
		{
			return new Vector(unitDestX + destCenter.x, destCenter.y - unitDestY);
		}
		else
		{
			return new Vector(unitDestX + center.x, center.y - unitDestY);
		}
	},

	/**
	 * translationMatrix - Translates a point along a specified vector
	 *	@param toBeTranslated
	 *		The point which is be be affected by the translation
	 *	@param center
	 *		The center which will act as the origin of the vector toBeTranslated
	 *	@param destCenter
	 *		The destination to translated to
	 *	@return
	 *		The the newly translated point
	 */
	translationMatrix: function(toBeTranslated, center, destCenter)
	{
		let newUnitPos = this.newOrigin(toBeTranslated, center);
		/* Experimental */
		// let newDestPos = this.newOrigin(destCenter, center);
		// newUnitPos.x -= (newUnitPos.x - newDestPos.x);
		// newUnitPos.y -= (newUnitPos.y - newDestPos.y);
		// return new Vector(newUnitPos.x + center.x, center.y - newUnitPos.y);
		/**/
		return new Vector(newUnitPos.x + destCenter.x, destCenter.y - newUnitPos.y);
	},



	/**
	 * newOrigin - function translates a point about a new origin
	 *	@param v
	 *		v is the point to be translated
	 *	@param origin
	 *		origin is designated as... the new origin
	 *	@return
	 *		a new point with coordinates in the standard euclidean grid
	 */
	newOrigin: function(v, origin)
	{
		return new Vector(v.x - origin.x, origin.y - v.y);
	},

	/**
	 * swap - Generic swap function
	 *  @param first
	 * 		first element to be swapped
	 *  @param second
	 * 		second element to be swapped
	 */
	swap: function(first, second)
	{
		let temp = first;
		first = second;
		second = temp;
	},

	/**
	 * morphAlongMapEdge - Units will not be allowed to step outside the boundary of the map
	 *
	 * @param {*} v
	 * 		unit on path to cross map border
	 * @param {*} map
	 * 		map provided for dimensional checks
	 */
	morphAlongMapEdge(v, map)
	{
		// Determine which direction the unit is trying to leave the map
		let north = v.defaultPos.y < 0;
		let south = v.defaultPos.y > map.size.y;
		let east = v.defaultPos.x > map.size.x;
		let west = v.defaultPos.x < 0;

		// Compensate for boundary offshoot
		if (north)
			v.defaultPos.y = v.hitbox.y * 0.5;
		if (south)
			v.defaultPos.y = map.size.y - (v.hitbox.y * 0.5);
		if (east)
			v.defaultPos.x = map.size.x - (v.hitbox.x * 0.5);
		if (west)
			v.defaultPos.x = v.hitbox.x * 0.5;
		
	},


	/**
	 * rotateVector - rotates the given vector by the given amount of degrees
	 *
	 * @param {Vector} v vector to be rotated
	 * @param {number} degrees number of degrees to rotate v
	 * @return {Vector} rotated vector of v by degrees
	 */
	rotateVector(v, degrees)
	{
		let radians = degrees * Math.PI / 180;
		return new Vector(v.x * Math.cos(radians) - v.y * Math.sin(radians), v.x * Math.sin(radians) + v.y * Math.cos(radians));
	},


	mode:
	{
		BATTLE: 0,
		COMMAND: 1
	},

	type:
	{
		CLICK: 0,
		AI: 1,
		KEYBOARD: 2,
		NONE: 3
	},

	weaponType:
	{
		MELEE: 0,
		RANGED: 1
	},

}

exports.Vector = Vector;
exports.Utils = Utils;
