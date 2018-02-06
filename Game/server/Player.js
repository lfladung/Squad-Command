const Utilities = require('./Utilities/Utils.js');
const Vector = Utilities.Vector;
const Utils = Utilities.Utils;
const Unit = require('./GameObject/Unit.js').Unit;
const Stomp = require('./GameObject/Stomp.js').Stomp;
const FlameWall = require('./GameObject/FlameWall.js').FlameWall;
const type = Utils.type;
const mode = Utils.mode;


/**
 * Class representing the statistics of a player
 */
class Statistics
{

	/**
	 * Creates a statistics object with all attribs set to 0 and won set to false
	 */
	constructor()
	{
		this.kingLevel = 1;
		this.moneyEarned = 0;
		this.enemyTroopsKilled = 0;
		this.friendlyTroopsLost = 0;
		this.xp = 0;
		this.won = false;
	}
}

SELECT_DISTANCE = 10;


/**
 * Class representing a Player object in a Game
 */
class Player
{

	/**
	 * Creates a player object
	 * @param {String} username the username associated with this player
	 * @param {Game} game the game that this player is being placed into
	 * @param {Socket} socket the socket this player will use for communication with the
	 *  client
	 */
	constructor(username, game, socket)
	{
		this.username = username;
		this.game = game;
		this.squads = [];
		this.selected = [];
		this.socket = socket;
		this.statistics = new Statistics();
		this.keys = {
			up: false,
			right: false,
			down: false,
			left: false
		};
		this.stompStart = 0;
		this.king = undefined;
		this.mode = mode.COMMAND;
		this.money = 0;
	}

	heal()
	{
		if (this.king.hp.current < this.king.hp.max - 2)
			this.king.hp.current += 2;
		else if (this.king.hp.current > this.king.hp.max)
			this.king.hp.current = this.king.hp.max;
	}

	flamewall(mouse)
	{
		if (this.game.fire[0] == null)
		{
			let flamewall = new FlameWall(mouse, this);
		}
	}

	stomp()
	{
		if (this.stompStart == 0)
		{
			var start = Date.now();
			this.stompStart = start;
		}
	}

	stompEnd()
	{
		var end = Date.now();
		if (end - this.stompStart >= 3000)
		{
			let stomp = new Stomp(3000, this);
		}
		else
		{
			let stomp = new Stomp(end - this.stompStart, this);
		}
		this.stompStart = 0;
	}

	/**
	 * leftclick - Called when the client associated with this player clicks the left mouse button.
	 * 	If the player is in Command mode, it will attempt to select this players units
	 * 	Else the players King unit will perform an attack in the direction of the mouse
	 *
	 * @param {Object} mouse represents the direction and position of the mouse on the client
	 *  side, recorded when the player clicks
	 */
	leftclick(mouse)
	{
		if (this.mode === mode.COMMAND)
		{
			let nearby = this.game.map.getNearby(
			{
				position: new Vector(mouse.x, mouse.y)
			}, (o) => o instanceof Unit && o.player === this, 10);
			for (let i = 0; i < nearby.length; i++)
			{
				let contains = false;
				for (let j = 0; j < this.selected.length; j++)
				{
					if (this.selected[j].id === nearby[i].squad.id)
						contains = true;
				}

				if (!contains)
				{
					this.selected.push(nearby[i].squad);
					nearby[i].squad.select();
				}
			}
			if (nearby.length < 1)
			{
				this.selected.forEach((squad) => squad.deselect());
				this.selected = [];
			}
		}
		else
		{
			this.king.attack(mouse);
		}
	}

	selectionBox(mouse)
	{
		var selectedCount = 0;
		for (var i = 0; i < this.squads.length; i++)
		{
			// The next six lines calculate the rotation of the mouse to the selection box
			let squad = this.squads[i];
			let selected = false;
			if (typeof mouse.x === 'undefined')
			{
				// Drag and drop box dimensions
				let boxBLeft = new Vector(mouse.left, mouse.bottom);
				let boxTRight = new Vector(mouse.right, mouse.top);
				selected = this.clickRotationHelper(squad, [boxBLeft, boxTRight]);
			}
			else
			{
				let nearby = this.game.map.getNearby(
				{
					position: new Vector(mouse.x, mouse.y)
				}, (o) => o instanceof Unit && o.player === this, 10);
				for (let i = 0; i < nearby.length; i++)
				{
					let contains = false;
					for (let j = 0; j < this.selected.length; j++)
					{
						if (this.selected[j].id === nearby[i].squad.id)
							contains = true;
					}

					if (!contains)
					{
						this.selected.push(nearby[i].squad);
						nearby[i].squad.select();
					}
				}
				if (nearby.length < 1)
				{
					this.selected.forEach((squad) => squad.deselect());
					this.selected = [];
				}


			}

			if (selected)
			{
				// var selected = true;
				selectedCount++;
				if (!this.selected.includes(squad))
				{
					squad.select();
					this.selected.push(squad);
				}
			}
		}
		if (selectedCount == 0)
		{
			this.selected.forEach((squad) => squad.deselect());
			this.selected = [];
		}
	}

	/**
	 * clickRotationHelper - this is just a helper method to handle the multiple click
	 * rotations that are needed to select squads
	 * @param {*} squad
	 * 		squad we are trying to select
	 * @param {*} mouse
	 * 		mouse click locations
	 * @return
	 * 		properly rotated points
	 */
	clickRotationHelper(squad, mouse)
	{
		let theta = 5 * Math.PI / 2 - squad.heading;

		// Single click
		if (mouse.length == 1)
		{
			// Rotate our mouse
			let select = Utils.rotationMatrix(mouse[0], squad.position, mouse[0], theta);
			return Utils.within(select, squad.selectionBox.bottomLeft, squad.selectionBox.topRight);
		}
		// Drag and drop Box
		else if (mouse.length == 2)
		{
			// Rotate our drag and drop box to line up with the squad selection box
			let bleft = Utils.rotationMatrix(mouse[0], squad.position, mouse[0], theta);
			let tright = Utils.rotationMatrix(mouse[1], squad.position, mouse[1], theta);

			// We run into an issue when rotating the D&D box, upon particular rotations
			// the roles the 'top right' and 'bottom left' variables play could be reversed.
			// Hence, in the event the roles are inverse, we will flip the necessary values
			if (bleft.x > tright.x)
			{
				let temp = bleft.x;
				bleft.x = tright.x;
				tright.x = temp;
			}
			if (bleft.y < tright.y)
			{
				let temp = bleft.y;
				bleft.y = tright.y;
				tright.y = temp;
			}

			/*
			 * To summarize, the next four lines check:
			 * 		- Is bottom left of D&D box to the right of squad selection box
			 * 		- Is bottom left of D&D box above top right of squad selection box
			 * 		- Is top right of D&D box to the left of squad selection box
			 * 		- Is top right of D&D box below the squad selection box
			 * If any of these conditions holds true, then the squad could not possibly get selected
			 */
			let east = !(bleft.x > squad.selectionBox.topRight.x);
			let north = !(bleft.y < squad.selectionBox.topRight.y);
			let west = !(tright.x < squad.selectionBox.bottomLeft.x);
			let south = !(tright.y > squad.selectionBox.bottomLeft.y);

			return east && north && west && south;
		}
		// Nothing was selected
		else
		{
			return false;
		}
	}


	/**
	 * toggleMode - Toggles the mode of this player between mode.COMMAND and mode.BATTLE and then
	 * notifies the client this player is associated with. This funciton handles the
	 * mode switch for the King unit as well, toggling between player controlled and the AI
	 */
	toggleMode()
	{
		if (this.mode === mode.COMMAND)
		{
			this.mode = mode.BATTLE;
			this.king.moveType = type.KEYBOARD;
		}
		else
		{
			this.mode = mode.COMMAND;
			this.king.moveType = type.CLICK;
		}

		let self = this;
		this.socket.emit('mode',
		{
			mode: self.mode,
		});
	}


	/**
	 * rightClick - Called when the client associated with this player right clicks, will move
	 *   the selected units to the clicked location
	 *
	 * @param {Object} mouse object representation containing the mouse position
	 *  of the click
	 */
	rightclick(mouse)
	{
		let length = this.selected.length;
		if (this.selected.length > 0)
		{
			let avg = Utils.average(this.selected);
			for (let i = 0; i < length; i++)
			{
				let s = this.selected[i];
				s.move(mouse, this.game.map);
			}
		}
	}


	/**
	 * keyChange - Called when the client associated with this player presses or releases a key
	 *
	 * @param {Object} keys object representing which keys are currently being pressed
	 */
	keyChange(keys)
	{
		this.keys = keys;
	}


	/**
	 * addSquad - Adds the given squad to this players array of squads
	 *
	 * @param {Squad} squad squad to be added to this players squad
	 */
	addSquad(squad)
	{
		squad.id = Utils.generateId(this.squads);
		this.squads.push(squad);
		var self = this;
		squad.units.forEach(function(u)
		{
			self.game.addGameObject(u);
		});
		if (this.squads.length == 1)
			this.king = this.squads[0].units[this.squads[0].units.length / 2];

		this.game.addGameObject(squad);
	}


	/**
	 * removeSquad - Removes the given squad from this Players array of squads
	 *
	 * @param {Squad} s squad to be removed
	 */
	removeSquad(s)
	{
		this.squads = this.squads.filter((squad) => squad != s);
		this.selected = this.selected.filter((squad) => squad != s);
		this.game.removeGameObject(s);
	}
}

exports.Player = Player;
