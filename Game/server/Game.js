const Player = require('./Player.js').Player;

const GO = require('./GameObject/GO.js');
const Unit = GO.Unit;
const GameObject = GO.GameObject;
const Projectile = GO.Projectile;
const Fire = GO.Fire;
const Squad = GO.Squad;

const Utilities = require('./Utilities/Utils.js');
const Vector = Utilities.Vector;
const Utils = Utilities.Utils;

const GameMap = require('./Navigation/GameMap.js').GameMap;

const Inv = require('./Inventory/Inventory.js');
const Weapon = Inv.Weapon;
const Armor = Inv.Armor;
const Inventory = Inv.Inventory;

const fs = require('fs');

FPS = 60; // desired frames per second
FRAME_RATE = 1 / FPS * 1000; // ms per frame
PLAYER_SPEED = 60 / FPS; // player speed
STARTING_SQUADS = 1;


/**
 * Class representing a Game instance
 */
class Game
{

	/**
	 * Creates a new game object
	 *
	 * @param {Socket[]} sockets array of sockets representing the two players in
	 *   this game instance
	 * @param {number} id id assigned to this game
	 * @param {GameMap} map the map that this game will use for images and pathfinding
	 */
	constructor(sockets, id, map, remove)
	{
		this.sockets = sockets;
		this.id = id;
		this.messages = [];

		this.gameObjects = [];
		this.projectiles = [];
		this.troops = [];
		this.collisions = [];
		this.fire = [];

		this.weapons = [];
		this.armor = [];

		this.map = new GameMap(map.image, map.obstacles, map.size, map.hardnessMap);

		let self = this;

		let weapons = JSON.parse(fs.readFileSync('./server/Inventory/weapon.json', 'utf8'));
		let armor = JSON.parse(fs.readFileSync('./server/Inventory/armor.json', 'utf8'));
		weapons.forEach((w) => self.weapons.push(new Weapon(w.tag, w.name, w.damage, w.range, w.speed, w.type)));
		armor.forEach((a) => self.armor.push(new Armor(a.tag, a.name, a.defense)));
		this.initSockets();
		map.obstacles.forEach((o) => self.addGameObject(new GameObject(['obstacle'], o.position, o.hitbox, 0, o.image)));
		this.isGameOver = false;
		this.spectators = [];
	}


	/**
	 * initSockets - Helper function to set up the Player objects for each socket
	 */
	initSockets()
	{
		let self = this;
		let pos = new Vector(250, 100);

		this.sockets.forEach(function(s)
		{
			s.game = self;
			s.player = new Player(s.user, self, s);

			for (var i = 0; i < STARTING_SQUADS; i++)
			{
				let weapon = self.getRandomWeapon();
				let armor = self.getRandomArmor();
				s.player.addSquad(new Squad(i, 10, new Vector(pos.x - 100, pos.y), PLAYER_SPEED, new Inventory(weapon, armor), s.player));
				weapon = self.getRandomWeapon();
				armor = self.getRandomArmor();
				s.player.addSquad(new Squad(i, 10, new Vector(pos.x + 100, pos.y), PLAYER_SPEED, new Inventory(weapon, armor), s.player));
			}
			pos.y = 400;
		});
	}

	/*
	 * run - Function called to start this games update loop
	 */
	run()
	{
		var that = this;
		this.sockets.forEach((s) =>
		{
			s.emit('setup',
			{
				id: s.id,
				map: that.map.image
			});
		});
		this.interval = setInterval(function()
		{
			that.update();
		}, FRAME_RATE);
	}

	/*
	 * update - Send necessary information to players at each Frame and performs collisions and updates
	 */
	update()
	{
		this.collisions = [];
		this.gameObjects.forEach((o) => o.update());
		this.sockets.forEach((s) => s.player.squads.forEach((squad) => squad.update()));
		let winner;
		if (winner = this.gameOver())
			this.endGame(winner);

		let updatePack = {
			projectiles: this.projectiles,
			troops: this.troops,
			obstacles: this.map.obstacles,
			fire: this.fire
		}
		this.sockets.forEach((s) => s.emit('update', updatePack));
		this.spectators.forEach((s) => s.emit('update', updatePack));
		let self = this;
		this.collisions.forEach((p) => self.performCollision(p[0], p[1]));
	}


	/**
	 * performCollision - Performs a single collision between GameObject a and GameObject b using
	 *  physics calculations
	 *
	 * @param {GameObject} a the GameObject colliding with b
	 * @param {GameObject} b the GameObject colliding with a
	 */
	performCollision(a, b)
	{
		// direction vector of collision from object a to object b
		let ab = new Vector(b.position.x - a.position.x, b.position.y - a.position.y);
		ab.normalize();
		let ba = Vector.clone(ab);
		ba.scale(-1);

		let aTradeMag = a.velocity.dotProduct(ab);
		ab.scale(aTradeMag)
		a.velocity.subtract(ab);

		// direction vector of collision from object b to object a


		let bTradeMag = b.velocity.dotProduct(ba);
		ba.scale(bTradeMag);
		b.velocity.subtract(ba);

		a.velocity.add(ba);
		b.velocity.add(ab);
	}


	/**
	 * gameOver - Checks to see if the game is over yet (if either king is dead)
	 *
	 * @return {*} false if the game isn't over, else returns the winning player
	 */
	gameOver()
	{
		if (this.sockets[0].player.squads.length == 0 || this.sockets[0].player.king.hp.current <= 0)
			return this.sockets[1].player;
		else if (this.sockets[1].player.squads.length == 0 || this.sockets[1].player.king.hp.current <= 0)
			return this.sockets[0].player;
		return false;
	}


	/**
	 * getRandomWeapon - Gets a random weapon from the list of weapons
	 *
	 * @return {Weapon} a random weapon
	 */
	getRandomWeapon()
	{
		let index = Math.floor(Math.random() * this.weapons.length);
		return this.weapons[index];
	}


	/**
	 * getRandomArmor - Gets a random armor from the list of armor
	 *
	 * @return {Armor} a random armor
	 */
	getRandomArmor()
	{
		let index = Math.floor(Math.random() * this.armor.length);
		return this.armor[index];
	}


	/**
	 * endGame - Ends this game and sends both players their final statistics
	 *
	 * @param {Player} winner the player that has won
	 */
	endGame(winner)
	{
		if (!this.isGameOver)
		{
			this.isGameOver = true;

			clearInterval(this.interval);
			if (!this.sockets[0].connected)
			{
				this.sockets[1].player.statistics.won = true;
				this.sockets[1].emit("game over", this.sockets[1].player.statistics);
			}
			else if (!this.sockets[1].connected)
			{
				this.sockets[0].player.statistics.won = true;
				this.sockets[0].emit("game over", this.sockets[0].player.statistics);
			}
			else
			{
				if (winner) winner.statistics.won = true;
				this.sockets.forEach((s) => s.emit("game over", s.player.statistics));
			}
		}

		this.spectators.forEach((s) => s.emit("game over"));
	}


	/**
	 * checkAttack - Checks to see if the given troop attacking in the forward direction will land
	 * the attack on an enemy unit (if multiple then the closest enemy in that direction)
	 *
	 * @param {Unit} troop troop that is attacking
	 */
	checkAttack(troop, forward)
	{
		let closest = {
			smallestDist: 1000,
			closestEnemy: false
		};

		this.map.getNearby(troop, (o) =>
		{
			if (o instanceof Unit && o.player != troop.player)
			{
				let diff = new Vector(o.position.x - troop.position.x, o.position.y - troop.position.y);

				if (diff.magnitude() <= forward.magnitude() && diff.angleBetween(forward) * 180 / Math.PI < 30)
				{
					closest.smallestDist = diff.magnitude();
					closest.closestEnemy = o;
				}
			}

			return false;
		});

		return closest.closestEnemy;
	}


	/**
	 * addGameObject - adds the given GameObject to this Game's list of gameObjects
	 *  and updates the list that corresponds to the GameObject's type
	 *
	 * @param {GameObject} o the game object to be added
	 */
	addGameObject(o)
	{
		o.id = Utils.generateId(this.gameObjects);
		this.gameObjects.push(o);
		this.map.insertObject(o);

		if (o instanceof Unit)
			this.troops.push(
			{
				position: o.position,
				hitbox: o.hitbox,
				id: o.id,
				image: o.image,
				ownerId: o.player.socket.id,
				selected: o.selected,
				isKing: o.isKing,
				hp: o.hp
			});
		else if (o instanceof Projectile)
			this.projectiles.push(
			{
				position: o.position,
				hitbox: o.hitbox,
				image: o.image,
				direction: o.direction,
				id: o.id
			});
		else if (o instanceof Fire)
			this.fire.push(
			{
				position: o.position,
				hitbox: o.hitbox,
				id: o.id,
				image: o.image
			});
	}


	/**
	 * addCollisionPair - adds a collision pair between two GameObjects to be performed
	 *  at the end of this frame, erased after the collision is performed
	 *
	 * @param {GameObject} o1 first object to be colliding with
	 * @param {GameObject} o2 second object to be colliding with
	 */
	addCollisionPair(o1, o2)
	{
		// make sure o1 with o2 is not already existent
		for (let i = 0; i < this.collisions.length; i++)
			if (this.collisions[i][0] == o1 && this.collisions[i][1] == o2 ||
				this.collisions[i][0] == o2 && this.collisions[i][1] == o1)
				return;
		this.collisions.push([o1, o2]);
	}


	/**
	 * removeGameObject - removes the given GameObject from the list of gameObjects
	 *  and the corresponding list to the GameObjects type
	 *
	 * @param {GameObject} o gameobject to be removed
	 */
	removeGameObject(o)
	{
		this.gameObjects = this.gameObjects.filter((go) => go != o);
		this.map.removeObject(o);

		if (o instanceof Unit)
			this.troops = this.troops.filter((t) => t.id != o.id);
		else if (o instanceof Projectile)
			this.projectiles = this.projectiles.filter((p) => p.id != o.id);
		else if (o instanceof Fire)
			this.fire = this.fire.filter((f) => f.id != o.id);
	}


	/**
	 * sendMessage - sends the given message to both players
	 *
	 * @param {String} msg the message to be sent
	 */
	sendMessage(username, msg)
	{
		let message = {
			username: username,
			msg: msg
		}
		this.messages.push(message);
		this.sockets.forEach((s) => s.emit("message", message));
	}

	addSpectator(socket)
	{
		this.spectators.push(socket);
		socket.emit('setup',
		{
			map: this.map.image
		});
	}

	removeSpectator(socket)
	{
		this.spectators = this.spectators.filter((s) => s != socket);
	}
}

exports.Game = Game;
