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
		var g = yield TestHelpers.getGame(),
			m = yield Match.newMatch();
		
		assert(m.id > 0, 'match should have been inserted');
		
		yield m.addGame(g);
		assert.equal(g.match_id, m.id, 'game should now have a match id');
		
		var gLoaded = yield Game.getById(g.id);
		assert.deepEqual(gLoaded, g, 'persisted game should match its original');
		
		var gamesByMatches = yield Game.getAllByMatchId(m.id);
		assert.equal(gamesByMatches.length, 1);
		assert.deepEqual(gamesByMatches[0], g);
	});
});