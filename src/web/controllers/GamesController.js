"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.GamesController');
var Player = require('models/Player');
var Game = require('models/Game');

/* =============================================================================
 * 
 * GamesController
 *  
 * ========================================================================== */

var GamesController = module.exports;

/* -------------------------------------------------------------------
 * Http Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

GamesController.newGET= function * ()
{
	debug('Games new page');
	var all = yield Player.getAll();
	var players = { players: all };

	yield this.render('games/new', players);
};

GamesController.createPOST = function * ()
{
	var response = this.request.body.fields;
	var g = new Game();

	g.team1 = parseStringIdsToPlayers(response.team1.players);
	g.team1Score = parseInt(response.team1.score);

	g.team2 = parseStringIdsToPlayers(response.team2.players);
	g.team2Score = parseInt(response.team2.score);

	yield g.save();

	this.redirect('/');
};

function parseStringIdsToPlayers (stringArray)
{
	return stringArray.map(function (cur) { return { id: parseInt(cur) } });
}