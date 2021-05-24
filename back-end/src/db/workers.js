const db_query = require ("./db_query");

const get_workers = () =>
{
	return db_query (`select WorkerID, WorkerName, Status from WorkerStatuses`);
}

module.exports = get_workers;
