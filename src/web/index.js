"use strict";

var co = require('co');

co(function * ()
{
	var Config = require('Config');
	yield Config.initialize();

	/* -------------------------------------------------------------------
	 * Require Statements << Keep in alphabetical order >>
	 * ---------------------------------------------------------------- */

	var Fs = require('fs');
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

	function * setupMiddleware (app)
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

		var compiledLessDirectory = Path.join(__dirname, Config.web.static.compiledLessPath);
		var less = thunkify(lessMiddleware(Path.join(__dirname, Config.web.static.lessPath), {
			dest: compiledLessDirectory,
			compiler: {
				compress: Config.tier !== 'local'
			}
		}));
		app.use(koaMount(Config.web.static.compiledLessPath, function * (next)
		{
			yield less(this.req, this.res);
			yield next;
		}));

		app.use(koaMount('/static', koaStatic(Path.join(__dirname, 'static'))));
		
		var jadeGlobals = yield getJadeGlobals();
		app.use(KoaJade.middleware({
			viewPath: Path.join(__dirname, 'views'),
			debug: isLocal,
			pretty: isLocal,
			compileDebug: isLocal,
			locals: jadeGlobals
		}));
		
		app.use(Middleware.jadeContextVariables);
		
		app.use(koaTrail(app));
	}

	function * setupRoutes (app)
	{
		// --- Routes not requiring auth ---
		app.post('*', koaBody());
		app.all('*', Controllers.Auth.loadSession);
		app.get('/', Controllers.Home.indexGET);
		app.post('/', Controllers.Home.indexPOST);
		
		app.get('/login', Controllers.Auth.loginGET);
		app.post('/auth/google/callback', Controllers.Auth.googleCallbackPOST);
		app.get('/logout', Controllers.Auth.logoutGET);
		app.post('/logout', Controllers.Auth.logoutPOST);
		
		// --- Routes requiring auth ---
		
		app.all('*', Controllers.Auth.requireSession);
		
		app.get('/example/:something', Controllers.Home.exampleGET);
		
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

		app.keys = Config.sessions.signingKeys;
		yield setupMiddleware(app, options);
		yield setupRoutes(app);

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
	
	function * getJadeGlobals ()
	{
		var globals = {};
		
		globals.title = 'Pong Exchange';
		
		// --- load static resources dynamically ---
		
		// css
		globals.css = yield getStaticResourceMap(Config.web.static.cssPath); // third party css
		
		// less
		globals.less = yield getStaticResourceMap(Config.web.static.compiledLessPath, Path.join(__dirname, Config.web.static.lessPath), '.css');
		
		// js
		globals.js = yield getStaticResourceMap(Config.web.static.jsPath);
		globals.js.jquery = globals.js.jquery_2_1_1;
		
		// images
		globals.images = yield getStaticResourceMap(Config.web.static.imagesPath);
		
		return globals;
	}
	
	function * getStaticResourceMap (path, dir, ext)
	{
		var res = {};
		if (!dir)
			dir = Path.join(__dirname, path);
		
		var files = yield Fs.readdir.bind(Fs, dir);
		files.sort();
		
		var minSuffix = /_min$/;
		var fsStat = thunkify(Fs.stat);
		var stats, f, fPath, fSafe;
		for (var i = 0; i < files.length; i++)
		{
			f = files[i];
			if (f[0] === '.')
				continue; // skip files/directories which begin with "."
				
			fPath = path + '/' + f;
			fSafe = safeName(f);
			stats = yield fsStat(Path.join(dir, f));
			if (stats.isDirectory())
			{
				res[fSafe] = yield getStaticResourceMap(fPath, Path.join(dir, f), ext);
			}
			else
			{
				if (minSuffix.test(fSafe))
				{
					fSafe = fSafe.replace(minSuffix, '');
					
					// don't use minified versions on local if a uncompressed version already exists
					if (Config.tier === 'local' && res[fSafe])
						continue;
					
				}
				
				if (ext !== undefined)
				{
					// re-write file extension
					fPath = fPath.replace(/\.[^.]+$/, ext);
				}
				
				res[fSafe] = fPath;
			}
		}
		
		return res;
	}

	function safeName (name)
	{
		// trim off the extension and convert non-word chars to underscores
		return name.replace(/\.[^.]+$/, function () { return ''; }).replace(/(\W+)(\w)?/g, function (match, nonWord, word)
		{
			return word ? '_' + word : '';
		});
	}

})();
