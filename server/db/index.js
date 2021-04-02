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
	return new Promise ((resolve, reject) =>
	{
		pool.query ('select * from Workers', (err, results) =>
		{
			if (err) return reject (err);

			return resolve (results);
		});
	});
};

module.exports = db;
