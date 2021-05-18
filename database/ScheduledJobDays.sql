use ewc;

drop table if exists ScheduledJobDays;

-- Additional days of a service beyond the first
create table ScheduledJobDays
(
	ScheduledJobDayID  int NOT NULL AUTO_INCREMENT,
	ScheduledJobID     int NOT NULL,
	ScheduledJobDay    int NOT NULL, -- 0-indexed

	UNIQUE (ScheduledJobID, ScheduledJobDay)

	PRIMARY KEY (ScheduledJobDayID),

	FOREIGN KEY (ScheduledJobID) REFERENCES ScheduledJobs (ScheduledJobID)
);

/*
-- test
insert into
	Continuations (ScheduledJobID, ContinuationDay)
	values        (             1,                ) 
;
*/
