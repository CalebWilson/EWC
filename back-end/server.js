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
const router = require("./routes/index");

app.use("/", router);

app.listen("8080", () =>
{
	console.log("Server is running on port 8080");
});
