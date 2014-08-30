"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('web.HomeController');

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
	yield this.render('home/index');
};
