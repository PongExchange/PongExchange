"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.GamesController');
var Player = require('models/Player');

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
  console.log(all);
  var players = { players: all };
  console.log(players);

  yield this.render('games/new', players);
};

GamesController.createPOST = function * ()
{
  console.log(this.request.body);

  var name = this.request.body.fields.name;
  this.redirect('/');
};
