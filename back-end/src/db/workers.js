const db = require ("./db");

const get_workers = () =>
{
	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`select WorkerID, WorkerName, Status from WorkerStatuses`,

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	});
}

module.exports = get_workers;
