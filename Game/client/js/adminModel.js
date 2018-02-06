/**
 * Changetypes dictate state of change to be made to the game
 */
changeType = {
	PLAYER_REMOVED: 0,
	PLAYER_ADDED: 1,
	GAME_REMOVED: 2,
	GAME_ADDED: 3,
	S_GAME_CHANGE: 4
};

/**
 * Model portion of MVC layout of admin
 */
class Model
{
	/**
	 * Constructor for Model
	 * Initializes games, players, and observer arrays
	 */
	constructor(games, players)
	{
		this.games = games;
		this.players = players;
		this.observers = [];
	}

	/**
	 * Notify all observers of the current change
	 * @param {*} change
	 */
	notifyObservers(changed, change)
	{
		this.observers.forEach((o) => o.update(changed, change))
	}

	/**
	 * Add observers to the current admin
	 * @param {*} o
	 * 	Specified observer
	 */
	registerObserver(o)
	{
		this.observers.push(o);
		o.init(this);
	}

	/**
	 * Remove specified observer to the admin
	 * @param {*} o
	 * 	Specified observer
	 */
	unregisterObserver(o)
	{
		this.observers = this.obversvers.filter((observer) => observer != o);
	}

	/**
	 * Remove player from game
	 * @param {Player} p
	 * 	Specified player
	 */
	removePlayer(pId)
	{
		this.players = this.players.filter((player) => player.id != pId);
		this.notifyObservers(pId, changeType.PLAYER_REMOVED);
	}

	/**
	 * Add a player to the game
	 * @param {Player} p
	 */
	addPlayer(p)
	{
		this.players.push(p);
		this.notifyObservers(p, changeType.PLAYER_ADDED);
		console.log(this.players);
	}

	/**
	 * Add a game
	 * @param {Game} g
	 * 	Specified Game
	 */
	addGame(g)
	{
		this.games.push(g);
		this.notifyObservers(g, changeType.GAME_ADDED);
	}

	/**
	 * Remove the specified game
	 * @param {Game} g
	 * 	Specified game
	 */
	removeGame(g)
	{
		this.games = this.games.filter((game) => game != g);
		this.notifyObservers(g, changeType.GAME_REMOVED);
	}
}
