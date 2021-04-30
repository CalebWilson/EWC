/*
const mysql = require("mysql");

const pool = mysql.createPool({
	connectionLimit: 10,
	database: "ewc",
	user: "root",
	password: "unixroxmacsux",
	host: "localhost",
	port: "3306"
});
*/

const db = require("./db");

let db_schedule = {};

/*
	Get all Assignments for the given week and worker
*/
db_schedule.get_week = function (params)
{
	//extract parameters
	let week;
	let worker;

	if (params !== undefined)
	{
		week   = params.week;
		worker = params.worker;
	}

	//week specificity
	week_condition = (week === undefined) ?  `1` :
		`((Week = ` +  week +      ` and Day <= 4) or ` + //this week's work
		` (Week = ` + (week - 1) + ` and Day >  4))`      //last week's overflow
	;

	//worker specificity for GroupWork
	group_worker_condition = (worker === undefined) ? `1` :
		//there is a day of the ScheduledJob to which the Worker is assigned
		`(
			select count(*) > 0
			from GroupWork as inside
			where
				inside.ScheduledJobID = GroupWork.ScheduledJobID and
				inside.Day            = GroupWork.Day            and
				WorkerID              = ` + worker +
		`)`
	;

	//worker specificity for IndividualWork
	indiv_worker_condition = (worker === undefined) ? `1` : `WorkerID = ` + worker;

	//build schedule by day
	let schedule = [];
	for (let day = 0; day < 5; day ++)
	{
		schedule.push
		(
			db_schedule.get_day
			(
				day,
				week_condition,
				group_worker_condition,
				indiv_worker_condition
			)
		);
	}

	return Promise.all (schedule);
};

/*
	Get all Assignments on the given day, given conditions for week and worker
*/
db_schedule.get_day = function
	(
		day,
		week_condition,
		group_worker_condition,
		indiv_worker_condition
	)
{
	//get GroupWork
	var group = new Promise ((resolve, reject) =>
	{
		db.query (
				`select
					distinct
						JobName,
						ScheduledJobID,
						ServiceType,
						FinalPrice,
						Complete,
						ScheduledJobID,
						ScheduledJobDayID,
						FirstDay
					from GroupWork
					where Day % 5 = ` + day + ` and `
					+ week_condition + ` and `
					+ group_worker_condition,
					+ `1`,
				(error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	})

	//make array of Workers for each ScheduledJob
	.then ((group_jobs) =>
	{
		//every element will be an array of JSONs like {Worker: "Worker Name"}
		teams = [];

		//for each group job
		group_jobs.forEach ((group_job) =>
		{
			//add the team that will work on that job to teams array
			teams.push (new Promise ((resolve, reject) =>
			{
				db.query
				(
					`select WorkerID, WorkerName, WorkerStatus
						from GroupWork
						where
							JobName = ?           and
							Day % 5 = ` + day + ` and `
							+ week_condition
					,
					group_job.JobName,

					(error, results) =>
					{
						if (error) return reject (error);
						return resolve (results);
					}
				);
			}));
		});

		//match each worker team with its job
		return Promise.all (teams).then ((teams) =>
		{
			//add each team as an attribute of the group job
			group_jobs.forEach ((group_job, index) =>
			{
				group_job.Workers = teams[index];
			});

			return group_jobs;
		});

	});

	//get IndividualWork
	var indiv = new Promise ((resolve, reject) =>
	{
		db.query (
				`select
					distinct
						WorkerID,
						WorkerName
					from IndividualWork
					where
						Day % 5 = ` + day + ` and `
						+ week_condition  + ` and `
						+ indiv_worker_condition
				,
				(error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	})

	//make array of ScheduledJobs for each Worker
	.then ((indiv_workers) =>
	{
		//every element will be an array of JSONS like {Job: "Job Name"}
		job_sets = [];

		//for each individual worker
		indiv_workers.forEach ((worker) =>
		{
			//add the jobs that the worker does to the jobs array
			job_sets.push (new Promise ((resolve, reject) =>
			{
				db.query (
						`select
							JobName,
							ScheduledJobID,
							ServiceType,
							FinalPrice,
							Complete,
							ScheduledJobDayID,
							FirstDay
							from IndividualWork
							where
								WorkerID = ? and
								Day % 5  = ? and `
								+ week_condition
						,
						[worker.WorkerID, day],
						(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				});
			}));
		});

		//match each set of jobs with its worker
		return Promise.all (job_sets).then ((job_sets) =>
		{
			//add each job set as an attribute of the individual worker
			indiv_workers.forEach ((worker, index) =>
			{
				worker.Jobs = job_sets[index];
			});

			return indiv_workers;
		});

	});

	return Promise.all ([group, indiv]).then ((work_arr) =>
	{
		return {"GroupWork": work_arr[0], "IndividualWork": work_arr[1]};
	})
};

module.exports = db_schedule;
