const db = require ("./db");

const get_jobs = () =>
{
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`select JobID, JobName from Jobs`,

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	});
}

module.exports = get_jobs;
