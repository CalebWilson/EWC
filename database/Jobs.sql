select "Jobs.sql";

use ewc;

drop table if exists Jobs;

-- Jobs that EWC has been hired to do
create table Jobs
(
	JobID                int NOT NULL AUTO_INCREMENT,
	AccountID            int NOT NULL,
	JobName    varchar(  50) NOT NULL,
	JobPhone      char(  10),
	JobAddress varchar( 150) NOT NULL,
	JobNotes   varchar(1000),

	Price         decimal(10, 2),
	UpperEstimate decimal(10, 2),
	LowerEstimate decimal(10, 2),

	ServiceTypeID int NOT NULL, -- inside, outside, or both
	InvoiceProcID int NOT NULL, -- C.O.D. or Net 30

	ServiceInterval int,          -- number of weeks between services
	StatusID        int NOT NULL, -- Active, Inactive, or Terminated

	UNIQUE (JobName),

	PRIMARY KEY (JobID),

	FOREIGN KEY (AccountID) REFERENCES Accounts (AccountID)
		on delete cascade,

	FOREIGN KEY      (StatusID) REFERENCES Statuses          (StatusID),
	FOREIGN KEY (ServiceTypeID) REFERENCES ServiceTypes (ServiceTypeID),
	FOREIGN KEY (InvoiceProcID) REFERENCES InvoiceProcs (InvoiceProcID)
);

show warnings;

/*
-- test
insert into
	Jobs   (AccountID, JobName,     JobPhone,                     JobAddress, ServiceTypeID, InvoiceProcID, LastScheduled, ServiceInterval, StatusID)
	values (        1,  "Test", "3175555555", "000 Street St. Town IN 00000",             1,             1,  "2000-01-01",               1,        1)
;
*/

select * from Jobs;

/*
-- year insertion
drop trigger if exists ProjectYear;

delimiter //

create trigger ProjectYear before insert on Project
for each row
begin

	set new.Year = YEAR(CURDATE());

end;
//
delimiter ;
*/
