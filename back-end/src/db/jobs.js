const db = require ("./db");

const get_jobs = () =>
{
	return db.query (`select JobID, JobName from Jobs`);
}

module.exports = get_jobs;
