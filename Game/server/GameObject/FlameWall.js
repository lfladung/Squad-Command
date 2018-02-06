const SuperAttack = require('./SuperAttack.js').SuperAttack;
const Fire = require('./Fire.js').Fire;
const Unit = require('./Unit.js').Unit;
const Utilities = require('../Utilities/Utils.js');
const Vector = Utilities.Vector;

class FlameWall extends SuperAttack
{
	constructor(mouse, player)
	{
		super();

		var king = player.king;
		var distance = Math.sqrt(Math.pow(mouse.x - king.position.x, 2) + Math.pow(mouse.y - king.position.y, 2));

		var x1 = king.position.x - (10 / distance) * (king.position.x - mouse.x);
		var y1 = king.position.y - (10 / distance) * (king.position.y - mouse.y);

		var x2 = king.position.x - (20 / distance) * (king.position.x - mouse.x);
		var y2 = king.position.y - (20 / distance) * (king.position.y - mouse.y);

		var x3 = king.position.x - (30 / distance) * (king.position.x - mouse.x);
		var y3 = king.position.y - (30 / distance) * (king.position.y - mouse.y);

		var flame1pos = new Vector(x1, y1);
		var flame1hit = new Vector(10, 10);
		var flame2pos = new Vector(x2, y2);
		var flame2hit = new Vector(10, 10);
		var flame3pos = new Vector(x3, y3);
		var flame3hit = new Vector(10, 10);

		this.f1 = new Fire(['fire'], flame1pos, flame1hit, 0, player);
		this.f2 = new Fire(['fire'], flame2pos, flame2hit, 0, player);
		this.f3 = new Fire(['fire'], flame3pos, flame3hit, 0, player);
		player.game.addGameObject(this.f1);
		player.game.addGameObject(this.f2);
		player.game.addGameObject(this.f3);
		var that = this;
		setTimeout(function()
		{
			player.game.removeGameObject(that.f1);
			player.game.removeGameObject(that.f2);
			player.game.removeGameObject(that.f3);
		}, 3000);


	}


	update()
	{

	}
}

exports.FlameWall = FlameWall;
