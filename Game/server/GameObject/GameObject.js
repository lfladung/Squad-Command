const Utilities = require('../Utilities/Utils.js');
const Utils = Utilities.Utils;
const Vector = Utilities.Vector;


/**
 * Class representing a GameObject
 */
class GameObject
{

	/**
	 * Creates a new GameObject
	 *
	 * @param {String[]} tags the tags associated with this GameObject
	 * @param {Vector} position the position of this gameobject
	 * @param {Vector} hitbox the hitbox dimensions of this object
	 * @param {number} id the id of this gameobject
	 * @param {String} image the image file name associated with this gameObject
	 */
	constructor(tags, position, hitbox, id, image)
	{
		this.tags = tags;
		this.position = position;
		this.id = id;
		this.hitbox = hitbox;
		this.image = image;
	}


	/**
	 * update - function to be called at every game frame to update this object
	 */
	update()
	{
		return false;
	}


	/**
	 * collision - checks to see if this gameObject is colliding with another by checking
	 * for hitbox collisions
	 *
	 * @param {GameObject} o the game object to check with
	 *
	 * @return {boolean} true if there is a collision, false otherwise	
	 */
	collision(o)
	{
		let tr = new Vector(this.position.x + this.hitbox.x / 2, this.position.y - this.hitbox.y / 2);
		let br = new Vector(this.position.x + this.hitbox.x / 2, this.position.y + this.hitbox.y / 2);
		let bl = new Vector(this.position.x - this.hitbox.x / 2, this.position.y + this.hitbox.y / 2);
		let tl = new Vector(this.position.x - this.hitbox.x / 2, this.position.y - this.hitbox.y / 2);

		let bleft = new Vector(o.position.x - o.hitbox.x / 2, o.position.y + o.hitbox.y / 2);
		let tright = new Vector(o.position.x + o.hitbox.x / 2, o.position.y - o.hitbox.y / 2);

		return Utils.within(tr, bleft, tright) || Utils.within(br, bleft, tright) ||
			Utils.within(bl, bleft, tright) || Utils.within(tl, bleft, tright);
	}
}

exports.GameObject = GameObject;
