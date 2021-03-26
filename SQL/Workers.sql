use ewc;

drop table if exists Workers;

-- Workers and admins
create table Workers
(
	WorkerID            int NOT NULL AUTO_INCREMENT,
	Username   varchar( 25) NOT NULL,
	Password      char( 40) NOT NULL,
	WorkerName varchar( 50) NOT NULL,
	Email      varchar( 50),
	Address    varchar(150),
	StatusID            int NOT NULL,
	HiredDate          date,
	TerminationDate    date,

	UNIQUE (Username),
	UNIQUE (Email),

	PRIMARY KEY (WorkerID),

	FOREIGN KEY (StatusID) REFERENCES Statuses (StatusID)
);

show warnings;

-- test
insert into
	Workers (  Username,        Password,           WorkerName,                        Address, StatusID,    HiredDate)
	values  ("username", SHA("password"), "Firstname Lastname", "000 Street St. Town IN 00000",        1, "2000-01-01")
;

-- insert admin user
insert into 
	Workers (Username,                                   Password,     WorkerName, StatusID)
	values  ( "caleb", "65f915fd2c207430eb671f386c17716aaf2762da", "Caleb Wilson",        2)
;

select * from Workers;
