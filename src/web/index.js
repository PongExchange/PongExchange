"use strict";

var co = require('co');

co(function * ()
{
	var Config = require('Config');
	yield Config.initialize();
	
	/* -------------------------------------------------------------------
	 * Require Statements << Keep in alphabetical order >>
	 * ---------------------------------------------------------------- */
	
	var koa = require('koa');
	var koaBody = require('koa-better-body');
	var KoaJade = require('koa-jade');
	var koaMount = require('koa-mount');
	var koaStatic = require('koa-static');
	var koaTrail = require('koa-trail');
	var lessMiddleware = require('less-middleware');
	
	// setup controllers
	var Controllers = {};
	Controllers.Home = require('./controllers/HomeController');
	
	yield setupServer();

	function setupMiddleware (app)
	{
		var isLocal = Config.tier === 'local';

//	app.use(koaFavicon(Path.join(__dirname, 'static/favicon.ico')));

		var cssDir = Path.resolve(__dirname, '../..', Config.settings.site.writablePath, 'css');
		var less = thunkify(lessMiddleware(__dirname + '/less', {
			dest: cssDir,
			compiler: {
				compress: Config.tier === 'local'
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
			title: Config.settings.site.name,
			css: {
				common: Kirja.url('/static/css/common.css'),
				highlight: Kirja.url(Config.settings.theme.codeCss)
			}
		};

		if (!Config.settings.markdown.highlightJs)
			locals.css.highlight = false;

		app.use(KoaJade.middleware({
			viewPath: Path.join(__dirname, 'views'),
			debug: isLocal,
			pretty: isLocal,
			compileDebug: isLocal,
			locals: locals
		}));

		app.use(Controllers.Auth.authMiddleware);
		app.use(koaTrail(app));
	}

	function setupRoutes (app)
	{
		// --- Routes not requiring login ---

		if (Config.tier === 'local')
			app.get('/sandbox', Controllers.Home.sandboxGet);

		app.post('*', koaBody());
		app.get('/', Controllers.Home.indexGet);

		// --- Contributor Routes ---

		app.get('*', Controllers.Auth.filterLowerThan(Enums.UserTypes.CONTRIBUTOR, true));
		app.get('/scribe', Controllers.Scribe.indexGet);
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
