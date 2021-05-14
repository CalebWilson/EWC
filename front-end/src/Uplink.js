const back_end = "http://localhost:8080/";

let Uplink = {};

//check the status of the response and convert to json
var check_status = (response) =>
{
	if (response.status !== 200)
	{
		throw response.status;
	}

	return response.json();
};

//package data into a json, in case of array
var package_data = (data) =>
{
	return ({data: data});
};

//error handling
var catch_errors = (error) =>
{
	console.log ("error");
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
};

//retrieve data from server
Uplink.get_data = function (endpoint)
{
	console.log ("getting data");
	return fetch (back_end + endpoint)
		.then  (check_status)
		.then  (package_data)
		.catch (catch_errors)
	;
};

//send data to server and receive response
Uplink.send_data = function (endpoint, body)
{
	console.log ("sending data");
	const request_options =
	{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify (body)
	};

	return fetch (back_end + endpoint, request_options)
		.then  (check_status)
		.then  (package_data)
		.catch (catch_errors)
	;
};

export default Uplink;
