const GameObject = require('./GameObject.js').GameObject;
const Vector = require('../Utilities/Utils.js').Vector;
const Utils = require('../Utilities/Utils.js').Utils;

/**
 * Class representing a Projectile.
 * @extends GameObject
 */
class Projectile extends GameObject
{

	/**
	 * Creates a projectile object
	 *
	 * @param {String[]} tags the tags associated with this projectile
	 * @param {Vector} position the position of this projectile
	 * @param {Vector} hitbox the hitbox size of this projectile
	 * @param {number} id the id of this projectile
	 * @param {String} image the image associated with this Projectile
	 * @param {number} damage the damage this projectile will do if it hits an enemy
	 * @param {Vector} direction the direction this projectile will move in
	 * @param {number} speed the speed of this Projectile
	 * @param {number} range the distance this projectile can travel before being deleted
	 * @param {Player} player the player that shot this projectile
	 */
	constructor(tags, position, hitbox, id, image, damage, direction, speed, range, player)
	{
		super(tags, position, hitbox, id, image);
		this.damage = damage;
		this.direction = new Vector(direction.x, direction.y);
		this.direction.normalize();
		this.speed = speed;
		this.start = Vector.clone(this.position);
		this.game = player.game;
		this.range = range;
		this.player = player;
	}


	/**
	 * inBoundingBox - returns true if the object o is within this projectiles bounding box
	 *
	 * @param {GameObject} o object to check
	 * @return {boolean} true
	 */
	inBoundingBox(o)
	{
		return true;
	}


	/**
	 * checkCollision - checks to see if this projectile is colliding with any GameObjects
	 *
	 * @return {*} returns false if there is no collision, otherwise returns the GameObject
	 *  collided with
	 */
	checkCollision()
	{
		let nearby = this.game.map.getNearby(this, (o) =>
		{
			if (o.player == this.player || !(o instanceof GameObject) ||
				o instanceof Projectile || o.tags[0] === 'fire') return false;
			return this.inBoundingBox(o);
		});

		for (let i = 0; i < nearby.length; i++)
		{
			if (this.collision(nearby[i]))
				return nearby[i];
		}

		return false;
	}

	/**
	 * update - updates this projectiles position and checks for collision
	 */
	update()
	{
		let col;
		this.move();
		if (this.distanceTravelled() <= this.range)
		{
			if (col = this.checkCollision())
			{
				if (col.player != undefined && col.units === undefined)
				{
					col.takeDamage(this.damage, this);
				}
				this.game.removeGameObject(this);
			}
			if (this.distanceTravelled() == this.range)
				this.game.removeGameObject(this);
		}
		else
			this.game.removeGameObject(this);
	}

	/**
	 * distanceTravelled - returns the distance this projectile has travelled since creation
	 *
	 * @return {number} the distance travelled
	 */
	distanceTravelled()
	{
		let v = new Vector(this.position.x - this.start.x, this.position.y - this.start.y);
		return v.magnitude();
	}


	/**
	 * move - moves this projectile according to its current velocity and checks to see
	 * if it is out of bounds or has travelled passed its range, resulting in a deletition of this object
	 */
	move()
	{
		let vel = new Vector(this.direction.x, this.direction.y);
		vel.normalize();
		vel.scale(this.speed);
		let lastPos = {
			x: this.position.x,
			y: this.position.y
		}
		this.position.x += vel.x;
		this.position.y += vel.y;

		if (this.position.x > this.game.map.size.x - 1 || this.position.x < 0 ||
			this.position.y > this.game.map.size.y - 1 || this.position.y < 0)
		{
			this.position.x = lastPos.x;
			this.position.y = lastPos.y;
			this.game.removeGameObject(this);
			return;
		}

		this.game.map.checkRegion(lastPos, this);
	}
}

exports.Projectile = Projectile;
