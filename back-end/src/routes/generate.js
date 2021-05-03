const express = require ("express");
const generate_router = express.Router();

//function to access database
const access_database = require ("./access_database");

//generate function
const generate = require ("../db/generate");

//generate a week of recurring jobs
generate_router.get ("/:week", (request, response, next) =>
{
	let handler = access_database (generate, request.params.week);
	handler (request, response, next);
});

module.exports = generate_router;
