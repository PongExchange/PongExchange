"use strict";

var co = require('co');

co(function * ()
{
	var Config = require('Config');
	yield Config.initialize();

	/* -------------------------------------------------------------------
	 * Require Statements << Keep in alphabetical order >>
	 * ---------------------------------------------------------------- */

	var Http = require('http');
	var Https = require('https');
	var koa = require('koa');
	var koaBody = require('koa-better-body');
	var koaFavicon = require('koa-favicon');
	var KoaJade = require('koa-jade');
	var koaMount = require('koa-mount');
	var koaStatic = require('koa-static');
	var koaTrail = require('koa-trail');
	var lessMiddleware = require('less-middleware');
	var Path = require('path');
	var PgMayflower = require('pg.mayflower');
	var thunkify = require('thunkify');

	// setup controllers
	var Controllers = {};
	Controllers.Home = require('./controllers/HomeController');
	Controllers.Games = require('./controllers/GamesController');
	Controllers.Leaderboard = require('./controllers/LeaderboardController');
	Controllers.RecentGames = require('./controllers/RecentGamesController');

	/* -------------------------------------------------------------------
	 * Initialization
	 * ---------------------------------------------------------------- */

	// run SQL migrations
	var migrator = new PgMayflower({
		directory: Path.resolve(__dirname, '../../migrations'),
		connectionString: Config.sql.connectionString
	});
	console.log('Migrating Database...');
	yield migrator.migrateAll();

	// run server initialization
	yield setupServer(Config.web, false);

	/* -------------------------------------------------------------------
	 * Helper Methods
	 * ---------------------------------------------------------------- */

	function setupMiddleware (app)
	{
		var isLocal = Config.tier === 'local';

		app.use(koaFavicon(Path.join(__dirname, 'static/favicon.ico')));

		var cssPath = '/static/css'; // for third party css
		var lessPath = '/static/less';
		var compiledLessPath = '/static/css-less';
		var jsPath = '/static/js';
		var imagesPath = '/static/images';

		var compiledLessDirectory = Path.join(__dirname, compiledLessPath);
		var less = thunkify(lessMiddleware(Path.join(__dirname, lessPath), {
			dest: compiledLessDirectory,
			compiler: {
				compress: Config.tier !== 'local'
			}
		}));
		app.use(koaMount(compiledLessPath, function * (next)
		{
			yield less(this.req, this.res);
			yield next;
		}));

		app.use(koaMount(compiledLessPath, koaStatic(compiledLessDirectory)));
		app.use(koaMount('/static', koaStatic(Path.join(__dirname, 'static'))));

		var locals = {
			title: 'Pong Exchange',
			css: {
				main: compiledLessPath + '/main.css',
				chosen: cssPath + '/' + (isLocal ? 'chosen.css' : 'chosen.min.css')
			},
			js: {
				jQuery: jsPath + '/' + (isLocal ? 'jquery-2.1.1.js' : 'jquery-2.1.1.min.js'),
				chosen: jsPath + '/' + (isLocal ? 'chosen.jquery.js' : 'chosen.jquery.min.js'),
				bootstrap: jsPath + '/' + (isLocal ? 'bootstrap.js' : 'bootstrap.min.js'),
				games: jsPath + '/' + '/games.js'
			},
			images: {
				navLogo: imagesPath + '/NavLogo.png'
			}
		};

		app.use(KoaJade.middleware({
			viewPath: Path.join(__dirname, 'views'),
			debug: isLocal,
			pretty: isLocal,
			compileDebug: isLocal,
			locals: locals
		}));

//		app.use(Controllers.Auth.authMiddleware);
		app.use(koaTrail(app));
	}

	function setupRoutes (app)
	{
		app.post('*', koaBody());
		app.get('/', Controllers.Home.indexGET);
		app.post('/', Controllers.Home.indexPOST);
		app.get('/example/:something', Controllers.Home.exampleGET);

		app.get('/games/new', Controllers.Games.newGET);
		app.post('/games/create', Controllers.Games.createPOST);

		app.get('/recentgames', Controllers.RecentGames.indexGET);

		app.get('/leaderboard', Controllers.Leaderboard.indexGET);
		app.get('/leaderboard/overall', Controllers.Leaderboard.overallGET);
	}

	function * setupServer (options, ssl)
	{
		var app = koa();

		setupMiddleware(app);
		setupRoutes(app);

		var handler = app.callback();
		var server;

		if (ssl)
			server = Https.createServer(options.ssl, handler);
		else
			server = Http.createServer(handler);

		server.app = app;

		server.listen_ = thunkify(server.listen);
		yield server.listen_(options.port, options.host);
		console.log((ssl ? 'Https' : 'Http') + ' server listening on ' + options.host + ':' + options.port);
		return server;
	}

})();
