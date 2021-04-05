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

db.schedule = function (week)
{
	//week specificity
	condition = (week === undefined) ? "" : " where Week = " + week;

	//get GroupWork
	var group = new Promise ((resolve, reject) =>
	{
		pool.query (
				"select distinct Day, Job from GroupWork" + condition,
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
						"select Worker from GroupWork where Job = ? and Day = ?",
						[group_job.Job, group_job.Day],
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
			//replace each Worker JSON with the Worker's name
			for (i = 0; i < teams.length; i++)
			{
				teams[i] = teams[i].map (worker_obj => worker_obj.Worker);
			}

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
				"select distinct Day, Worker from IndividualWork" + condition,
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
						"select Job from IndividualWork where Worker = ? and Day = ?",
						[worker.Worker, worker.Day],
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
			//replace each Job JSON with the Job's name
			for (i = 0; i < job_sets.length; i++)
			{
				job_sets[i] = job_sets[i].map (job_obj => job_obj.Job);
			}

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
