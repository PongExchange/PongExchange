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

  var team1IdsArray = response.team1.players;
  var team1Score = response.team1.score;

  var team2IdsArray = response.team2.players;
  var team2Score = response.team2.score;

  var game = yield Game.insert(team1IdsArray, team1Score, team2IdsArray, team2Score);

  this.redirect('/');
};
