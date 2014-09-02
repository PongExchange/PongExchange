"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var Config = require('Config');
var GoogleApis = require('googleapis');
var Player = require('models/Player');
var Session = require('models/Session');

var OAuth2 = GoogleApis.auth.OAuth2;
var Plus = GoogleApis.plus('v1');

/* =============================================================================
 * 
 * AuthController - Handles routes relating to login/logout.
 *  
 * ========================================================================== */

var AuthController = module.exports;

/* -------------------------------------------------------------------
 * Http Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

AuthController.googleCallbackPOST = function * ()
{
	if (!this.request.body || !this.request.body.fields || !this.request.body.fields.code)
		return;
	
	// exchange tokens
	var code = this.request.body.fields.code;
	var oauth = new OAuth2(Config.google.clientId, Config.google.clientSecret, 'postmessage');
	oauth.credentials = yield oauth.getToken.bind(oauth, code);
	
	// get user profile
	var result = yield Plus.people.get.bind(Plus.people, { userId: 'me', auth: oauth });
	var profile = result[0];
	
	// create player
	var player = yield Player.fromGoogle(profile);
	
	// create session
	var session = yield Session.fromPlayer(player);
	
	// create cookie
	this.cookies.set(Config.sessions.name, session.token, { expires: new Date(Date.now() + Config.sessions.length), signed: true });
	
	// redirect
	this.body = { url: '/' }; // todo: be more intelligent
};

AuthController.loadSession = function * (next)
{
	this.player = null;
	this.session = null;
	var token = this.cookies.get(Config.sessions.name, { signed: true });
	if (token)
	{
		/** @type {Session} */
		var session = yield Session.getByToken(token);
		if (session)
		{
			// todo: combine get session and player into one query
			this.player = yield Player.getById(session.playerId);
			this.session = session;
		}
	}

	yield next;
};

AuthController.loginGET = function*()
{
	if (this.session)
	{
		this.redirect('/');
		return;
	}
	yield this.render('auth/login', { clientId: Config.google.clientId, scopes: Config.google.scopes.join(' ') });
};

AuthController.logoutGET = function*()
{
	if (!this.session)
	{
		this.redirect('/');
		return;
	}
	yield this.render('auth/logout');
};

AuthController.logoutPOST = function*()
{
	if (this.session)
	{
		yield this.session.delete();
		this.cookies.set(Config.sessions.name, '', { expires: new Date(Date.now() - Config.sessions.length), signed: true });
	}
	
	this.redirect('/');
};

AuthController.requireSession = function * (next)
{
	if (!this.session)
		this.redirect('/login');
	else
		yield next;
};
