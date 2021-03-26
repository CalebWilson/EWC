use ewc;

drop table if exists Assignments;

create table Assignments
(
	AssignmentID int NOT NULL AUTO_INCREMENT,
	ScheduledJobID int NOT NULL,
	WorkerID int NOT NULL,

	UNIQUE (ScheduledJobID, WorkerID),

	PRIMARY KEY (AssignmentID),

	FOREIGN KEY (ScheduledJobID) REFERENCES ScheduledJobs (ScheduledJobID),
	FOREIGN KEY (      WorkerID) REFERENCES       Workers (      WorkerID)
);

-- test
insert into
	Assignments (ScheduledJobID, WorkerID)
	values      (             1,        1)
;
