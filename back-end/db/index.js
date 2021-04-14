const mysql = require('mysql');

const pool = mysql.createPool({
	connectionLimit: 10,
	database: "ewc",
	user: "root",
	password: "unixroxmacsux",
	host: "localhost",
	port: "3306"
});

let db = {};

db.schedule_week = function (week)
{
	//week specificity
	week_condition = (week === undefined) ?  "1" :
		"Week = " + week +                           //this week's work
		" or (Week = " + (week - 1) + " and Day > 4)" //last week's overflow
	;

	let schedule = [];
	for (let day = 0; day < 5; day ++)
	{
		schedule.push (db.schedule_day (week_condition, day));
	}

	return Promise.all (schedule);
};

db.schedule_day = function (week_condition, day)
{
	//get GroupWork
	var group = new Promise ((resolve, reject) =>
	{
		pool.query (
				`select
					distinct
						Day % 5 as Day,
						FirstDay,
						JobName,
						ServiceType,
						FinalPrice,
						Complete
					from GroupWork
					where Day % 5 = ` + day + ` and `
					+ week_condition,
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
				pool.query (
						`select WorkerName, WorkerStatus
							from GroupWork
							where
								JobName = ?           and
								Day % 5 = ` + day + ` and `
								+ week_condition
						,
						[group_job.JobName, group_job.Day],
						(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				});
			}));
		});

		//match each worker team with its job
		return Promise.all (teams).then ((teams) =>
		{
			/*
			//replace each Worker JSON with the Worker's name
			for (i = 0; i < teams.length; i++)
			{
				teams[i] = teams[i].map (worker_obj => worker_obj.Worker);
			}
			*/

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
		pool.query (
				`select
					distinct
						Day % 5 as Day,
						WorkerName
					from IndividualWork
					where
						Day % 5 = ` + day + ` and `
						+ week_condition
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
				pool.query (
						`select
							JobName, FirstDay, ServiceType, FinalPrice, Complete
							from IndividualWork
							where
								WorkerName = ? and
								Day        = ? and `
								+ week_condition
						,
						[worker.WorkerName, worker.Day],
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


module.exports = db;
