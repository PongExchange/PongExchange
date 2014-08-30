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
	
	// run SQL migrations
	var migrator = new PgMayflower({
		directory: Path.resolve(__dirname, '../../migrations'),
		connectionString: Config.sql.connectionString
	});
	console.log('Migrating Database...');
	yield migrator.migrateAll();
	
	// run server initialization
	yield setupServer(Config.web, false);

	function setupMiddleware (app)
	{
		var isLocal = Config.tier === 'local';

//	app.use(koaFavicon(Path.join(__dirname, 'static/favicon.ico')));

		var cssDir = Path.resolve(__dirname, 'css');
		var less = thunkify(lessMiddleware(__dirname + '/less', {
			dest: cssDir,
			compiler: {
				compress: Config.tier !== 'local'
			}
		}));
		app.use(koaMount('/static/css', function * (next)
		{
			yield less(this.req, this.res);
			yield next;
		}));

		app.use(koaMount('/static/css', koaStatic(cssDir)));
		app.use(koaMount('/static', koaStatic(__dirname + '/static')));

		var locals = {
			title: 'Pong Exchange'
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
