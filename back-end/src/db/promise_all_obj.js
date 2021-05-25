/*
	Promise.all(), but takes an object instead of an array. Take in an object
	whose properties are Promises, and return a Promise of an object whose
	properties are the resoutions of the original Promises, so that the properties
	of the original object remain accessible inside .then().
*/
function promise_all_obj (object)
{
	//unzip object into array of keys and promises
	const keys     = Object.keys   (object);
	const promises = Object.values (object);

	//Promise of the array
	return Promise.all (promises).then
	(
		//convert the Promise of the array to a Promise of an object
		(values) =>
		{

			//zip the keys and values back together into an array
			let entries = keys.map ((key, index) => ([key, values[index]]));

			/*
				The following should be accomplished with:
					
					`let promise_obj = Object.fromEntries(entries);`,

				but this method is not supported by my version of Node.
			*/
			let promise_obj = {};
			entries.forEach ((entry) =>
			{
				promise_obj[entry[0]] = entry[1];
			});

			return promise_obj;
		}
	);
}

module.exports = promise_all_obj;
