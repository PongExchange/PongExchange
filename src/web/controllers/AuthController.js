"use strict";

var AuthController = module.exports;

AuthController.loginGET = function*()
{
	if (this.isAuthenticated())
	{
		this.redirect('/');
	}
	yield this.render('auth/login');
};

AuthController.logoutGET = function*()
{
	if (!this.isAuthenticated())
	{
		this.redirect('/');
	}
	yield this.render('auth/logout');
};

AuthController.logoutPOST = function*()
{
	this.logout();
	this.redirect('/');
};