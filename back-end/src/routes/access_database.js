/*
	Retrieve data from the database

	Takes in a method to access the database and returns a function that calls that
	method and sends a JSON response created from its results.
*/
function access_database (db_method, params)
{
	//handler method to be returned
	return (async (request, response, next) =>
	{
		//invoke db_method and respond with results
		try
		{
			let results = await db_method (params);
			response.json(results);
		}

		//error handling
		catch (error)
		{
			console.log (error);
			response.sendStatus (500);
		}
	});
}

module.exports = access_database;
