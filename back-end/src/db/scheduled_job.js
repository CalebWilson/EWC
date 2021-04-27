const db = require("./db");

let db_scheduled_job = {};

/*
	Get information about a scheduled job.
*/
db_scheduled_job.get = function (ScheduledJobID)
{
	return new Promise ((resolve, reject) =>
	{
		//get information about the ScheduledJob
		db.query
		(
			`select
				distinct
					ScheduledJobID,
					JobName,
					JobID,
					FinalPrice,
					Complete
				from WeekWork
				where ScheduledJobID = ?`,

			ScheduledJobID,

			(error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		})
	})

	//extract scheduled_job from array
	.then (scheduled_job_array => scheduled_job_array[0])

	//make an array of the days of the scheduled job
	.then ((scheduled_job) =>
	{
		//get the days
		return new Promise ((resolve, reject) =>
		{
			db.query
			(
				`select
					distinct
						Date,
						FirstDay
					from WeekWork
					where ScheduledJobID = ?`,

				ScheduledJobID,

				(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				}
			);
		})

		//make the days a property of the scheduled job
		.then ((days) =>
		{
			scheduled_job.Days = days;

			return scheduled_job;
		});
	});
};

/*
	Create a new scheduled job.

	params will be a JSON of the form:
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
db_scheduled_job.create = function (params)
{
	//create new scheduled job in the database
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`call CreateScheduledJob (?, ?);
			select last_insert_id()`,

			[params.JobID, params.ScheduleDate],

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	})
};

module.exports = db_scheduled_job;
