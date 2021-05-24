const db_query    = require ("./db_query");
const db_schedule = require ("./schedule");

const generate = (week) =>
{
	return db.query (`call GenerateWeek (?)`, week)

	.then ((results) =>
	{
		return db_schedule.get_week ({week: week});
	});

}

module.exports = generate;
