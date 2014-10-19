"use strict";

var assert = require('assert');
var Affiliation = require('../../src/node_modules/models/Affiliation');
// var TestUtils = require('TestUtils.js');

suite('Affiliation tests', function ()
{
	test('inserting an affiliation', function*()
	{
		var a = new Affiliation();
		a.name = 'Blue';
		yield a.save();
		assert(a.id >= 0, 'affiliation was not inserted');
		
		a = yield Affiliation.getById(a.id);
		assert(a.name === 'Blue', 'name should be Blue');
	});

  test('deleting an affiliation', function*()
  {
    var a = new Affiliation();
    a.name = 'Red';
    yield a.save();
    
    var didDelete = yield a.delete();
    assert(didDelete, 'should have deleted');

    var b = yield Affiliation.getById(a.id)
    assert(b == null, 'should not exist')
  });
	
	test('updating an affiliation', function*()
	{
		var a = new Affiliation();
    a.name = 'Green';
    yield a.save();
		
		a = yield Affiliation.getById(a.id);
		a.name = 'Purple';
		yield a.save();
		
		assert.equal(a.name, 'Purple');
	});
	
	test('getting an affiliation by id', function* () 
	{
		var a = new Affiliation();
		a.name = 'Orange';
		yield a.save();
		assert(a.id, 'should have saved');
		
		var a2 = yield Affiliation.getById(0);
		assert(a2 == null, 'there should be no affiliation with id == 0');

		a2 = yield Affiliation.getById(a.id);
		assert.deepEqual(a2, a, 'affiliations should be equal');
	});

// 	test('getting an affiliation by email', function* ()
// 	{
// 		// we normalized emails to lower case
// 		var a = new Affiliation();
// 		a.email = 'TEST@TEST.COM';
// 		yield a.save();
		
// 		var a2 = yield Affiliation.getByEmail('test@test.com'); 
// 		assert.deepEqual(a2, a, 'should have fetched a affiliation');
// 	});
	
// 	test('getting affiliations with their stats', function*()
// 	{
// 		var a1 = yield TestUtils.getAffiliation(),
// 			a2 = yield TestUtils.getAffiliation();
		
// 		// singles stats first
// 		yield TestUtils.getGame({ team1: [a1], team2: [a2] });
		
// 		// a1 should have played one game with one win
// 		yield a1.loadStats();
// 		assert(a1.stats != null, 'should have loaded some stats');
// 		assert(a1.stats.singlesGamesPlayed === 1, 'should have played a singles game');
// 		assert(a1.stats.singlesGamesWon === 1, 'should have won the first singles game');
// 	});

// 	test('creating/updating affiliation roles', function*()
// 	{
// 		// by default, affiliations have a "pending approval" role - let's override that here
// 		var a = yield TestUtils.getAffiliation({role_id: Affiliation.roles.active});
// 		var aDb = yield Affiliation.getById(a.id);
		
// 		// by fetching the affiliation again from the database, we assert that the insertion happened correctly
// 		assert.equal(a.role_id, aDb.role_id);
		
// 		// now ensure that affiliation.save correctly updates the database
// 		a.role_id = Affiliation.roles.admin;
// 		yield a.save();

// 		aDb = yield Affiliation.getById(a.id);
// 		assert.equal(a.role_id, aDb.role_id);
// 	});
	
});