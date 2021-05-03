/*
	Main schedule page
*/

//create router
const express = require ("express");
const schedule_router = express.Router();

//function to access database
const access_database = require ("./access_database");

//schedule methods
const db_schedule = require ("../db/schedule");

//get all work
schedule_router.get ("/", (request, response) =>
{
	response.redirect ("/0");
});

//get the work in a specific week
schedule_router.get ("/:week", (request, response, next) =>
{
	let handler = access_database (db_schedule.get_week, request.params);
	handler (request, response, next);
});

//get the work in a specific week for a specific worker
schedule_router.get ("/:week/:worker", (request, response, next) =>
{
	let handler = access_database (db_schedule.get_week, request.params);
	handler (request, response, next);
});

module.exports = schedule_router;
