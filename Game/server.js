const express = require('express');
const app = express();
const serv = require('http').Server(app);
const Game = require('./server/Game.js').Game;
const Utils = require('./server/Utilities/Utils.js').Utils;
const fs = require('fs');

// BEGIN SERVER SETUP

PORT_NUMBER = process.env.PORT || 2000;
var maps = JSON.parse(fs.readFileSync('./server/Navigation/map.json').toString());
uType = {
	PLAYER: 0,
	ADMIN: 1,
	SPECTATOR: 2
}

app.get('/', function(request, response)
{
	response.sendFile(__dirname + '/client/index.html');
});
app.get('/player', function(request, response)
{
	response.sendFile(__dirname + '/client/index.html');
});
app.get('/admin', function(request, response)
{
	response.sendFile(__dirname + '/client/admin.html');
});
app.get('/spectator', function(request, response)
{
	response.sendFile(__dirname + '/client/spectator.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(PORT_NUMBER);
console.log("Server online. \nRunning on port " + PORT_NUMBER);



// END SERVER SETUP

QUEUE = [];
SPEC_QUEUE = [];
ACTIVE_SOCKETS = [];
ACTIVE_GAMES = [];
ADMIN_SOCKETS = [];


/**
 * removeSocket - removes the player with the given id from the list of ACTIVE_SOCKETS
 * updates the Admins after removing the socket
 *
 * @param  {int} id the id of the socket to be removed
 * @return {void}
 */
function removeSocket(id)
{
	QUEUE = QUEUE.filter((s) => s.id != id);
	ACTIVE_SOCKETS = ACTIVE_SOCKETS.filter((s) => s.id != id);
	updateAdmins("remove socket", id);
}


/**
 * setUpPlayer - sets up the player with all of the socket listeners and inserts the Player
 *  into the Queue and the list of active sockets
 *
 * @param  {Socket} socket the new socket (player) to be added
 * @return {void}
 */
function setUpPlayer(socket)
{
	socket.id = Utils.generateId(ACTIVE_SOCKETS);

	QUEUE.push(socket);
	ACTIVE_SOCKETS.push(socket);

	updateAdmins("add socket", getSocketInfo(socket));
	if (QUEUE.length % 2 === 0) startGame();
	socket.on('right click', (data) => socket.player.rightclick(data.mouse));
	socket.on('left click', (data) => socket.player.leftclick(data.mouse));
	socket.on('selection box', (data) => socket.player.selectionBox(data.box));
	socket.on('key change', (data) => socket.player.keyChange(data.keys));
	socket.on('toggle mode', () => socket.player.toggleMode());
	socket.on('flamewall', (data) => socket.player.flamewall(data.mouse));
	socket.on('stomp start', () => socket.player.stomp());
	socket.on('heal', () => socket.player.heal());
	socket.on('stomp end', () => socket.player.stompEnd());
	socket.on('message', (msg) => socket.game.sendMessage(socket.player.username, msg));
	socket.on('disconnect', () =>
	{
		removeSocket(socket.id);
		if (socket.game)
		{
			socket.game.endGame();
			removeGame(socket.game);
		}
	});


}

function setUpSpectator(socket)
{
	ACTIVE_SOCKETS.push(socket);

	if (ACTIVE_GAMES.length > 0)
		ACTIVE_GAMES[Math.floor(Math.random() * ACTIVE_GAMES.length)].addSpectator(socket);
	else
		SPEC_QUEUE.push(socket);
}

/**
 * removeGame - removes the game with the given id from the list of games, updates
 *  all admins after the remove
 *
 * @param  {type} id id of the game to be removed
 * @return {void}
 */
function removeGame(game)
{
	ACTIVE_GAMES = ACTIVE_GAMES.filter((g) => g != game);
	updateAdmins("remove game", getGameInfo(game));
}


/**
 * startGame - starts a new game with the first 2 sockets in the queue, then updates
 *  the admins with the new game.
 *
 * @return {void}
 */
function startGame()
{
	var g = new Game([QUEUE.pop(), QUEUE.pop()], Utils.generateId(ACTIVE_GAMES), maps[0]);
	g.run();
	ACTIVE_GAMES.push(g);
	updateAdmins("add game", getGameInfo(g));
	SPEC_QUEUE.forEach((s) => g.addSpectator(s));
	SPEC_QUEUE = [];
}


/**
 * loadMaps - loads the maps from the 'map.json' file
 *
 * @return {GameMap[]} the game maps that were stored in map.json
 */
function loadMaps()
{
	return JSON.parse(fs.readFileSync('map.json').toString());
}


/**
 * updateAdmins - updates the connected admins with the dashboard info
 *
 * @return {void}
 */
function updateAdmins(message, obj)
{
	ADMIN_SOCKETS.forEach((s) =>
	{
		s.emit(message, obj);
	});
}

function sendInitialDashboard(admin)
{
	let dashInfo = getDashInfo();
	admin.emit('dashboard', dashInfo);
}

/**
 * endGame - ends the game with the given id, then notifies the connected admins
 *
 * @param  {type} id the id of the game that should be ended
 * @return {void}
 */
function endGame(id)
{
	for (let i = 0; i < this.ACTIVE_GAMES.length; i++)
	{
		if (ACTIVE_GAMES[i].id === i);
		{
			ACTIVE_GAMES[i].endGame();
			updateAdmins("remove game", getGameInfo(ACTIVE_GAMES[i]));
			return;
		}
	}
}

function getSocketInfo(s)
{
	return {
		id: s.id,
		user: s.user
	};
}

function getGameInfo(g)
{
	return {
		id: g.id,
		p1id: g.sockets[0].id,
		p1u: g.sockets[0].player.username,
		p2id: g.sockets[1].id,
		p2u: g.sockets[1].player.username,
		msgs: g.messages
	}
}

/**
 * getDashInfo - gets the necessary dashboard info to be displayed for the admins
 *
 * @return {Object[]} array of objects, each containing the id's of both players and
 *  the game id to be served to the player
 */
function getDashInfo()
{
	let games = [];
	let sockets = [];
	ACTIVE_SOCKETS.forEach((s) => sockets.push(getSocketInfo(s)));

	ACTIVE_GAMES.forEach((g) => games.push(getGameInfo(g)));

	return {
		activeGames: games,
		activeSockets: sockets
	};
}

var io = require('socket.io')(serv,
{});

io.sockets.on('connection', function(socket)
{
	// socket communications
	socket.on('start', (data) =>
	{
		if (data.uType === uType.PLAYER)
		{
			socket.user = data.username;
			setUpPlayer(socket);
		}
		else if (data.uType === uType.ADMIN)
		{
			ADMIN_SOCKETS.push(socket);

			sendInitialDashboard(socket);
			socket.on('end game', (data) => endGame(data.id));
		}
		else
		{
			setUpSpectator(socket);
		}
	});

});
