"use strict";

var Sql = require('../src/node_modules/Sql');
Sql.testingMode = true;

/*
	setup() and teardown() will be run for each test in each suite
 */
setup(function * ()
{
	
	yield runMigrationsOnce();
	yield truncateTables();
});

//teardown(function * ()
//{
//});


var hasRunMigrations = false;

function* runMigrationsOnce()
{
	if (hasRunMigrations) return;

	var Config = require('../src/node_modules/Config');
	yield Config.initialize();

	var Path = require('path');
	var PgMayflower = require('pg.mayflower');

	// run SQL migrations
	var migrator = new PgMayflower({
		directory: Path.resolve(__dirname, '../migrations'),
		connectionString: Config.sql.testingConnection
	});
	yield migrator.migrateAll();

	hasRunMigrations = true;
}

function* truncateTables()
{
	yield Sql.using(function* (db)
	{
		// clear all data from tables we insert into (not migrations or lookup tables)
		var tableNames = ['games_players', 'games', 'players'];
		
		for (var i = 0; i < tableNames.length; i++)
		{
			yield db.query('truncate table ' + tableNames[i] + ' cascade;');
		}
	});
	
}