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
	Jobs   (AccountID,                       JobName,     JobPhone,                        JobAddress,  Price, ServiceTypeID, InvoiceProcID, ServiceInterval, StatusID)
	values (        1, "Jones' BBQ and Foot Massage", "7082246191",            "119th and Old Cicero",  30.00,             3,             1,               2,        1),
	       (        2,      "Sherlock Holmes's Flat",         NULL,       "221B Baker Street, London",  15.00,             1,             1,              12,        1),
			 (        3,             "The Krusty Krab",         NULL, "124 Conch Street, Bikini Bottom",  30.00,             2,             1,               2,        1),
			 (        4,                 "Wayne Manor",         NULL,  "1007 Mountain Dr., Gotham City", 500.00,             3,             2,              52,        1),
			 (        5,    "Inn of the Prancing Pony",         NULL,       "Bree-hill East Road, Bree",  50.00,             1,             2,               4,        1),
			 (        5,    "Inn of the Prancing Pony",         NULL,       "Bree-hill East Road, Bree",  50.00,             2,             2,               4,        1),
			 (        6,          "Mos Eisley Cantina",         NULL,                      "Mos Eisley",  40.00,             3,             1,            NULL,        1),
			 (        7,                     "Bag End",         NULL,    "End of Bagshot Row, Hobbiton",  20.00,             2,             2,            NULL,        1)
;
