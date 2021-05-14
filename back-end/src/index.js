//start database
const { exec } = require ("child_process");
exec ("sudo service mysql start", (err, stdout, stderr) =>
{
	console.log (stdout);
});

//import express and CORS
const express = require("express");
const    cors = require("cors");

//create app
const app = express();

//send/receive data as json
app.use(express.json());

//CORS
app.use(cors());

//import routes
const router = require("./routes/app");

app.use("/", router);

app.listen("8080", () =>
{
	console.log("Server is running on port 8080");
});
