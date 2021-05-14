use ewc;

drop table if exists ScheduledJobs;

-- Jobs scheduled to be serviced
create table ScheduledJobs
(
	ScheduledJobID int NOT NULL AUTO_INCREMENT,
	JobID          int NOT NULL,
	ScheduleDate  date NOT NULL,
	Complete   boolean NOT NULL default 0,

	FinalPrice decimal(10,2),

	UNIQUE (JobID, ScheduleDate),

	PRIMARY KEY (ScheduledJobID),

	FOREIGN KEY (JobID) REFERENCES Jobs (JobID)
);

/*
insert into
	ScheduledJobs (JobID,    ScheduleDate, FinalPrice)
	values       (    1,    "2021-03-16",     100.01)
;
*/

select * from ScheduledJobs;
