"use strict";

var assert = require('assert');

suite('Example Suite', function ()
{
	test('example test', function * ()
	{
		yield setImmediate; // mock async task
		assert(true, 'this should have been true');
	});
});
