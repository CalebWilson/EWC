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

db.schedule = function()
{
	var group = new Promise ((resolve, reject) =>
	{
		pool.query ("select * from GroupWork", (error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	});

	var indiv = new Promise ((resolve, reject) =>
	{
		pool.query ("select * from IndividualWork", (error, results) =>
		{
			if (error) return reject (error);
			return resolve (results);
		});
	});

	return Promise.all ([group, indiv]).then ((work_arr) =>
	{
		return {"GroupWork": work_arr[0], "IndividualWork": work_arr[1]};
	});

};

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
