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
	.then ((service_array) =>
	{
		if (service_array.length === 0)
			throw "No results.";

		return service_array[0];
	})

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
		ServiceDate: date
	}
*/

db_service.post = function (params)
{
	//create new service in the database
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`call CreateService (?, ?)`,

			[params.JobID, params.ServiceDate],

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	})

	//get the ID of the new service
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
						ServiceDate = ?`,

				[params.JobID, params.ServiceDate],

				(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				}
			);
		})
	})

	//get the new service
	.then ((results) =>
	{
		return db_service.get (results[0].ServiceID);
	});
};

/*
	Edit a service.

	params will be a JSON of the form:
	{
		ServiceID: int,
		JobID: int,
		Days:
		[{
			Date: Date,
			Workers: int[],
			ServiceDayID: int //undefined if new ServiceDay
		}]
	}
*/

db_service.patch = function (params)
{
	console.log ("params: ", JSON.stringify (params));

	//function to remove timestamp from dates
	const date = (datetime) => (JSON.stringify(datetime).substr(1, 10));

	params.Date = params.Days[0].Date;

	Days = params.Days.map ((day) =>
	{
		day.Day = Math.round((new Date(day.Date) - new Date(params.Date))
			/ (1000 * 60 * 60 * 24));

		console.log ("\nday: ", day);

		return day;
	});

	//update JobID and ServiceDate
	let attributes = new Promise ((resolve, reject) =>
	{
		db.query
		(
			`update Services
				set
					JobID = ?,
					ServiceDate = ?
				where ServiceID = ?`,

			[params.JobID, date(params.Days[0].Date), params.ServiceID],

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	});

	//update Days
	let service_days = new Promise ((resolve, reject) =>
	{
		db.query
		(
			`select
					ServiceDayID, ServiceDay
				from ServiceDays
				where ServiceID = ?`,

			params.ServiceID,

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	})

	.then ((db_days) =>
	{
		console.log (db_days);

		//days that are not new or deleted will have a ServiceDayID
		const edited_days = params.Days.filter (
			(day) => (day.ServiceDayID !== undefined)
		);
		console.log ("edited_days: ", edited_days);

		//the numbers of days that are not new or deleted
		const edited_day_nums = edited_days.map ((edited_day) => (edited_day.Day));
		console.log ("edited_day_nums: ", edited_day_nums);

		//days in the database that aren't in params should be deleted
		const to_delete = db_days.filter (
			(db_day) => (!edited_day_nums.includes (db_day.ServiceDay))
		);
		console.log ("to_delete: ", to_delete);

		//delete days
		return Promise.all
		(
			to_delete.map ((delete_day) =>
			(
				new Promise ((resolve, reject) =>
				{
					db.query
					(
						`delete
							from ServiceDays
							where ServiceDayID = ?`,

						delete_day.ServiceDayID,

						(error, results) =>
						{
							if (error) return reject (error);
							return resolve (results);
						}
					);
				})
			))
		);
	});

	//get the modified service
	return Promise.all ([attributes, service_days]).then (() =>
	{
		return db_service.get (params.ServiceID);
	});
};

module.exports = db_service;
