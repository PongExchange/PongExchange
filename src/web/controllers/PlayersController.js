"use strict";

var Player = require('models/Player');

var PlayersController = module.exports;

/*
	/players - returns all players, along with basic stats
 */
PlayersController.indexGET = function*()
{
	var players = yield Player.getAllWithStats();

	// sort by name asc
	players.sort(function (p1, p2) { return p1.name.localeCompare(p2.name); });
	
	yield this.render('players/index', { players: players });
};