"use strict";

var assert = require('assert');
var Player = require('../../src/node_modules/models/Player');
var Game = require('../../src/node_modules/models/Game');
var TestHelpers = require('TestHelpers');

suite('Game tests', function ()
{
	test('saving a singles game', function* ()
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

	test('saving a doubles game', function* ()
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
		assert.deepEqual(gg, g, 'game 1 should be equal to one loaded from the db');
	});
	
	test('saving a game with a non-standard score', function*()
	{
		// usually scores are to 11, win by 2, but allow anything, as long as there is a winner
		
		// went to one deuce
		var g = yield TestHelpers.getGame({ team1Score: 12, team2Score: 10 });
		assert(g instanceof Game, 'should have properly saved');
		
		// crazy skunk rules
		g = yield TestHelpers.getGame({ team1Score: 0, team2Score: 7 });
		assert(g instanceof Game, 'should have properly saved');
	});
	
	test('validation', function*()
	{
		var p1 = yield TestHelpers.getPlayer();

		var error = yield TestHelpers.getGame({ team1: [p1], team2: [p1], expectsError: true });
		assert.equal(error, 'players cannot be on both teams');
		
		// try with doubles
		var p2 = yield TestHelpers.getPlayer();
		var p3 = yield TestHelpers.getPlayer();

		error = yield TestHelpers.getGame({ team1: [p1, p2], team2: [p1], expectsError: true });
		assert.equal(error, 'teams should have the same number of players');

		error = yield TestHelpers.getGame({ team1: [p1, p2], team2: [p3, p1], expectsError: true });
		assert.equal(error, 'players cannot be on both teams');
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
