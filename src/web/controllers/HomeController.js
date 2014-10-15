"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.HomeController');
var Player = require('models/Player');
var Game = require('models/Game');

/* =============================================================================
 * 
 * HomeController
 *  
 * ========================================================================== */

var HomeController = module.exports;

/* -------------------------------------------------------------------
 * Http Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

HomeController.indexGET = function * ()
{
	debug('Index page');

  var games = yield Game.getRecent(5);
  var players = yield Player.getAllWithStats();

  // sort by single games won
  var singlePlayers = players.sort(function(p1, p2){ return p2.stats.singlesGamesWon-p1.stats.singlesGamesWon });
  
  // sort by double games won
  var doublePlayers = players.sort(function(p1, p2){ return p2.stats.doublesGamesWon-p1.stats.doublesGamesWon });

	yield this.render('home/index', { games: games, singlePlayers: singlePlayers.slice(0,5), doublePlayers: doublePlayers.slice(0,5)  });

};