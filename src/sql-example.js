"use strict";

require('co')(function * ()
{
	// ^ you don't need to worry about the co wrapper part, just pay attention to the rest of the code below
	
	// Sql module should be included in the require statements at the top of the module which needs db access
	var Sql = require('Sql');
	
	// create a "using" block (inspired by C# syntax). DON'T FORGET to yield on the block itself.
	yield Sql.using(function * (db)
	{
		var results = yield db.query('select * from migrations');
		console.log(results.rowCount);
		console.log(results.rows);
		console.log();
		
		// query with parameters
		results = yield db.query('select * from migrations where execution_date < $1 and filename = $2', [ new Date(), '0001 - Noop.sql' ]);
		console.log(results.rowCount);
		console.log(results.rows);
		console.log();
	});
	
	// transactions support
	yield Sql.usingTransaction(function * (trans)
	{
		var results = yield trans.query('insert into game_types (id, name) values ($1, $2);', [ 7, 'Fake Type' ]);
		console.log(results.rowCount);
		console.log();
		
		// important to remember the yield on everything which is asynchronous
		yield trans.rollback();
		
		// yield trans.commit(); // <-- if we wanted to commit instead
		
		// if you don't yield on commit or rollback, the transaction will be rolled back when this function completes.
	});
	
})();
