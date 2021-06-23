const db = require("./db");

let db_service = {};

/*
	Get service details
*/
db_service.get = function (service_id)
{
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
		//get the days
		return db.query
		(
			`select
				distinct
					Date,
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
	return db.transaction ((query) =>
	(
			query
			(
				`call CreateService (?, ?)`,

				[params.JobID, params.ServiceDate]
			)
		//))
		.catch ((error) =>
		{
			console.log (error);

			throw error;
		})

		//get the ID of the new service
		.then (() =>
		(
			query
			(
				`select ServiceID
				from Services
				where
					JobID       = ? and
					ServiceDate = ?`,

				[params.JobID, params.ServiceDate]
			)
		))

		//get the new service
		.then ((id_results) =>
		{
			const service_id = id_results[0].ServiceID;

			return db_service.get (service_id)

			//if get fails, it means this is a new service
			.catch ((error) =>
			(
				query
				(
					`select
						Jobs.JobName,
						Services.FinalPrice,
						Services.Complete,
						ServiceDays.ServiceDayID
					from Jobs, Services, ServiceDays
					where
						ServiceDays.ServiceID = Services.ServiceID and
						Services.JobID        = Jobs.JobID         and
						Services.JobID = ?`, params.JobID
				)

				.then ((results) =>
				{
					results = results[0];

					return (
					{
						ServiceID: service_id,
						JobName: results.JobName,
						JobID: params.JobID,
						FinalPrice: results.FinalPrice,
						Complete: results.Complete,
						Days: [
							{
								Date: params.ServiceDate,
								ServiceDayID: results.ServiceDayID,
								Workers: []
							}
						]
					});
				})
			))
		})

		.catch ((error) =>
		{
			return { errors: ["Duplicate service for the same Job."] };
		})
	));
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
		null_date: "Missing date.",
		duplicate_service_day: "Duplicate days of the same service.",
		duplicate_service_day_worker: "Duplicate worker on the same day of the same service."
	};

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

	//the numbers of days that are not new or deleted
	const edited_day_IDs = edited_days.map ((edited_day) => (edited_day.ServiceDayID));

	//incoming days that are new will have no ServiceDayID
	const added_days = params.Days.filter (
		(day) => (day.ServiceDayID === undefined)
	);

	//protect against null dates
	let no_null_dates = new Promise ((resolve, reject) =>
	{
		//if there are days without a date
		if (params.Days.filter ((day) => (!day.Date)).length)
		{
			//throw a fit
			errors.push (error_types.null_date);
			reject      (error_types.null_date);
		}

		resolve (true);

	});

	//get current Service Days from database
	let service_days = no_null_dates.then (() =>
	(
		db.transaction ((query) =>
		(
			query
			(
				`select ServiceDayID, ServiceDay
				from ServiceDays
				where ServiceID = ?`, params.ServiceID
			)

			//delete days from the database that aren't incoming
			.then ((db_days) =>
			{
				//days in the database that aren't in params should be deleted
				const deleted_days = db_days.filter (
					(db_day) => (!edited_day_IDs.includes (db_day.ServiceDayID))
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
							)
						))
					)
				))

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
								`call CreateServiceDay (?, ?)`,
								[params.ServiceID, sql_date (new_day.Date)]
							)

							.then (() => (query (`select last_insert_id() as ID`)))

							.then ((id) =>
							{
								new_day.ServiceDayID = id[0].ID;

								return id;
							})
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

			//workers
			.then (() =>
			(
				//new day workers
				Promise.all
				(
					added_days.map ((new_day) =>
					{
						return Promise.all
						(
							//insert each worker
							new_day.Workers.map ((worker_id) =>
							{
								return query
								(
									`insert into
										Assignments (ServiceDayID, WorkerID)
										values      (           ?,        ?)`,

									[new_day.ServiceDayID, worker_id]
								);
							})
						);
					})

				//))

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
		))
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
		return db_service.get (params.ServiceID)

		.then ((service) =>
		{
			if (errors.length > 0)
				service.errors = errors;

			return service;
		});
	});

}; //end patch

/*
	Delete a service
*/
db_service.delete = function (service_id)
{
	return db.query (`delete from Services where ServiceID = ?`, service_id)
};

module.exports = db_service;
