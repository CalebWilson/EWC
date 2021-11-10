TO RUN LOCALLY:

	$ echo "module.exports = \"{your database password}\";" >> back-end/src/db/db_password.js

	$ cd database/
	$ sudo service mysql start
	$ sudo mysql -h localhost -p
		[enter password]
		mysql> source database.sql
		mysql> exit

	$ cd back-end/
	$ npm run dev

	$ cd ../front-end/
	$ npm start

	In browser, navigate to localhost:3000
