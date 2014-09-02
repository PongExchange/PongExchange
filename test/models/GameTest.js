"use strict";

var assert = require('assert');
var Player = require('../../src/node_modules/models/Player');
var Game = require('../../src/node_modules/models/Game');

var TestHelpers = require('TestHelpers');

suite('Game tests', function ()
{
	test('inserting a singles game', function* ()
	{
		var p1 = yield TestHelpers.getPlayer();
		var p2 = yield TestHelpers.getPlayer();
		
		var gameId = yield Game.insert([p1.id], 11, [p2.id], 3);
		
		var g = yield Game.getById(gameId);
		
		assert(g.team1Score > g.team2Score, 'team 1 should always win, baby');
	});

	test('inserting a doubles game', function* ()
	{
		var p1 = yield TestHelpers.getPlayer();
		var p2 = yield TestHelpers.getPlayer();

		var p3 = yield TestHelpers.getPlayer();
		var p4 = yield TestHelpers.getPlayer();

		var gameId = yield Game.insert([p1.id, p3.id], 6, [p2.id, p4.id], 11);

		var g = yield Game.getById(gameId);

		assert(g.team1Score > g.team2Score, 'team 1 should always win, baby');
		assert(g.team1.length === 2, 'should be doubles');
	});
	
});
