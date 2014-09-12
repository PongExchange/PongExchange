"use strict";

var Player = require('models/Player');
var PlayerStats = require('models/PlayerStats');
var Game = require('models/Game');

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
  var games = yield Game.getAllGamesForPlayer(this.player.id);

  yield this.render('players/profile', { player: player, stats: stats, games: games });
};

PlayersController.editGET = function*()
{
  var player = yield Player.getById(this.player.id);
  var stats = yield PlayerStats.getForPlayerId(this.player.id);

  yield this.render('players/edit', { player: player, stats: stats });
};

PlayersController.updatePOST = function*()
{
  var response = this.request.body.fields;

  var player = yield Player.getById(this.player.id);
  player.name = response.player.name || player.name;
  player.email = response.player.email || player.email;
  player.bio = response.player.bio || player.bio;
  player.imageUrl = response.player.imageUrl || player.imageUrl;

  if (yield player.save()){
    this.redirect(player.profileUrl);
  } else {
    console.log('This cannot be saved.');
  }
  
};