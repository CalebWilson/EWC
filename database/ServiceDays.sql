select "ServiceDays.sql";

use ewc;

drop table if exists ServiceDays;

-- Additional days of a service beyond the first
create table ServiceDays
(
	ServiceDayID  int NOT NULL AUTO_INCREMENT,
	ServiceID     int NOT NULL,
	ServiceDay    int NOT NULL, -- 0-indexed

	UNIQUE (ServiceID, ServiceDay),

	PRIMARY KEY (ServiceDayID),

	FOREIGN KEY (ServiceID) REFERENCES Services (ServiceID)
);

/*
drop trigger if exists 
create 
*/

/*
-- test
insert into
	Continuations (ServiceID, ContinuationDay)
	values        (        1,                ) 
;
*/
