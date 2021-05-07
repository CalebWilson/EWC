/*
const get_data = function (endpoint)
{
	return fetch (back_end + endpoint)
		.then ((response) =>
		{
			if (response.status !== 200)
			{
				throw response.status;
			}

			return response.json();
		})
		.then ((data) =>
		{
			return ({data: data});
		})
		.catch ((error) =>
		{
			return (
			{
				error:
					<div>
						<h1 style={{textAlign:"center"}}>
							Sorry, there was an error retrieving your data.<br/><br/>
							Error: "{error.toString()}"<br/><br/>

							Please contact the System Administrator.
						</h1>
					</div>
			})
		})
	;
}

export default get_data;
*/
