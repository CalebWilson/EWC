select "Services.sql";

use ewc;

drop table if exists Services;

-- Jobs scheduled to be serviced
create table Services
(
	ServiceID    int NOT NULL AUTO_INCREMENT,
	JobID        int NOT NULL,
	ServiceDate date NOT NULL,
	Complete boolean NOT NULL default 0,

	FinalPrice decimal(10,2),

	UNIQUE (JobID, ServiceDate),

	PRIMARY KEY (ServiceID),

	FOREIGN KEY (JobID)
		REFERENCES Jobs (JobID)
		ON DELETE CASCADE
);

/*
insert into
	Services (JobID,    ServiceDate, FinalPrice)
	values   (    1,   "2021-03-16",     100.01)
;
*/

select * from Services;
