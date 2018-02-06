const GameObject = require('./GameObject.js').GameObject;
const Unit = require('./Unit.js').Unit;

FIRE_IMAGE = 'fire.png'

class Fire extends GameObject
{
	constructor(tags, position, hitbox, id, player)
	{
		super(tags, position, hitbox, id, FIRE_IMAGE);
		this.player = player;
		this.radius = 25;
		this.damage = .01;
	}

	update()
	{
		var hit = this.player.game.map.getNearby(this, (o) => o instanceof Unit && o.player != this.player, this.radius);
		var that = this;
		hit.forEach(function(troop)
		{
			troop.hp.current -= that.damage;
			if (troop.hp.current <= 0)
			{
				troop.removeFromSquad();
			}
		});
		return false;
	}

	execute()
	{

	}
}

exports.Fire = Fire;
