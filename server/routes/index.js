const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (request, response, next) =>
{
	try
	{
		let results = await db.all();
		response.json(results);
	}

	catch (e)
	{
		console.log(e);
		response.sendStatus(500);
	}
});

module.exports = router;
