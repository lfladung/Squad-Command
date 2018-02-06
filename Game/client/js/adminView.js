class View
{
	constructor()
	{}

	init(model)
	{
		this.model = model;
		this.displayGames(model.games);
		this.displayActiveSockets(model.players);
	}

	update(arg, change)
	{
		if (change === changeType.GAME_ADDED)
			this.addGame(arg);
		else if (change === changeType.GAME_REMOVED)
			this.removeGame(arg);
		else if (change === changeType.PLAYER_ADDED)
			this.addPlayer(arg);
		else if (change === changeType.PLAYER_REMOVED)
			this.removePlayer(arg);
	}

	removePlayer(pId)
	{
		$("#player" + pId).remove();
	}

	addPlayer(p)
	{
		let r = this.getSocketRow(p);
		$("#socketsTable").append(r);
	}

	removeGame(game)
	{
		$("#game" + game.id).remove();
	}

	addGame(game)
	{
		let r = this.getGameRow(game);
		$("#gamesTable").append(r);
	}

	displayGame(game)
	{
		$("#selected").empty();
		let disp = $("<p>" + game.id + "</p>");
		let messages = $("<div id='msgs'></div>")
		game.msgs.forEach((m) =>
		{
			messages.append("<p>" + m.username + ":" + m.msg + "</p>")
		});
		disp.append(messages);
		$("#selected").append(disp);
	}

	displayActiveSockets(activeSockets)
	{
		let div = $("#sockets");
		div.empty();
		let t = $("<table id = 'socketsTable'></table>");
		t.append("<tr> <th> username </th> <th> id </th> </tr>");
		for (let i = 0; i < activeSockets.length; i++)
		{
			let s = activeSockets[i];
			let row = this.getSocketRow(s);
			t.append(row);
		}

		div.append(t);
	}

	/**
	 * Display the current games
	 * @param {*} msgGames
	 */
	displayGames(games)
	{
		let div = $("#games");
		div.empty();
		let t = $("<table id = 'gamesTable'></table>");
		t.append("<tr> <th>Game Id</th> <th>Player 1</th> <th>Player 2</th> <th></th> </tr>");
		for (let i = 0; i < games.length; i++)
		{
			let g = games[i];
			let row = this.getGameRow(g);
			t.append(row);
		}

		div.append(t);
	}

	getSocketRow(s)
	{
		let row = $("<tr></tr>");
		row.attr('id', "player" + s.id);
		row.append("<td>" + s.user + "</td>");
		row.append("<td>" + s.id + "</td>");
		return row;
	}

	getGameRow(g)
	{
		let self = this;
		let row = $("<tr></tr>");
		row.attr('id', "game" + g.id);
		row.append("<td>" + g.id + "</td>");
		row.append("<td>" + g.p1id + "</td>");
		row.append("<td>" + g.p2id + "</td>");
		let c = $("<td></td>");
		c.append($("<button/>",
		{
			type: 'button',
			id: g.id,
			text: 'end',
			click: function()
			{
				socket.emit("end game",
				{
					id: g.id
				});
			}
		}));
		c.append($("<button/>",
		{
			type: 'button',
			id: g.id,
			text: 'view',
			click: function()
			{
				self.displayGame(g);
			}
		}))
		row.append(c);
		return row;
	}
}
