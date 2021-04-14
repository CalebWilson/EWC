const express = require('express');
const db = require('../db');

let router = express.Router();

router.get('/', (request, response) =>
{
	response.redirect ('/schedule/0');
});

/*
	Retrieve data from the database

	Takes in a method of the `db` object, and returns a function that calls that
	method and sends a json response created from its results.
*/
function retrieve_data (db_method, params)
{
	//handler method to be returned
	return (async (request, response, next) =>
	{
		//invoke db_method and respond with results
		try
		{
			let results = await db_method(params);
			response.json(results);
		}

		//error handling
		catch (e)
		{
			console.log(e);
			response.sendStatus(500);
		}
	});
}

router.route('/schedule')
	.get  (retrieve_data (db.schedule_week));
//	.post (
router.get('/schedule/:week', (request, response, next) =>
{
	var handler = retrieve_data (db.schedule_week, request.params.week);
	handler (request, response, next);
});

module.exports = router;
