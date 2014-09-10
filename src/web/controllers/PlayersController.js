"use strict";

var Player = require('models/Player');
var PlayerStats = require('models/PlayerStats');

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

PlayersController.profileGET = function*()
{
  var player = yield Player.getById(this.player.id);
  var stats = yield PlayerStats.getForPlayerId(this.player.id);

console.log({ player: player, stats: stats });
  yield this.render('players/profile', { player: player, stats: stats });
};