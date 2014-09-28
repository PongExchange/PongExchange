"use strict";

var assert = require('assert');
var Game = require('../../src/node_modules/models/Game');
var Match = require('../../src/node_modules/models/Match');
var Player = require('../../src/node_modules/models/Player');
var TestHelpers = require('TestHelpers');

suite('Match tests', function()
{
	test('playing a singles match', function*()
	{
		var gOptions = {
			team1: [yield TestHelpers.getPlayer()],
			team2: [yield TestHelpers.getPlayer()]
		};
		
		var g = yield TestHelpers.getGame(gOptions),
			m = yield Match.newMatch();
		
		assert(m.id > 0, 'match should have been inserted');
		
		yield m.addGame(g);
		assert.equal(g.match_id, m.id, 'game should now have a match id');
		
		var gLoaded = yield Game.getById(g.id);
		assert.deepEqual(gLoaded, g, 'persisted game should match its original');
		
		var games = yield Game.getAllByMatchId(m.id);
		assert.equal(games.length, 1);
		assert.deepEqual(games[0], g);
		
		games = yield m.getAllGames();
		assert.deepEqual(games[0], g);
		
		var isComplete = yield m.isComplete();
		assert(isComplete === false, 'match must have a minimum of 2 matches to be complete');
		
		g = yield TestHelpers.getGame(gOptions);
		yield m.addGame(g);
		
		games = yield m.getAllGames();
		assert(games.length == 2, 'should have two games played now');
		
		isComplete = yield m.isComplete();
		assert(isComplete, 'match should be complete after one team wins two games');
	});
});