select "Assignments.sql";

use ewc;

drop table if exists Assignments;

create table Assignments
(
	AssignmentID      int NOT NULL AUTO_INCREMENT,
	ServiceDayID int NOT NULL,
	WorkerID          int NOT NULL,

	UNIQUE (ServiceDayID, WorkerID),

	PRIMARY KEY (AssignmentID),

	FOREIGN KEY (ServiceDayID) REFERENCES ServiceDays (ServiceDayID),
	FOREIGN KEY (    WorkerID) REFERENCES  Workers    (    WorkerID)
);

/*
-- test
insert into
	Assignments (ServiceDayID, WorkerID)
	values      (             1,        1)
;
*/

select * from Assignments;
