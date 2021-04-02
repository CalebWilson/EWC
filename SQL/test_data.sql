use ewc;

insert into
	Accounts (                  AccountName, AccountPhone,                   AccountAddress)
	values   ("Jones' BBQ and Foot Massage", "7082246191",           "119th and Old Cicero"),
				(            "Sherlock Holmes",         NULL,      "221B Baker Street, London"),
				(            "The Krusty Krab",         NULL, "124 Conch Street, Bikini Bottom"),
				(                "Bruce Wayne",         NULL, "1007 Mountain Dr., Gotham City"),
				(   "Inn of the Prancing Pony",         NULL,      "Bree-hill East Road, Bree"),
				(         "Mos Eisley Cantina",         NULL,                     "Mos Eisley"),
				(          "Mr. Bilbo Baggins",         NULL,   "End of Bagshot Row, Hobbiton")
;

insert into
	Jobs   (AccountID,                        JobName,     JobPhone,                        JobAddress,  Price, ServiceTypeID, InvoiceProcID, ServiceInterval, StatusID)
	values (        1,  "Jones' BBQ and Foot Massage", "7082246191",            "119th and Old Cicero",  30.00,             3,             1,               2,        1),
	       (        2,       "Sherlock Holmes's Flat",         NULL,       "221B Baker Street, London",  15.00,             1,             1,              12,        1),
			 (        3,              "The Krusty Krab",         NULL, "124 Conch Street, Bikini Bottom",  30.00,             2,             1,               2,        1),
			 (        4,                  "Wayne Manor",         NULL,  "1007 Mountain Dr., Gotham City", 900.00,             3,             2,              52,        1),
			 (        5,  "Inn of the Prancing Pony IN",         NULL,       "Bree-hill East Road, Bree",  50.00,             1,             2,               4,        1),
			 (        5, "Inn of the Prancing Pony OUT",         NULL,       "Bree-hill East Road, Bree",  50.00,             2,             2,               4,        1),
			 (        6,           "Mos Eisley Cantina",         NULL,                      "Mos Eisley",  40.00,             3,             1,            NULL,        1),
			 (        7,                      "Bag End",         NULL,    "End of Bagshot Row, Hobbiton",  20.00,             2,             2,            NULL,        1)
;

insert into
	ScheduledJobs (JobID,                                          ScheduleDate, Duration, FinalPrice)
	values        (    1, date(curdate() - interval weekday(curdate()) - 0 day),        0,      30.00),
	              (    2, date(curdate() - interval weekday(curdate()) - 0 day),        0,      15.00),
					  (    3, date(curdate() - interval weekday(curdate()) - 1 day),        0,      30.00),
					  (    4, date(curdate() - interval weekday(curdate()) - 1 day),        2,     900.00),
					  (    5, date(curdate() - interval weekday(curdate()) - 2 day),        0,      50.00),
					  (    6, date(curdate() - interval weekday(curdate()) - 2 day),        0,      50.00),
					  (    7, date(curdate() - interval weekday(curdate()) - 3 day),        0,      40.00),
					  (    8, date(curdate() - interval weekday(curdate()) - 4 day),        0,      20.00)
;

insert into
	Workers ( Username,    Password,         WorkerName, StatusID)
	values  ("FrodBag",   "Samwise",    "Frodo Baggins",        1),
	        (  "Robin", "PoisonIvy",     "Dick Grayson",        1),
			  (  "Vader", "ihatesand", "Anakin Skywalker",        1),
			  ("Patrick", "Spungebob",     "Patrick Star",        1)
;

insert into
	Assignments (ScheduledJobID, WorkerID)
	     values (             1,        1),
		         (             2,        2),
		         (             3,        4),
		         (             4,        1),
		         (             4,        2),
		         (             4,        3),
		         (             5,        1),
		         (             5,        4),
		         (             6,        1),
		         (             6,        4),
		         (             7,        3),
		         (             8,        1)
;
