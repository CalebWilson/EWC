//create connection pool
const mysql = require("mysql");

const mysql_password = require("./db_password");

let pool = mysql.createPool({
	connectionLimit: 50,
	database: "ewc",
	user: "root",
	password: mysql_password,
	host: "localhost",
	port: "3306"
});

db_promise_callback = (resolve, reject) =>
{
	return ((error, results) =>
	{
		if (error)
		{
			console.log ("inner error: ", error);
			return reject (error);
		}
		return resolve (results);
	});
}


let db = {};

db.query = (query_string, params) =>
{
	return new Promise ((resolve, reject) =>
	{
		pool.query (
			query_string,
			params,
			db_promise_callback (resolve, reject)
		);
	});
}

//wrap the provided queries in a transaction
//queries must be a function that returns a Promise
db.transaction = (queries) =>
{
	return new Promise ((resolve, reject) =>
	{
		//get a connection for the query_function to use
		pool.getConnection ((connect_error, connection) =>
		(
			//start a transaction
			connection.query
			(
				`start transaction`,

				//run the provided query function
				(error) =>
				{
					if (error) return reject (error);

					queries
					(
						//provide a query function for the queries to use
						(query_string, params) =>
						{
							return new Promise ((resolve, reject) =>
							{
								connection.query (
									query_string,
									params,
									db_promise_callback (resolve, reject)
								);
							});
						}
					)

					//if the queries run successfully, commit the transaction
					.then ((results) =>
					{
						console.log ("committing");

						connection.query (`commit`,
							() => { connection.release(); }
						);

						return resolve (results);
					})

					//if any of the queries fail, rollback the transaction
					.catch ((error) =>
					{
						console.log ("rollbacking");

						connection.query (`rollback`,
							() => { connection.release(); }
						);

						return reject (error);
					})
				}
			)
		))
	});
}

module.exports = db;
