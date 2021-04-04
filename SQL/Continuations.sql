use ewc;

drop table if exists Continuations;

-- Additional days of a service beyond the first
create table Continuations
(
	ContinuationID  int NOT NULL AUTO_INCREMENT,
	ScheduledJobID  int NOT NULL,
	ContinuationDay int NOT NULL, -- 0-indexed, with 0 omitted

	PRIMARY KEY (ContinuationID),

	FOREIGN KEY (ScheduledJobID) REFERENCES ScheduledJobs (ScheduledJobID)
);
