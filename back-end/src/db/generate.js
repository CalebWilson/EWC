const db          = require ("./db");
const db_schedule = require ("./schedule");

const generate = (week) =>
{
	console.log ("in generate");

	return new Promise ((resolve, reject) =>
	{
		db.query
		(
			`call GenerateWeek (?)`,

			week,

			(error, results) =>
			{
				if (error) return reject (error);
				return resolve (results);
			}
		);
	})

	.then ((results) =>
	{
		return db_schedule.get_week ({week: week});
	});

}

module.exports = generate;
