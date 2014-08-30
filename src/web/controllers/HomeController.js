"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.IndexController');

/* =============================================================================
 * 
 * IndexController
 *  
 * ========================================================================== */

var IndexController = module.exports;

/* -------------------------------------------------------------------
 * Http Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

IndexController.indexGET = function * ()
{
	debug('Index page');
	yield this.render('home/index');
};
