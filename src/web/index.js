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
	var koaPassport = require('koa-passport');
	var koaSession = require('koa-session');
	var koaStatic = require('koa-static');
	var koaTrail = require('koa-trail');
	var lessMiddleware = require('less-middleware');
	var Middleware = require('Middleware');
	var Path = require('path');
	var PgMayflower = require('pg.mayflower');
	var thunkify = require('thunkify');

	// setup controllers
	var Controllers = {};
	Controllers.Auth = require('./controllers/AuthController');
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
	yield setupServer(Config.web);

	/* -------------------------------------------------------------------
	 * Helper Methods
	 * ---------------------------------------------------------------- */

	function setupMiddleware (app)
	{
		var isLocal = Config.tier === 'local';
		
		if (isLocal)
		{
			// logger
			app.use(function *(next)
			{
				var start = new Date;
				yield next;
				if (this.url.indexOf('/static/') < 0) // TODO: we need to cache static resources
				{
					var ms = new Date - start;
					console.log('%s %s - %s', this.method, this.url, ms);
				}
			});
		}

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
		
		app.use(Middleware.jadeContextVariables);

		// setup sessions and auth
		require('Auth');
		app.keys = ["it's a secret to everybody"];
		app.use(koaSession());
		app.use(koaPassport.initialize());
		app.use(koaPassport.session());
		
		app.use(koaTrail(app));
	}

	function setupRoutes (app)
	{
		app.post('*', koaBody());
		app.get('/', Controllers.Home.indexGET);
		app.post('/', Controllers.Home.indexPOST);
		
		app.get('/auth/login', Controllers.Auth.loginGET);
		app.get('/auth/google', koaPassport.authenticate('google'));
		app.get('/auth/google/callback', 
			koaPassport.authenticate('google', { // TODO: this needs to have a returnUrl on the query
				successRedirect: '/', 			
				failureRedirect: '/auth/login'
			})
		);
		app.get('/example/:something', Controllers.Home.exampleGET);

		// gotta be logged in to add new games
		app.all('/games/*', authenticate);
		
		// TODO: make create point to new and alter the above to be .all('/games/new')
		app.get('/games/new', Controllers.Games.newGET);
		app.post('/games/create', Controllers.Games.createPOST);

		app.get('/games/recent', Controllers.RecentGames.indexGET);

		app.get('/leaderboard', Controllers.Leaderboard.indexGET);
		app.get('/leaderboard/overall', Controllers.Leaderboard.overallGET);
	}
	
	function * setupServer (options)
	{
		var app = koa();

		setupMiddleware(app, options);
		setupRoutes(app);

		var handler = app.callback();
		var server;

		if (options.ssl)
			server = Https.createServer(options.ssl, handler);
		else
			server = Http.createServer(handler);

		server.app = app;
		
		server.listen_ = thunkify(server.listen);
		yield server.listen_(options.port);
		console.log('server listening on ' + options.getAbsoluteUri());
		return server;
	}

	function* authenticate (next)
	{
		if (this.isAuthenticated())
		{
			yield next;
		}
		else
		{
			this.redirect('/auth/login');
		}
	}

})();
