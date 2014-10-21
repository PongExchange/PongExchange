"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.GamesController');
var Player = require('models/Player');
var Game = require('models/Game');
var Match = require('models/Match');

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
	
	// sort by name asc
	all.sort(function(p1, p2) { return p1.name.localeCompare(p2.name); });
	
	var players = { players: all };

	yield this.render('games/new', players);
};

GamesController.newPOST = function * ()
{
	var response = this.request.body.fields;

	var m = yield Match.newMatch();

	for (var i=0; i< response.team1.score.length; i++){

			var g = new Game();

			g.team1 = parseStringIdsToPlayers(response.team1.players);
			g.team1Score = parseInt(response.team1.score[i]);

			g.team2 = parseStringIdsToPlayers(response.team2.players);
			g.team2Score = parseInt(response.team2.score[i]);

			g.created_by_player_id = this.player.id;
			
			try
			{
				yield g.save();
				yield m.addGame(g);
			}
			catch (e)
			{
				// TODO: need to return the error message
			}
	}

	this.redirect('/');
};

function parseStringIdsToPlayers (stringArray)
{
	return stringArray.map(function (cur) { return { id: parseInt(cur) } });
}

GamesController.recentGET = function * ()
{
	var games = yield Game.getRecent();
	yield this.render('games/recent', { games: games });
};