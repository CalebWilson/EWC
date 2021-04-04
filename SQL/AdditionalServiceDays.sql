use ewc;

drop table if exists AdditionalServiceDays;

-- Additional days of a service beyond the first
create table AdditionalServiceDays
(
	AdditionalServiceDayID int NOT NULL AUTO_INCREMENT,
	ScheduledJobID         int NOT NULL,
	ServiceDay             int NOT NULL, -- 0-indexed, with 0 omitted

	PRIMARY KEY (AdditionalServiceDayID),

	FOREIGN KEY (ScheduledJobID) REFERENCES ScheduledJobs (ScheduledJobID)
);
