const express = require ("express");
const router = express.Router();

//root
router.get ("/", (request, response) =>
{
	response.redirect ("/schedule/0");
});

//schedule
const schedule_router = require ("./schedule");
router.use ("/schedule", schedule_router);

//scheduled job
const scheduled_job_router = require ("./scheduled_job");
router.use ("/scheduled_job", scheduled_job_router);

/* generate */
const generate_router = require ("./generate");
router.use ("/generate", generate_router)

module.exports = router;
