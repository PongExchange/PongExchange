"use strict";

var assert = require('assert');
var Game = require('../../src/node_modules/models/Game');
var Player = require('../../src/node_modules/models/Player');
var TestUtils = require('TestUtils.js');

suite('Game tests', function ()
{
	test('saving a singles game', function* ()
	{
		var g = new Game();
		
		g.team1.push(yield TestUtils.getPlayer());
		g.team2.push(yield TestUtils.getPlayer());
		
		g.team1Score = 7;
		g.team2Score = 11;
		
		g.created_by_player_id = g.team1[0].id;
		
		yield g.save();
		assert(g.isSaved, 'should have been saved');
		
		// save can swap teams around
		assert(g.team1Score > g.team2Score, 'team 1 should always win, baby');
		
		var gg = yield Game.getById(g.id);
		assert.deepEqual(gg, g, 'game 1 should be equal to one loaded from the db');
	});

	test('saving a doubles game', function* ()
	{
		var g = new Game();

		g.team1.push(yield TestUtils.getPlayer());
		g.team1.push(yield TestUtils.getPlayer());
		
		g.team2.push(yield TestUtils.getPlayer());
		g.team2.push(yield TestUtils.getPlayer());

		g.team1Score = 11;
		g.team2Score = 8;

		g.created_by_player_id = g.team1[0].id;
		
		yield g.save();
		assert(g.isSaved, 'should have been saved');

		var gg = yield Game.getById(g.id);
		assert.deepEqual(gg, g, 'game 1 should be equal to one loaded from the db');
	});
	
	test('saving a game with a non-standard score', function*()
	{
		// usually scores are to 11, win by 2, but allow anything, as long as there is a winner
		
		// went to one deuce
		var g = yield TestUtils.getGame({ team1Score: 12, team2Score: 10 });
		assert(g instanceof Game, 'should have properly saved');
		
		// crazy skunk rules
		g = yield TestUtils.getGame({ team1Score: 0, team2Score: 7 });
		assert(g instanceof Game, 'should have properly saved');
	});
	
	test('validation', function*()
	{
		var p1 = yield TestUtils.getPlayer();

		var error = yield TestUtils.getGame({ team1: [p1], team2: [p1], expectsError: true });
		assert.equal(error, 'players cannot be on both teams');
		
		// try with doubles
		var p2 = yield TestUtils.getPlayer();
		var p3 = yield TestUtils.getPlayer();

		error = yield TestUtils.getGame({ team1: [p1, p2], team2: [p1], expectsError: true });
		assert.equal(error, 'teams should have the same number of players');

		error = yield TestUtils.getGame({ team1: [p1, p2], team2: [p3, p1], expectsError: true });
		assert.equal(error, 'players cannot be on both teams');
	});
	
	test('getting recent games', function*()
	{
		// add a few games
		yield TestUtils.getGame();
		yield TestUtils.getGame();
		
		var games = yield Game.getRecent();
		assert(games.length === 2, 'should have found 2 games');
		assert(games[0].id > games[1].id, games[0].id + ' should come before ' + games[1].id);

		// ensure we limit the games coming back
		yield TestUtils.getGame();
		
		games = yield Game.getRecent(2);
		assert(games.length === 2, 'should have found 2 games');
	});

	test('has same teams', function*()
	{
		// default getGame() creates new players
		var game1 = yield TestUtils.getGame();
		var game2 = yield TestUtils.getGame();
		assert(Game.hasSameTeams(game1, game2) === false);

		// reuse the same players for a singles match
		var gOptions = {
			team1: [yield TestUtils.getPlayer()],
			team2: [yield TestUtils.getPlayer()],
			
			team1Score: 11,
			team2Score: 5
		};
		game1 = yield TestUtils.getGame(gOptions);
		game2 = yield TestUtils.getGame(gOptions);
		assert(Game.hasSameTeams(game1, game2) === true);
		
	 	// swap who wins
		gOptions.team2Score = 13;
		game2 = yield TestUtils.getGame(gOptions);
		assert(Game.hasSameTeams(game1, game2) === true);
		
		// play some doubles games with the same players
		gOptions.team2Score = 5;
		gOptions.game_type_id = Game.types.doubles;
		gOptions.team1.push(yield TestUtils.getPlayer());
		gOptions.team2.push(yield TestUtils.getPlayer());
		game1 = yield TestUtils.getGame(gOptions);
		game2 = yield TestUtils.getGame(gOptions);
		assert(Game.hasSameTeams(game1, game2) === true);
		
		// and different players
		gOptions.team1 = null;
		gOptions.team2 = null;
		game1 = yield TestUtils.getGame(gOptions);
		game2 = yield TestUtils.getGame(gOptions);
		assert(Game.hasSameTeams(game1, game2) === false);
	});
	
	test('is same team', function*()
	{
		var game = yield TestUtils.getGame();
		assert(Game.isSameTeam(game.team1, game.team1) === true);
		assert(Game.isSameTeam(game.team1, game.team2) === false);

		game = yield TestUtils.getGame({ game_type_id: Game.types.doubles });
		assert(Game.isSameTeam(game.team1, game.team1) === true);
		assert(Game.isSameTeam(game.team1, game.team2) === false);
	});
});
