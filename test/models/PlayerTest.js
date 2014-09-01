"use strict";

var assert = require('assert');
var Player = require('../../src/node_modules/models/Player');

suite('Player tests', function ()
{
	test('inserting a player', function* ()
	{
		var p = { name: 'Jarrod' };
		var id = yield Player.insert(p);
		assert(id >= 0, 'player was not inserted');
	});
	
	test('getting a player', function* () 
	{
		var p = yield Player.get(0);
		assert(p == null, 'there should be no player with id == 0');
		
		var newP = { name: 'Billy Mays', rating: 100 };
		var id = yield Player.insert(newP);
		console.log(id);
		
		// issue here is the db has been rolled back after Player.insert completes
		p = yield Player.get(id);
		assert(p != null, 'should have gotten a player');
		assert(p.name === newP.name, 'names should match');
		assert(p.rating == newP.rating, 'ratings should match');
	});
});