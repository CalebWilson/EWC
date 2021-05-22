/*
	Scheduled Job
*/

//create router
const express = require("express");
const service_router = express.Router();

//function to access database
const access_database = require ("./access_database");

//service methods
const db_service = require("../db/service");

service_router.route ("/:service_id")

	//get
	.get ((request, response, next) =>
	{
		console.log ("request.params.service_id: " + request.params.service_id);
		let handler =
			access_database (db_service.get, request.params.service_id);

		handler (request, response, next);
	})
;

	/*
		request.body will be a JSON of the form:
		{
			JobID: int,
			ScheduleDate: date,
			DayAssignments:
			[{
					Day: int,
					WorkersIDs: int[]
			}]
		}
	*/
service_router.post ("/", (request, response, next) =>
{
	let handler = access_database (db_service.post, request.body);

	handler (request, response, next);
});

module.exports = service_router;
