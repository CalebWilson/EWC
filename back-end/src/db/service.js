const db = require("./db");

let db_service = {};

/*
	Get information about a scheduled job.
*/
db_service.get = function (service_id)
{
	return new Promise ((resolve, reject) =>
	{
		//get information about the Service
		db.query
		(
			`select
				distinct
					ServiceID,
					JobName,
					JobID,
					FinalPrice,
					Complete
				from WeekWork
				where ServiceID = ?`,

			service_id,

			(error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		})
	})

	//extract service from array
	.then (service_array => service_array[0])

	//make an array of the days of the scheduled job
	.then ((service) =>
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
						ServiceDayID
					from WeekWork
					where ServiceID = ?
					order by Date`,

				service_id,

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
								ServiceID    = ? and
								ServiceDayID = ?`,

						[service_id, day.ServiceDayID],

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
			service.Days = days;

			return service;
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

db_service.post = function (params)
{
	console.log (params);
	//create new scheduled job in the database
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`call CreateService (?, ?)`,

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
				`select ServiceID
					from Services
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
		return db_service.get (results[0].ServiceID);
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

module.exports = db_service;
