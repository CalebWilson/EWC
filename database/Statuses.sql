select "Statuses.sql";

use ewc;

-- Statuses that Workers and Jobs can have
create table Statuses
(
	StatusID           int NOT NULL AUTO_INCREMENT,
	StatusName varchar(10) NOT NULL,

	UNIQUE (StatusName),
	PRIMARY KEY (StatusID)
);

insert into Statuses (StatusName)
	values ("Active"), ("Inactive"), ("Terminated");
