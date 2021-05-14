const { exec } = require("child_process");
exec ("sudo echo hello", (err, stdout, stderr) =>
{
	console.log (stdout);
});
