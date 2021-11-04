/*
	Service
*/

//create router
const express = require("express");
const service_router = express.Router();

//function to access database
const access_database = require ("./access_database");

//service methods
const db_service = require("../db/service");

//create
service_router.post ("/", (request, response, next) =>
{
	let handler = access_database (db_service.post, request.body);

	handler (request, response, next);
});

service_router.route ("/:service_id")

//read
	.get ((request, response, next) =>
	{
		let handler =
			access_database (db_service.get, request.params.service_id);

		handler (request, response, next);
	})

//update
	.patch ((request, response, next) =>
	{
		request.body.ServiceID = request.params.service_id;

		let handler = access_database (db_service.patch, request.body);

		handler (request, response, next);
	})

//delete
	.delete ((request, response, next) =>
	{
		let handler =
			access_database (db_service.delete, request.params.service_id);

		handler (request, response, next);
	})
;

//complete
service_router.route ("/complete/:service_id")

	.get ((request, response, next) =>
	{
		let handler = access_database (
			db_service.get_complete, request.params.service_id
		);

		handler (request, response, next);
	})

	.patch ((request, response, next) =>
	{
		const params =
		{
			service_id: request.params.service_id,
			is_complete: request.body.is_complete
		};

		let handler = access_database (db_service.set_complete, params);

		handler (request, response, next);
	});

module.exports = service_router;
