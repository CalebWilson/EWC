const express = require('express');
const db = require('../db');

let router = express.Router();

/*
	Retrieve data from the database

	Takes in a method of the `db` object, and returns a function that calls that
	method and sends a json response created from its results.
*/
function retrieve_data (db_method)
{
	return (async (request, response, next) =>
	{
		try
		{
			let results = await db_method();
			response.json(results);
		}

		catch (e)
		{
			console.log(e);
			response.sendStatus(500);
		}
	});
}

router.get('/', (request, response) =>
{
	response.redirect ('/schedule');
});

router.get('/schedule', retrieve_data (db.schedule));

module.exports = router;
