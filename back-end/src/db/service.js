const db_query = require("./db_query");

let db_service = {};

/*
	Get information about a service.
*/
db_service.get = function (service_id)
{
	//get information about the Service
	return db_query
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

		service_id
	)

	//extract service from array
	.then ((service_array) =>
	{
		if (service_array.length === 0)
			throw "There were no Services with the provided ID.";

		return service_array[0];
	})

	//make an array of the days of the scheduled job
	.then ((service) =>
	{
		//get the days
		return db_query
		(
			`select
				distinct
					Date,
					FirstDay,
					ServiceDayID
				from WeekWork
				where ServiceID = ?
				order by Date`,

			service_id
		)

		//get the workers for each day
		.then ((days) =>
		{
			//every element will be an array of JSONs like {Worker: "Worker Name"}
			teams = [];

			days.forEach ((day) =>
			{
				//push an array of Worker JSONs onto teams
				teams.push
				(
					db_query
					(
						`select WorkerID, WorkerName, WorkerStatus
							from WeekWork
							where
								ServiceID    = ? and
								ServiceDayID = ?`,

						[service_id, day.ServiceDayID]
					)
				)
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
	return db_query
	(
		`call CreateService (?, ?)`,

		[params.JobID, params.ServiceDate]
	)

	//get the ID of the new service
	.then ((results) =>
	{
		return db_query
		(
			`select ServiceID
				from Services
				where
					JobID = ? and
					ServiceDate = ?`,

			[params.JobID, params.ServiceDate]
		);
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
	//function to remove timestamp from dates
	const date = (datetime) => (JSON.stringify(datetime).substr(1, 10));

	//convert each day's date to a day number to match database
	params.Date = params.Days[0].Date;
	Days = params.Days.map ((day) =>
	{
		day.Day = Math.round((new Date(day.Date) - new Date(params.Date))
			/ (1000 * 60 * 60 * 24));

		return day;
	});

	console.log ("params: ", JSON.stringify (params, null, "\t"));

	//update JobID and ServiceDate
	let attributes = db_query
	(
		`update Services
			set
				JobID = ?,
				ServiceDate = ?
			where ServiceID = ?`,

		[params.JobID, date(params.Days[0].Date), params.ServiceID]
	);

	//update Days
	let service_days = db_query
	(
		`select ServiceDayID, ServiceDay
		from ServiceDays
		where ServiceID = ?`, params.ServiceID
	);

	//days that are not new or deleted will have a ServiceDayID
	const edited_days = params.Days.filter (
		(day) => (day.ServiceDayID !== undefined)
	);

	//the numbers of days that are not new or deleted
	const edited_day_nums = edited_days.map ((edited_day) => (edited_day.Day));

	//days that are new will have no ServiceDayID
	const added_days = params.Days.filter (
		(day) => (day.ServiceDayID === undefined)
	);

	console.log ("\nadded_days: " + JSON.stringify (added_days, null, "\t") + "\n");

	let delete_add_days = service_days.then ((db_days) =>
	{
		//days in the database that aren't in params should be deleted
		const to_delete = db_days.filter (
			(db_day) => (!edited_day_nums.includes (db_day.ServiceDay))
		);

		//delete days
		return Promise.all
		(
			to_delete.map ((delete_day) =>
			(
				db_query
				(
					`delete
					from ServiceDays
					where ServiceDayID = ?`, delete_day.ServiceDayID
				)
			))
		)

		//add days
		.then (() =>
		{
			return Promise.all
			(
				//for each day
				added_days.map ((new_day) =>
				{
					//add the service day
					return db_query
					(
						`insert into
							ServiceDays (ServiceID, ServiceDay)
							values      (        ?,          ?)`,

						[params.ServiceID, new_day.Day]
					)

					//add workers to the day
					.then (() =>
					{
						//get the id of the new service day
						return db_query
						(
							`select ServiceDayID
								from ServiceDays
								where
									ServiceID  = ? and 
									ServiceDay = ?`,

							[params.ServiceID, new_day.Day]
						)

						.then ((service_day_id) =>
						{
							service_day_id = service_day_id[0].ServiceDayID;

							return Promise.all
							(
								//insert each worker
								new_day.Workers.map ((worker_id) =>
								{
									return db_query
									(
										`insert into
											Assignments (ServiceDayID, WorkerID)
											values      (        ?,        ?)`,

										[service_day_id, worker_id]
									);
								})
							);
						});
					});
				})
			);
		});
	});

	//edit days

	//get the modified service
	return Promise.all ([attributes, delete_add_days]).then (() =>
	{
		return db_service.get (params.ServiceID);
	});
};

module.exports = db_service;
