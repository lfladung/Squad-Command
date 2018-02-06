const Unit = require('./Unit.js').Unit;
const Inventory = require('../Inventory/Inventory.js').Inventory;

const Utilities = require('../Utilities/Utils.js');
const Vector = Utilities.Vector;
const Utils = Utilities.Utils;
const type = Utils.type;

SPACING = 10;
UNIT_SIZE = 5;
MAX_SIZE = 30;
MAX_ROW_SIZE = 10;
COLLISION_DISTANCE = 20;


/**
 * Class representing a squad
 */
class Squad
{

	/**
	 * Creates a squad
	 *
	 * @param {number} id the id of this squad
	 * @param {number} numUnits the number of units in this squad
	 * @param {Vector} position the position that this squad should start at
	 * @param {number} speed the speed of this squad's units
	 * @param {Inventory} inv the inventory assigned to this squad
	 * @param {Player} player the player that owns this squad
	 */
	constructor(id, numUnits, position, speed, inv, player)
	{
		numUnits = (numUnits <= MAX_SIZE) ? numUnits : MAX_SIZE; // ensure size doesn't exceed the max
		this.units = [];
		this.defaultLayout = [];
		this.id = id;
		this.position = new Vector(position.x, position.y);
		this.inventory = inv;
		this.player = player;
		this.generateUnits(numUnits, speed);
		this.maxRowSize = MAX_ROW_SIZE;
		this.spacing = SPACING;
		this.direction = new Vector(position.x, position.y - 1);
		this.defaultCenter = this.position;
		this.selectionBox = this.generateSelectionBox();
		this.heading = Math.PI / 2;
	}

	/**
	 * generateSelectionBox - Generates defeault selection box for this squad
	 * Requires update inside of update()
	 *
	 * @return {Object} the selection box for this squad
	 */
	generateSelectionBox()
	{
		let numRows = this.units.length / MAX_ROW_SIZE;
		let unitsInARow = this.units.length / numRows;
		let deltaX = unitsInARow / 2 * SPACING;
		let deltaY = (numRows / 2 < 1) ? UNIT_SIZE / 2 : (numRows % 2 == 0 ? SPACING : (SPACING + UNIT_SIZE) / 2 + UNIT_SIZE);
		let tright = new Vector(this.position.x + deltaX, this.position.y - deltaY);
		let bleft = new Vector(this.position.x - deltaX, this.position.y + deltaY);
		return {
			topRight: tright,
			bottomLeft: bleft
		};
	}


	/**
	 * update - Performs an update on this squad, removes this squad if it has no more units,
	 * checks to see if this squads average position has moved and if its region has changed
	 */
	update()
	{
		if (this.units.length == 0)
		{
			this.player.removeSquad(this);
			return;
		}
		else
		{
			let lastPos = {
				x: this.position.x,
				y: this.position.y
			}
			let pos = Utils.average(this.units);
			this.selectionBox.topRight = Utils.translationMatrix(this.selectionBox.topRight, lastPos, pos);
			this.selectionBox.bottomLeft = Utils.translationMatrix(this.selectionBox.bottomLeft, lastPos, pos);
			if (pos.x != this.position.x || pos.y != this.position.y)
			{
				this.position = pos;
				this.player.game.map.checkRegion(lastPos, this);
				this.checkCollision();
			}
		}
	}


	/**
	 * checkCollision - checks to see if this squad is within range of any enemy units, if so
	 * calls collision with the colliding squad
	 */
	checkCollision()
	{
		let self = this;
		let nearEnemySquads = this.player.game.map.getNearby(this, (o) => o instanceof Squad && o.units.length > 0 &&
			o.player != self.player && self.position.distance(o.position) <= COLLISION_DISTANCE);

		nearEnemySquads.forEach((e) =>
		{
			self.collision(e);
			e.collision(self);
		});
	}


	/**
	 * collision - sets this squads units to AI mode so that they will attack
	 */
	collision(e)
	{
		if (this.units[0].moveType != type.AI)
			this.units.forEach((u) =>
			{
				u.setMoveType(type.AI);
			});
	}


	/**
	 * halt - stops this squads units
	 */
	halt()
	{
		this.units.forEach(function(u)
		{
			u.setDestination([]);
			u.setMoveType(type.NONE);
		});
	}


	/**
	 * generateUnits - generate the units in a rectangular shape
	 *
	 * @param {number} numUnits the number of units to be created
	 * @param {number} speed the speed of the units to be created
	 */
	generateUnits(numUnits, speed)
	{
		var numLines = Math.ceil(numUnits / 10);
		var pos = new Vector(this.position.x, this.position.y);
		if (numLines % 2 == 0)
			pos.y += SPACING / 2;
		var half = Math.floor(numLines / 2);
		pos.y -= SPACING * half;
		var unitsLeft = numUnits;
		for (var i = 0; i < numLines; i++)
		{
			var numInRow = (unitsLeft % MAX_ROW_SIZE == 0) ? MAX_ROW_SIZE : unitsLeft % MAX_ROW_SIZE;
			this.generateRow(numInRow, pos, speed);
			pos.y += SPACING;
			unitsLeft -= numInRow;
		}

		if (this.player.squads.length === 0)
		{
			this.units[Math.floor(this.units.length / 2)].isKing = true;
			this.player.king = this.units[Math.floor(this.units.length / 2)];
		}
	}


	/**
	 * generateRow - generates a given row within the rectangle formation
	 *
	 * @param {number} numUnits the number of units to be in this row
	 * @param {Vector} center the center of this row
	 * @param {number} speed the speed of the units to be created
	 */
	generateRow(numUnits, center, speed)
	{
		var pos = new Vector(center.x, center.y);
		if (numUnits % 2 == 0)
			pos.x += SPACING / 2;
		var half = Math.floor(numUnits / 2);
		pos.x -= SPACING * half;
		for (var i = 0; i < numUnits; i++)
		{
			this.defaultLayout.push(new Vector(pos.x, pos.y));
			this.units.push(new Unit(['unit'], new Vector(pos.x, pos.y), new Vector(UNIT_SIZE, UNIT_SIZE), this.units.length, speed, this, this.player));
			pos.x += SPACING;
		}
	}


	/**
	 * move - calculates the rotated positions of all the units in this squad, performs
	 * A* to find the paths for each unit
	 *
	 * @param {Vector} destCenter the center of the new squad position
	 * @param {GameMap} map the map for performing A*
	 */
	move(destCenter, map)
	{
		if(this.defaultCenter.equals(destCenter))
			return;

		let centerTransform = Utils.newOrigin(this.direction, this.defaultCenter);
		let destCenterTransform = Utils.newOrigin(destCenter, this.defaultCenter);

		// Left rotation for units
		let newDestAngle = this.direction.angleBetweenTwoVectors(centerTransform, destCenterTransform);
		if (centerTransform.crossProduct(destCenterTransform) < 0)
		{
			// Right rotation for units
			newDestAngle = (2 * Math.PI) - newDestAngle;
		}
		this.heading = (this.heading + newDestAngle) % (Math.PI * 2);
		/*
		 * We will transform the unit position about the squad center by passing their coordinates through
		 * a transformation matrix with the respective angle at which the squad is rotating.
		 */
		let flip = false;
		let flipArray = new Array();
		let size = this.units.length;
		if (newDestAngle > Math.PI / 2 && newDestAngle < 3 * Math.PI / 2)
		{
			flip = true;
		}

		for (let i = 0; i < size; i++)
		{
			this.units[i].setMoveType(type.CLICK);
			// Normal move consists of setting all troop destinations
			if (!flip)
			{
				this.units[i].defaultPos = Utils.translationMatrix(this.defaultLayout[i], this.defaultCenter, this.position);
				this.edgeAvoidance(this, destCenter, newDestAngle, map, this.units[i].defaultPos, i);
			}
			else
			{
				flipArray.push(Utils.translationMatrix(this.defaultLayout[size - i - 1], this.defaultCenter, this.position));
			}
		}

		// If squad turns around, flip all squad positions to avoid wacky movement
		if (flip)
		{
			for (let i = 0; i < size; i++)
			{
				this.edgeAvoidance(this, destCenter, newDestAngle, map, flipArray[i], i);
			}
		}

		// Squad default center and squad direction are updated
		this.defaultCenter = Utils.average(this.defaultLayout);
		let dir = destCenterTransform.subtract(centerTransform);
		dir = dir.normalize();
		this.direction = new Vector(destCenter.x + dir.x, destCenter.y - dir.y);
	}

	/**
	 * edgeAvoidance - Helper function to prevent units from exiting map boundary
	 * @param {Squad} squad
	 * 		Our current moving squad
	 * @param {Vector} destination
	 * 		Our destination, relative to the center of the squad
	 * @param {number} theta
	 * 		Rotation angle from squads initial direction
	 * @param {GameMap} map
	 * 		The map we are in
	 * @param {Unit} toBeRotated
	 * 		The unit which will be rotated
	 * 		(toBeRotated is only necessary to allow 'flipArray' occurrences)
	 * @param {number} index
	 * 		The ith troop we are moving
	 */
	edgeAvoidance(squad, destination, theta, map, toBeRotated, index)
	{
		// Unit rotation and deep copy of defaultLayout
		squad.units[index].defaultPos = Utils.rotationMatrix(toBeRotated, squad.position, destination, theta);
		squad.defaultLayout[index] = JSON.parse(JSON.stringify(squad.units[index].defaultPos));
		let obstructed = this.checkObstacle(map, squad.units[index]);
		let unit = squad.units[index];

		if(obstructed)
		{
			this.avoidObstacle(unit, obstructed);
			unit.setDestination(map.aStar(unit.position, unit.defaultPos));
		}
		// Find if unit will walk out of map
		else if (!Utils.within(unit.defaultPos, new Vector(0, map.size.y), new Vector(map.size.x, 0)))
		{
			// Default to a position just inside where they would have walked out
			Utils.morphAlongMapEdge(unit, map);
			unit.setDestination(map.aStar(unit.position, unit.defaultPos));
		}
		else
		{
			// Default movement, defaultLayout was stored for when returning from edgeAvoidance() occurrence
			unit.setDestination(map.aStar(unit.position, squad.defaultLayout[index]));
			unit.defaultPos = this.defaultLayout[index];
		}
	}

	/**
	 * Find best avoidance position to take up
	 * @param {Unit} unit 
	 * @param {*} obstacle 
	 */
	avoidObstacle(unit, obstacle)
	{
		let north = unit.defaultPos.y < obstacle.position.y;
		let east  = unit.defaultPos.x > obstacle.position.x;
		let r     = obstacle.hitbox.x / 2;

		if(north)
			unit.defaultPos.y -= (r + unit.hitbox.y / 2);
		else
			unit.defaultPos.y += r + unit.hitbox.y / 2;
		if(east)
			unit.defaultPos.x += r + unit.hitbox.x / 2;
		else 
			unit.defaultPos.x -= (r + unit.hitbox.x / 2);
	}

	/**
	 * Verify if we will walk into an obstacle, if so then correct course
	 * 
	 * @param {GameMap} map 
	 * @param {Unit} unit 
	 * 
	 * @return {*} The obstacle the unit will encounter, false otherwise
	 */
	checkObstacle(map, unit)
	{
		let o;
		map.obstacles.forEach(function(obstacle)
		{
			let r      = obstacle.hitbox.x / 2;
			let tRight = new Vector(obstacle.position.x + r, obstacle.position.y - r);
			let bLeft  = new Vector(obstacle.position.x - r, obstacle.position.y + r);

			if(Utils.within(unit.defaultPos, bLeft, tRight))
			{
				o = obstacle;
			}
		});
		if(o !== undefined)
			return o;
		else
			return false;
	}

	/**
	 * setInventory - sets the inventory of this squad and its units
	 *
	 * @param {Inventory} inv the inventory to be set
	 */
	setInventory(inv)
	{
		this.units.forEach(function(u)
		{
			u.inventory.setWeapon(inv.weapon);
			u.inventory.setArmor(inv.armor);
		});
	}


	/**
	 * select - sets this squads units selected value to true
	 */
	select()
	{
		this.units.forEach((u) => u.selected.value = true);
	}


	/**
	 * deselect - deselects this squads units
	 */
	deselect()
	{
		this.units.forEach((u) => u.selected.value = false);
	}


	/**
	 * removeUnit - removes a given unit from this squad
	 *
	 * @param {Unit} u the unit to remove	
	 */
	removeUnit(u)
	{
		this.units = this.units.filter((unit) => unit != u);
	}

}

exports.Squad = Squad;
