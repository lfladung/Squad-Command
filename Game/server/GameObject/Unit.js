const GameObject = require('./GameObject.js').GameObject;
const Projectile = require('./Projectile.js').Projectile;

const Inventory = require('../Inventory/Inventory.js').Inventory;

const Utilities = require('../Utilities/Utils.js');
const Vector = Utilities.Vector;
const Utils = Utilities.Utils;
const type = Utils.type;
const weaponType = Utils.weaponType;

const UNIT_IMAGE = 'troop.png'
const HIT_ANGLE = 20;
const ACCELERATION = .1;


/**
 * Classs representing a Unit.
 * @extends GameObject
 */
class Unit extends GameObject
{

	/**
	 * Creates a new GameObject
	 *
	 * @param {String[]} tags the tags associated with this GameObject
	 * @param {Vector} position the position for this GameObject to start in
	 * @param {Vector} hitbox the x and y size of this hitbox of this GameObject
	 * @param {number} id the id for this GameObject
	 * @param {number} speed the speed of this GameObject
	 * @param {Squad} squad the squad that this GameObject is in
	 * @param {Player} player the player that this GameObject is owned by
	 */
	constructor(tags, position, hitbox, id, speed, squad, player)
	{
		super(tags, position, hitbox, id, UNIT_IMAGE);
		this.speed = speed;
		this.waypoints = [];
		this.squad = squad;
		this.moveType = type.NONE;
		this.player = player;
		this.selected = {
			value: false
		};
		this.inventory = squad.inventory;
		this.hp = {
			current: 10,
			max: 10
		};
		this.reloading = false;
		this.isKing = false;
		this.target = undefined;
		this.frameState = 1; // 0 to 60
		this.velocity = new Vector(0, 0);
		this.acceleration = ACCELERATION;
		this.defaultPos = this.position;
		this.level = 1;
		this.dmgBuff = 0;
		this.rangeBuff = 0;
		this.experience = 0;
	}


	/**
	 * setDestination - set the movement path of this gameObject
	 *
	 * @param {Vector[]} waypoints the waypoints for this GameObject to follow
	 */
	setDestination(waypoints)
	{
		this.waypoints = waypoints;
	}


	/**
	 * takeDamage - reduces this units hp by the specified damage and updates this player
	 *  and opposing players statistics if this unit dies
	 *
	 * @param {number} damage amount of damage to subtract from this hp
	 * @param {Unit} enemy the enemy unit attacking
	 */
	takeDamage(damage, enemy)
	{
		damage -= this.inventory.armor.getDefense();
		this.hp.current -= damage;
		if (this.hp.current <= 0)
		{
			this.player.game.removeGameObject(this);
			this.player.statistics.friendlyTroopsLost++;
			enemy.player.statistics.enemyTroopsKilled++;
		}
	}


	/**
	 * attack - performs an attack in the direction of the mouse, if this unit has a ranged
	 *  weapon then a projectile is created in the direction of the mouse. Then applies the cooldown
	 *  time for this attack
	 *
	 * @param {Object} mouse the coordinates that the attack should be in the direction of
	 */
	attack(mouse)
	{
		if (!this.reloading)
		{
			let dir = new Vector(mouse.x - this.position.x, mouse.y - this.position.y);
			dir.normalize();

			if (this.experience >= 3)
			{
				this.level++;
				this.player.statistics.kingLevel++;
				this.experience -= 3;
				this.dmgBuff += 3;
				this.rangeBuff += 3;
			}

			if (this.inventory.weapon.type === weaponType.MELEE)
				this.doMeleeAttack(dir);
			else if (this.inventory.weapon.type === weaponType.RANGED)
				this.doRangedAttack(dir);

			var self = this;
			this.reloading = true;
			setTimeout(() => self.reloading = false, this.inventory.weapon.getSpeed() * 1000);
		}
	}


	/**
	 * doMeleeAttack - performs a meleeAttack in a given direction
	 *
	 * @param {Vector} dir the direction to attack in
	 */
	doMeleeAttack(dir)
	{
		let range = this.inventory.weapon.getRange();
		let damage = this.inventory.weapon.getDamage();
		if (this.isKing)
			damage *= 2
		dir.scale(range);

		let left = Utils.rotateVector(dir, HIT_ANGLE);
		let right = Utils.rotateVector(dir, -HIT_ANGLE);
		let enemy;
		if (enemy = this.player.game.checkAttack(this, dir))
			enemy.takeDamage(damage, this);
	}


	/**
	 * doRangedAttack - creates a projectile moving in the given direction
	 *
	 * @param {Vector} dir the direction the projectile will move in
	 */
	doRangedAttack(dir)
	{
		let range = this.inventory.weapon.getRange();
		let damage = this.inventory.weapon.getDamage();
		this.player.game.addGameObject(new Projectile(['projectile'], new Vector(this.position.x, this.position.y),
			new Vector(5, 1), 0, 'projectile.png', damage, dir, 5, range, this.player));
	}


	/**
	 * update - called at every frame, in this function the unit moves if it has a destination or a target,
	 *  checks to see if any enemy troops are nearby every 60 frames, and attacks.
	 */
	update()
	{
		this.frameState = (this.frameState) % 60 + 1;

		if (this.hp.current <= 0) return;
		switch (this.moveType)
		{
			case type.CLICK:
				this.moveToDestination();
				break;
			case type.AI:
			case type.NONE:
				this.moveAI();
				break;
			case type.KEYBOARD:
				this.moveDirection();
				break;
		}
	}


	/**
	 * checkCollision - checks to see if there is a collision between this unit and any other
	 *  game objects. If the colliding object is a unit, a collision pair is made for a 2d collision
	 *  to be performed at the end of the current frame
	 *
	 * @return {*} false if no GameObjects, the nearby object if there is a collision
	 */
	checkCollision()
	{
		let nearby = this.player.game.map.getNearby(this, (o) => o instanceof GameObject && !(o instanceof Projectile));
		for (let i = 0; i < nearby.length; i++)
		{
			if (this.collision(nearby[i]))
			{
				if (nearby[i] instanceof Unit)
				{
					if (nearby[i].player != this.player)
						this.target = nearby[i];
					this.player.game.addCollisionPair(this, nearby[i]);
				}
				return nearby[i];
			}
		}

		return false;
	}


	/**
	 * setMoveType - sets the current move type of this unit, click and keyboard
	 *   have priority over ai
	 */
	setMoveType(t)
	{
		if (t === type.AI && this.moveType != type.CLICK && this.moveType != type.KEYBOARD)
			this.moveType = t;
		else if (t === type.CLICK || t === type.KEYBOARD || t === type.NONE)
			this.moveType = t;
	}


	/**
	 * moveAI - moves this unit according to AI functionallity by attacking nearby enemies and finding if there
	 * are any new nearby enemies
	 */
	moveAI()
	{
		if (this.frameState === 1 || this.target === undefined)
		{
			this.acquireTarget();
			if (this.target == undefined)
			{
				this.setMoveType(type.NONE);
				this.stop();
				return;
			}
		}
		if (this.position.distance(this.target.position) < this.inventory.weapon.getRange())
		{
			this.stop();
			this.attack(this.target.position);
			if (this.target.hp.current <= 0)
				this.acquireTarget();
		}
		else if (this.waypoints.length == 0 || this.waypoints[0].distance(this.target.position) > this.inventory.weapon.getRange())
			this.setDestination(this.player.game.map.aStar(this.position, this.target.position), 0);
		else
			this.moveToDestination();
	}


	/**
	 * acquireTarget - checks to see if there are any enemy troops nearby, if there,
	 *  the closest troop becomes the target of this unit
	 */
	acquireTarget()
	{
		let nearby = this.player.game.map.getNearby(this, (obj) => obj.player != this.player && obj instanceof Unit);
		if (nearby.length === 0)
			this.setMoveType(type.NONE);
		let self = this;
		nearby.sort((a, b) => self.position.distance(a.position) - self.position.distance(b.position));
		this.target = nearby[0];
	}


	/**
	 * stop - sets the acceleration of this unit to the negative direction of this units
	 *  movement, effictively stopping the unit after multiple frames
	 */
	stop()
	{
		this.setDestination([]);
		let accel = new Vector(0, 0);
		if (this.velocity.x > 0)
			accel.x = -1;
		else if (this.velocity.x < 0)
			accel.x = 1;
		if (this.velocity.y > 0)
			accel.y = -1;
		else if (this.velocity.y < 0)
			accel.y = 1;

		accel.normalize();
		accel.scale(this.acceleration);

		this.updateVelocity(accel);
		this.move();

		// Preliminary attempt to avoid collision problem
		// if(!this.position.equals(this.defaultPos) && this.waypoints.length < 1)
		// {
		// 	this.position.x += ((this.defaultPos.x - this.position.x) / 10);
		// 	this.position.y += ((this.defaultPos.y - this.position.y) / 10);
		// }
			
	}


	/**
	 * updateVelocity - updates the velocity of this unit by the given acceleration
	 *
	 * @param {Vector} accel the acceleration to be applied to the velocity
	 */
	updateVelocity(accel)
	{
		if ((this.velocity.x < 0 && accel.x + this.velocity.x > 0) ||
			(this.velocity.x > 0 && accel.x + this.velocity.x < 0))
		{
			accel.x = 0;
			this.velocity.x = 0;
		}
		if ((this.velocity.y < 0 && accel.y + this.velocity.y > 0) ||
			(this.velocity.y > 0 && accel.y + this.velocity.y < 0))
		{
			accel.y = 0;
			this.velocity.y = 0;
		}

		this.velocity.x += accel.x;
		this.velocity.y += accel.y;

		if (this.velocity.magnitude() > this.speed)
		{
			this.velocity.normalize();
			this.velocity.scale(this.speed);
		}

		if (this.velocity.magnitude() > this.speed)
		{
			this.velocity.normalize();
			this.velocity.scale(this.speed);
		}
	}


	/**
	 * move - performs a move with the current velocity.
	 *   also checks for collisions and region changes
	 */
	move()
	{
		let originalPos = Vector.clone(this.position);
		let lastPos = Vector.clone(this.position);

		if (this.velocity.x < 0)
		{
			if (this.position.x + this.velocity.x - this.hitbox.x / 2 < 0)
			{
				this.position.x = this.hitbox.x / 2;
				this.velocity.x = 0;
			}
			else
				this.position.x += this.velocity.x;
		}
		else
		{
			if (this.position.x + this.velocity.x + this.hitbox.x / 2 > this.player.game.map.size.x)
			{
				this.position.x = this.player.game.map.size.x - this.hitbox.x / 2;
				this.velocity.x = 0;
			}
			else
				this.position.x += this.velocity.x;
		}


		if (this.checkCollision())
		{
			this.position.x = lastPos.x;
			this.position.y = lastPos.y;
		}
		else
		{
			lastPos = Vector.clone(this.position);
		}


		if (this.velocity.y < 0)
		{
			if (this.position.y + this.velocity.y - this.hitbox.y / 2 < 0)
				this.position.y = this.hitbox.y / 2;
			else
				this.position.y += this.velocity.y;
		}
		else
		{
			if (this.position.y + this.velocity.y + this.hitbox.y / 2 > this.player.game.map.size.y)
				this.position.y = this.player.game.map.size.y - this.hitbox.y / 2;
			else
				this.position.y += this.velocity.y;
		}

		if (this.checkCollision())
		{
			this.position.x = lastPos.x;
			this.position.y = lastPos.y;
		}

		this.player.game.map.checkRegion(originalPos, this);
	}


	/**
	 * moveDirection - moves this unit by the Players current keys state
	 */
	moveDirection()
	{
		let keys = this.player.keys;
		let accel = new Vector(0, 0);
		if (keys.right)
			accel.x = 1;
		else if (keys.left)
			accel.x = -1;
		else if (this.velocity.x != 0)
			accel.x = -(this.velocity.x) / Math.abs(this.velocity.x);
		if (keys.up)
			accel.y = -1;
		else if (keys.down)
			accel.y = 1;
		else if (this.velocity.y != 0)
			accel.y = -(this.velocity.y) / Math.abs(this.velocity.y);

		accel.normalize();
		accel.scale(this.acceleration);

		this.updateVelocity(accel);

		this.move();
	}


	/**
	 * distanceToDestination - returns the current distance to the final destination
	 *   (not linear, distance between each waypoint)
	 *
	 * @return {number} distance to the final endpoint
	 */
	distanceToDestination()
	{
		let distance = 0;
		let currentPos = this.position;
		this.waypoints.forEach((w) =>
		{
			let v = new Vector(w.x - currentPos.x, w.y - currentPos.y);
			distance += v.magnitude();
			currentPos = w;
		});

		return distance;
	}


	/**
	 * stoppingDistance - returns the distance necessary to stop with the current speed
	 *
	 * @return {number} current stopping distance
	 */
	stoppingDistance()
	{
		let speed = this.velocity.magnitude();
		return (speed * speed) / (2 * this.acceleration);
	}


	/**
	 * moveToDestination - moves the unit according to the path in waypoints
	 */
	moveToDestination()
	{
		if (this.waypoints.length < 1 && this.distanceToDestination() <= this.stoppingDistance())
			this.stop();
		else
		{
			let w = this.waypoints[this.waypoints.length - 1];
			let accel = new Vector(w.x - this.position.x, w.y - this.position.y);
			accel.normalize();
			accel.scale(this.acceleration);
			this.updateVelocity(accel);
			this.move();
			if (this.position.distance(w) < this.stoppingDistance())
			{
				this.waypoints.pop();
			}
		}

		if (this.waypoints.length == 0)
			this.setMoveType(type.NONE);
	}


	/**
	 * removeFromSquad - removes this unit from its squad
	 */
	removeFromSquad()
	{
		var that = this;
		this.squad.removeUnit(this);
		this.player.game.removeGameObject(this);
	}
}

exports.Unit = Unit;
