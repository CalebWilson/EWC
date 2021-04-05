use ewc;

drop table if exists Assignments;

create table Assignments
(
	AssignmentID      int NOT NULL AUTO_INCREMENT,
	ScheduledJobDayID int NOT NULL,
	WorkerID          int NOT NULL,

	UNIQUE (ScheduledJobDayID, WorkerID),

	PRIMARY KEY (AssignmentID),

	FOREIGN KEY (ScheduledJobDayID) REFERENCES ScheduledJobDays (ScheduledJobDayID),
	FOREIGN KEY (         WorkerID) REFERENCES       Workers    (         WorkerID)
);

/*
-- test
insert into
	Assignments (ScheduledJobDayID, WorkerID)
	values      (             1,        1)
;
*/

select * from Assignments;
