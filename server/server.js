//import express
const express = require('express');

//create app
const app = express();

//send/receive data as json
app.use(express.json());

//import routes
const router = require('./routes/index');

app.use('/', router);

app.listen('3000', () =>
{
	console.log("Server is running on port 3000");
});
