"use strict";

var co = require('co');
var Path = require('path');
var PgMayflower = require('pg.mayflower');

var Config = require('../src/node_modules/Config');
var Sql = require('../src/node_modules/Sql');

/*
	setup() and teardown() will be run for each test in each suite
 */
setup(function ()
{
	console.log('hello there');
});

teardown(function ()
{
});