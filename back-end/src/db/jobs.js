const db_query = require ("./db_query");

const get_jobs = () =>
{
	return db_query (`select JobID, JobName from Jobs`);
}

module.exports = get_jobs;
