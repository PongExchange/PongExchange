"use strict";

var assert = require('assert');
var Game = require('../../src/node_modules/models/Game');
var Match = require('../../src/node_modules/models/Match');
var Player = require('../../src/node_modules/models/Player');
var TestUtils = require('TestUtils.js');

suite('Match tests', function()
{
	test('playing a singles match, best out of 3', function*()
	{
		var gOptions = {
			team1: [yield TestUtils.getPlayer()],
			team2: [yield TestUtils.getPlayer()]
		};
		
		var g = yield TestUtils.getGame(gOptions),
			m = yield Match.newMatch();
		
		assert(m.id > 0, 'match should have been inserted');
		
		var gameCount = yield m.getGameCount();
		assert.equal(gameCount, 0);
		
		yield m.addGame(g);
		assert.equal(g.match_id, m.id, 'game should now have a match id');
		
		gameCount = yield m.getGameCount();
		assert.equal(gameCount, 1);
		
		var gLoaded = yield Game.getById(g.id);
		assert.deepEqual(gLoaded, g, 'persisted game should match its original');
		
		var games = yield Game.getAllByMatchId(m.id);
		assert.equal(games.length, 1);
		assert.deepEqual(games[0], g);
		
		games = yield m.getAllGames();
		assert.deepEqual(games[0], g);
		
		var isComplete = yield m.isComplete();
		assert(isComplete === false, 'match must have a minimum of 2 matches to be complete');
		
		g = yield TestUtils.getGame(gOptions);
		yield m.addGame(g);

		gameCount = yield m.getGameCount();
		assert.equal(gameCount, 2);
		
		games = yield m.getAllGames();
		assert(games.length == 2, 'should have two games played now');
		
		isComplete = yield m.isComplete();
		assert(isComplete, 'match should be complete after one team wins two games');
	});
	
	test('addGame validation', function*()
	{
		var m = yield Match.newMatch();
		
		var game1 = yield TestUtils.getGame();
		var game2 = yield TestUtils.getGame({ game_type_id: Game.types.doubles });
		
		try
		{
			yield m.addGame(game1);
			yield m.addGame(game2);
			assert(false, 'should not be able to add different types of games to same match');
		}
		catch (e)
		{
			assert.equal(e.message, 'may only add the same type of game to an existing match');
		}
		
		game2 = yield TestUtils.getGame();
		
		try
		{
			yield m.addGame(game2);
			assert(false, 'should not be able to add games with different teams to the same match');
		}
		catch (e)
		{
			assert.equal(e.message, 'only the same teams may play in the same match');
		}
	});
	
});