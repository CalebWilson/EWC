TO RUN LOCALLY:

	$ cd database/
	$ sudo service mysql start
	$ sudo -h localhost -p
		[enter password]
		mysql> source database.sql
		mysql> exit

	$ cd back-end/
	$ npm run dev

	$ cd ../front-end/
	$ npm start

	In browser, navigate to localhost:3000
