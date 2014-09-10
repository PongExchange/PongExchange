"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.HomeController');
var Player = require('models/Player');

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

  var url = yield Player.getUrl(this.player.id);

  console.log({playerUrl: url});

	yield this.render('home/index', {playerUrl: url});

};