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
		
		// can also insert a player by just email
		p = { email: 'JARROD@gmail.com' };
		id = yield Player.insert(p);
		assert(id >= 0, 'player was not inserted');
		
		p = yield Player.getById(id);
		assert(p.email === 'jarrod@gmail.com', 'email should have been normalized');
		assert(p.name === 'jarrod@gmail.com', 'name should be email');
		
	});
	
	test('getting a player by id', function* () 
	{
		var p = yield Player.getById(0);
		assert(p == null, 'there should be no player with id == 0');
		
		var newP = { name: 'Billy Mays', rating: 100 };
		var id = yield Player.insert(newP);
		
		p = yield Player.getById(id);
		assert(p != null, 'should have gotten a player');
		assert(p.name === newP.name, 'names should match');
		assert(p.rating == newP.rating, 'ratings should match');
	});

	test('getting a player by email', function* ()
	{
		// we normalized emails to lower case
		yield Player.insert({ email: 'TEST@TEST.COM' });
		
		var p = yield Player.getByEmail('test@test.com'); 
		assert(p != null, 'should have gotten a player');
	});
});