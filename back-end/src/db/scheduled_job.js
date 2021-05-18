const db = require("./db");

let db_scheduled_job = {};

/*
	Get information about a scheduled job.
*/
db_scheduled_job.get = function (scheduled_job_id)
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

			scheduled_job_id,

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
						FirstDay,
						ScheduledJobDayID
					from WeekWork
					where ScheduledJobID = ?`,

				scheduled_job_id,

				(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				}
			);
		})

		//get the workers for each day
		.then ((days) =>
		{
			//every element will be an array of JSONs like {Worker: "Worker Name"}
			teams = [];

			days.forEach ((day) =>
			{
				//push an array of Worker JSONs onto teams
				teams.push (new Promise ((resolve, reject) =>
				{
					db.query
					(
						`select WorkerID, WorkerName, WorkerStatus
							from WeekWork
							where
								ScheduledJobID    = ? and
								ScheduledJobDayID = ?`,

						[scheduled_job_id, day.ScheduledJobDayID],

						(error, results) =>
						{
							if (error) return reject (error);
							return resolve (results);
						}
					);
				}));
			});

			//match each worker team with its day
			return Promise.all (teams).then ((teams) =>
			{
				days.forEach ((day, index) =>
				{
					day.Workers = teams[index];
				});

				return days;
			});
		})

		//make the days a property of the scheduled job
		.then ((days) =>
		{
			scheduled_job.Days = days;

			return scheduled_job;
		})
	});
};

/*
	Create a new scheduled job.

	params will be a JSON of the form:
	{
		JobID: int,
		ScheduleDate: date
	}
*/

db_scheduled_job.post = function (params)
{
	console.log (params);
	//create new scheduled job in the database
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`call CreateScheduledJob (?, ?)`,

			[params.JobID, params.ScheduleDate],

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	})

	.then ((results) =>
	{
		return new Promise ((resolve, reject) =>
		{
			db.query
			(
				`select ScheduledJobID
					from ScheduledJobs
					where
						JobID = ? and
						ScheduleDate = ?`,

				[params.JobID, params.ScheduleDate],

				(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				}
			);
		})
	})

	.then ((results) =>
	{
		return db_scheduled_job.get (results[0].ScheduledJobID);
	});
};

/*
	Edit a scheduled job.

	params will be a JSON of the form:
	{
		JobID: int,
		ScheduleDate: date,
		Days:
		[{
			Day: int,
			WorkersIDs: int[]
		}]
	}
*/

module.exports = db_scheduled_job;
