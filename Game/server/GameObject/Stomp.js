const SuperAttack = require('./SuperAttack.js').SuperAttack;
const Unit = require('./Unit.js').Unit;

class Stomp extends SuperAttack
{
	constructor(time, player)
	{
		super();
		var damage = time / 350;
		var radius = (time / 100) + 10;

		var hit = player.game.map.getNearby(player.king, (o) => o instanceof Unit && o.player != player, radius);

		hit.forEach(function(troop)
		{
			troop.hp.current -= damage;
			if (troop.hp.current <= 0)
			{
				troop.removeFromSquad();
			}
		});
	}

	update()
	{

	}
}

exports.Stomp = Stomp;
