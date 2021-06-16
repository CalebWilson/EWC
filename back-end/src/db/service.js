const db = require("./db");

let db_service = {};

/*
	Get information about a service.
*/
db_service.get = function (service_id)
{
	console.log ("getting service_id: " + service_id);

	//get information about the Service
	return db.query
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
		console.log ("service array: ", service_array);

		if (service_array.length === 0)
		{
			console.log ("no service results");
			throw "There were no Services with the provided ID.";
		}

		return service_array[0];
	})

	//make an array of the days of the scheduled job
	.then ((service) =>
	{
		console.log ("service: ", service);

		//get the days
		return db.query
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
			console.log ("days: ", days);

			//every element will be an array of JSONs like {Worker: "Worker Name"}
			teams = [];

			days.forEach ((day) =>
			{
				//push an array of Worker JSONs onto teams
				teams.push
				(
					db.query
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
				console.log ("teams: ", teams);

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
			console.log ("final days", JSON.stringify(days));

			service.Days = days;

			return service;
		})
	});
};

/*
	Create a new service.

	params will be a JSON of the form:
	{
		JobID: int,
		ServiceDate: date
	}
*/

db_service.post = function (params)
{
	//create new service in the database
	return db.query
	(
		`call CreateService (?, ?)`,

		[params.JobID, params.ServiceDate]
	)

	//get the ID of the new service
	.then ((results) =>
	{
		return db.query
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
	(
		db_service.get (results[0].ServiceID)
	))

	.catch ((error) =>
	{
		return { errors: ["Duplicate service for the same Job"] };
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
	params.ServiceID = parseInt (params.ServiceID);

	//function to remove timestamp from dates
	const sql_date = (datetime) => (datetime.toString().substr(0, 10));

	//errors
	let errors = [];
	let error_types =
	{
		duplicate_service_day: "Duplicate days of the same service.",
		duplicate_service_day_worker: "Duplicate worker on the same day of the same service."
	};

	//TODO: remove after debug
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
	let attributes = db.query
	(
		`update Services
			set
				JobID = ?,
				ServiceDate = ?
			where ServiceID = ?`,

		[params.JobID, sql_date(params.Days[0].Date), params.ServiceID]
	);

	//incoming days that are not new will have a ServiceDayID
	const edited_days = params.Days.filter (
		(day) => (day.ServiceDayID !== undefined)
	);

	console.log ("edited_days: ", edited_days);

	//the numbers of days that are not new or deleted
	const edited_day_IDs = edited_days.map ((edited_day) => (edited_day.ServiceDayID));

	//incoming days that are new will have no ServiceDayID
	const added_days = params.Days.filter (
		(day) => (day.ServiceDayID === undefined)
	);

	console.log ("\nadded_days: " + JSON.stringify (added_days, null, "\t"));
	console.log();

	//get current Service Days from database
	let service_days = db.transaction ((query) =>
	(
		query
		(
			`select ServiceDayID, ServiceDay
			from ServiceDays
			where ServiceID = ?`, params.ServiceID
		)
		.then ((results) =>
		{
			console.log ("before delete: ", results);
			return results;
		})

		//delete days from the database that aren't incoming
		.then ((db_days) =>
		{
			//days in the database that aren't in params should be deleted
			const deleted_days = db_days.filter (
				(db_day) => (!edited_day_IDs.includes (db_day.ServiceDayID))
			);

			console.log (
				"\ndeleted_days: " +
				JSON.stringify (deleted_days, null, "\t") +
				"\n"
			);

			//delete days
			return Promise.all
			(
				deleted_days.map ((delete_day) =>
				(
					db.query
					(
						`delete
						from ServiceDays
						where ServiceDayID = ?`, delete_day.ServiceDayID
					)
				))
			);

		}) //end delete_days

		//TODO remove after debug
		.then ((del_days) =>
		{
			db.query
			(
				`select ServiceDayID, ServiceDay
						from ServiceDays
						where ServiceID = ?`, params.ServiceID
			)

			.then ((results) => { console.log ("after delete: ", results)});

			return del_days;
		})

		//edit days
		.then (() =>
		(
			//null the service's days to avoid temporary unique conflicts
			query
			(
				`update ServiceDays
				set ServiceDay = null
				where ServiceID = ?`, params.ServiceID
			)

			//set all the service's days
			.then (() =>
			(
				Promise.all
				(
					edited_days.map ((edited_day) =>
					(
						query
						(
							`call UpdateServiceDay (?, ?)`,

							[edited_day.ServiceDayID, sql_date (edited_day.Date)]

							//TODO remove after debug
							/*
								`update ServiceDays
								set ServiceDay = ?
								where ServiceDayID = ?`,

								[edited_day.Day, edited_day.ServiceDayID]
							*/
						)
					))
				)
			))

			//TODO remove after debug
			.then ((results) =>
			{
				console.log ("finished edit_day_nums");
				return results;
			})

			//add days
			.then (() =>
			(
				Promise.all
				(
					//for each day
					added_days.map ((new_day) =>
					(
						//add the service day
						query
						(
							//TODO remove after debug
							/*
								`insert into
									ServiceDays (ServiceID, ServiceDay)
									values      (        ?,          ?)`,

								[params.ServiceID, new_day.Day]
							*/

							`call CreateServiceDay (?, ?)`,
							[params.ServiceID, sql_date (new_day.Date)]
						)
					))
				)
			))

			//if there was a duplicate day
			.catch ((error) =>
			{
				//add to logged errors
				errors.push (error_types.duplicate_service_day);

				throw error;
			})
		))

		.then ((results) =>
		{
			console.log ("finished add_days");

			return results;
		})

		//workers
		.then (() =>
		(
			//new day workers
			Promise.all
			(
				added_days.map ((new_day) =>
				(
					//get the id of the new service day
					query
					(
						`select ServiceDayID
							from ServiceDays
							where
								ServiceID  = ? and 
								ServiceDay = ?`,

						//TODO: convert from Day to Date
						[params.ServiceID, new_day.Day]
					)

					//add Workers to new days
					.then ((service_day_id) =>
					{
						service_day_id = service_day_id[0].ServiceDayID;

						return Promise.all
						(
							//insert each worker
							new_day.Workers.map ((worker_id) =>
							{
								console.log ("adding worker " + worker_id);

								return query
								(
									`insert into
										Assignments (ServiceDayID, WorkerID)
										values      (           ?,        ?)`,

									[service_day_id, worker_id]
								);
							})
						);
					})
				))

			) //end new day workers

			//edited day workers
			.then (() =>
			(
				Promise.all
				(
					edited_days.map ((edited_day) =>
					{
						//get all the workers assigned to the day
						let db_workers = query
						(
							`select WorkerID
							from Assignments
							where ServiceDayID = ?`, edited_day.ServiceDayID
						)
						.then ((workers) =>
						(
							workers.map ((worker) => (worker.WorkerID))
						));

						//delete workers
						let delete_workers = db_workers.then ((old_workers) =>
						{
							//deleted workers are in database but not in edited day
							let deleted_workers = old_workers.filter
							(
								(db_worker) => (!edited_day.Workers.includes (db_worker))
							);

							return Promise.all
							(
								deleted_workers.map ((deleted_worker) =>
								(
									query
									(
										`delete
											from Assignments
											where
												ServiceDayID = ? and
												WorkerID = ?`,

										[edited_day.ServiceDayID, deleted_worker]
									)
								))
							);

						}); //end delete_workers

						//add workers
						let add_workers = db_workers.then ((old_workers) =>
						{
							//added workers are in the edited day but not the database
							let added_workers = edited_day.Workers.filter
							(
								(edited_day_worker, index) =>
								{
									//if duplicate workers, throw error
									if (edited_day.Workers.indexOf (edited_day_worker) !== index)
										throw "duplicate workers";

									return !old_workers.includes (edited_day_worker);
								}
							);

							return Promise.all
							(
								added_workers.map ((added_worker) =>
								(
									query
									(
										`insert into
											Assignments (ServiceDayID, WorkerID)
											values      (           ?,        ?)`,

										[edited_day.ServiceDayID, added_worker]
									)
								))
							);

						}); //end add_workers

						return Promise.all ([add_workers, delete_workers]);

					}) //end edited_days.map
				)

			)) //end edited day workers

			.catch ((error) =>
			{
				//add to logged errors
				errors.push (error_types.duplicate_service_day_worker);

				throw error;
			})

		)) //end workers 

		.then ((results) =>
		{
			console.log ("finished workers");

			return results;
		})

	))

	.catch ((error) =>
	{
		console.log (error, `

		HANDLED

		`);

		return true;

	}); //end service days

	return Promise.all
	([
		attributes,
		service_days
	])

	//get the modified service
	.then (() => 
	{
		console.log ("reached get");
		
		return db_service.get (params.ServiceID)

		.then ((service) =>
		{
			if (errors.length > 0)
				service.errors = errors;

			return service;
		});
	});
};

module.exports = db_service;
