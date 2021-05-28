const db = require ("./db");

const get_workers = () =>
{
	return db.query (`select WorkerID, WorkerName, Status from WorkerStatuses`);
}

module.exports = get_workers;
