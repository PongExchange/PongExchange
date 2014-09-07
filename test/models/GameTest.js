"use strict";

var assert = require('assert');
var Player = require('../../src/node_modules/models/Player');
var Game = require('../../src/node_modules/models/Game');
var TestHelpers = require('TestHelpers');

suite('Game tests', function ()
{
	test('inserting a singles game', function* ()
	{
		var g = new Game();
		
		g.team1.push(yield TestHelpers.getPlayer());
		g.team2.push(yield TestHelpers.getPlayer());
		
		g.team1Score = 7;
		g.team2Score = 11;
		
		yield g.save();
		assert(g.isSaved(), 'should have been saved');
		
		// save can swap teams around
		assert(g.team1Score > g.team2Score, 'team 1 should always win, baby');
		
		var gg = yield Game.getById(g.id);
		assert.deepEqual(gg, g, 'game 1 should be equal to one loaded from the db');
	});

	test('inserting a doubles game', function* ()
	{
		var g = new Game();

		g.team1.push(yield TestHelpers.getPlayer());
		g.team1.push(yield TestHelpers.getPlayer());
		
		g.team2.push(yield TestHelpers.getPlayer());
		g.team2.push(yield TestHelpers.getPlayer());

		g.team1Score = 11;
		g.team2Score = 8;

		yield g.save();
		assert(g.isSaved(), 'should have been saved');

		var gg = yield Game.getById(g.id);
		assert.deepEqual(g, gg, 'game 1 should be equal to one loaded from the db');
	});
	
	test('getting recent games', function*()
	{
		// add a few games
		yield TestHelpers.getGame();
		yield TestHelpers.getGame();
		
		var games = yield Game.getRecent();
		assert(games.length === 2, 'should have found 2 games');
		assert(games[0].id > games[1].id, games[0].id + ' should come before ' + games[1].id);

		// ensure we limit the games coming back
		yield TestHelpers.getGame();
		
		games = yield Game.getRecent(2);
		assert(games.length === 2, 'should have found 2 games');
		
	});
});
