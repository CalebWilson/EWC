//import express
const express = require('express');

//import routes
const apiRouter = require('./routes');

//create app
const app = express();

//send to client as json
app.use(express.json());

app.use('/api/chirps', apiRouter);

app.listen('3000', () =>
{
	console.log("Server is running on port 3000");
});
