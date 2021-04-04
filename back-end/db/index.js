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

db.schedule = function(week)
{
	//week specificity
	condition = (week === undefined) ? "" : " where Week = " + week;

	//get GroupWork
	var group = new Promise ((resolve, reject) =>
	{
		pool.query ("select distinct Day, Job from GroupWork" + condition,
				(error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	});

	.then ((group_jobs) => //make array of Workers for each ScheduledJob
	{
		group_jobs.forEach ((group_job) =>
		{
			group_job.Workers = new Promise ((resolve, reject) =>
			{
				pool.query (
						"select Worker from GroupWork where Job = " + group_job.Job,
						(error, results) =>
				{
					if (error) return reject (error);
					return resolve (results);
				});
			});
		});

		return group_jobs;
	});
	//.then (db.get_continuations); //make array of days for each ScheduledJob

	var indiv = new Promise ((resolve, reject) =>
	{
		pool.query ("select * from IndividualWork" + condition, (error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	});
	//.then (db.get_continuations);

	return Promise.all ([group, indiv]).then ((work_arr) =>
	{
		return {"GroupWork": work_arr[0], "IndividualWork": work_arr[1]};
	})
};

/*
db.get_continuations = function (Work)
{
	Work.forEach (() =>
	{
*/
		

module.exports = db;

/*
db.schedule = function()
{
	return new Promise ((resolve, reject) =>
	{
		var group = new Promise ((resolve, reject) =>
		{
			pool.query ('select * from GroupWork', (err, results) =>
			{
				if (err) return reject (err);
				return resolve (results);
			});
		});

		var indiv = new Promise ((resolve, reject) =>
		{
			pool.query ('select * from IndividualWork', (err, results) =>
			{
				if (err) return reject (err);
				return resolve (results);
			});
		});

		return resolve ({"GroupWork": group, "IndividualWork": indiv});
	});
};

module.exports = db;
*/
