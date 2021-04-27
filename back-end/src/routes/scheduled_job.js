/*
	Scheduled Job
*/

//create router
const express = require("express");
const scheduled_job_router = express.Router();

//function to access database
const access_database = require ("./access_database");

//scheduled_job methods
const db_scheduled_job = require("../db/scheduled_job");

scheduled_job_router.route ("/:scheduled_job_id")

	//get
	.get ((request, response, next) =>
	{
		let handler =
			access_database (db_scheduled_job.get, request.params.scheduled_job_id);

		handler (request, response, next);
	})

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
;

module.exports = scheduled_job_router;
