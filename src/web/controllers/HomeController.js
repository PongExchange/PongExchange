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

HomeController.indexPOST = function * ()
{
	console.log(this.request.query);
	console.log(this.request.body.fields.test);
	this.body = this.request.body.fields.test;
};

HomeController.exampleGET = function * ()
{
	console.log(this.params);
	this.body = JSON.stringify(this.params);
};
