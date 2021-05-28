select "ServiceDays.sql";

use ewc;

drop table if exists ServiceDays;

-- Additional days of a service beyond the first
create table ServiceDays
(
	ServiceDayID  int NOT NULL AUTO_INCREMENT,
	ServiceID     int NOT NULL,
	ServiceDay    int, -- 0-indexed, only nullable to allow intermediate NULLs

	UNIQUE (ServiceID, ServiceDay),

	PRIMARY KEY (ServiceDayID),

	FOREIGN KEY (ServiceID)
		REFERENCES Services (ServiceID)
		ON DELETE CASCADE
);

/*
-- test
insert into
	ServiceDays (ServiceID, ServiceDay)
	values      (        1,           ) 
;
*/

drop procedure if exists CreateServiceDay;

delimiter //

create procedure CreateServiceDay (in service_id int, in service_day_date date)
begin

	declare service_date date;

	set service_date =
	(
		select ServiceDate
		from Services
		where ServiceID = service_id
	);

	insert into
		ServiceDays (ServiceID,                                ServiceDay)
		values      (service_id, datediff (service_day_date, service_date))
	;

end //

delimiter ;

drop procedure if exists UpdateServiceDay;

delimiter //

create procedure UpdateServiceDay
(
	in service_day_id int,
	in service_day_date date
)
begin

	declare service_date date;

	set service_date =
	(
		select Services.ServiceDate
		from ServiceDays, Services
		where
			ServiceDays.ServiceDayID = service_day_id and
			ServiceDays.ServiceID    = Services.ServiceID
	);

	update ServiceDays 
		set ServiceDay = datediff (service_day_date, service_date)
		where ServiceDayID = service_day_id
	;

end //

delimiter ;
