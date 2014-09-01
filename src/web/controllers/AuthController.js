"use strict";

var AuthController = module.exports;

AuthController.loginGET = function*()
{
	yield this.render('auth/login');
};