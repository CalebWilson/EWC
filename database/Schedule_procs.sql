select "Schedule_procs.sql";

use ewc;

/*
	Given the temporary table newServices, copy the ServiceDays and Assignments
	from the latest prior Services of the Job of the newServices.
*/
drop procedure if exists RenewServiceData;

delimiter //

create procedure RenewServiceData()
begin

	-- the previous services of the new Services
	drop table if exists lastServices;
	create temporary table lastServices
	(
		JobID     int not null,
		ServiceID int not null
	);

	insert into lastServices (JobID, ServiceID)
		select -- distinct
			Services.JobID,
			Services.ServiceID

		from Services, newServices

		where
			Services.JobID = newServices.JobID and
			(
				-- the Service is the latest
				select Services.ServiceDate = max(inside.ServiceDate)
				from Services as inside
				where Services.JobID = inside.JobID
			)
	;

	-- schedule the recurrences
	insert into Services (JobID, ServiceDate, FinalPrice)
		select Jobs.JobID, ServiceDate, Price
		from newServices, Jobs
		where newServices.JobID = Jobs.JobID
	;

	-- Job Days of the Jobs' previous Services
	drop table if exists lastServiceDays;
	create temporary table lastServiceDays
	(
		JobID        int not null,
		ServiceID    int not null,
		ServiceDayID int not null
	);

	insert into lastServiceDays (JobID, ServiceID, ServiceDayID)
		select
			lastServices.JobID,
			lastServices.ServiceID,
			ServiceDays.ServiceDayID
		from ServiceDays, lastServices
		where ServiceDays.ServiceID = lastServices.ServiceID
	;

	-- the ServiceDays of the newServices
	drop table if exists newServiceDays;
	create temporary table newServiceDays
	(
		ServiceID  int not null,
		ServiceDay int not null
	);

	-- create ServiceDays for the newServices
	insert into newServiceDays (ServiceID, ServiceDay)
		select Services.ServiceID, ServiceDays.ServiceDay
		from Services, lastServiceDays, ServiceDays
		where
			Services.JobID = lastServiceDays.JobID                  and
			lastServiceDays.ServiceID = ServiceDays.ServiceID       and
			lastServiceDays.ServiceDayID = ServiceDays.ServiceDayID and
			(
				select count(*) = 0
				from ServiceDays as inside
				where inside.ServiceID = Services.ServiceID
			)
	;

	-- add the newServiceDays
	insert into ServiceDays (ServiceID, ServiceDay)
		select ServiceID, Serviceday
		from newServiceDays
	;

	/*
		create Assignments for the Services with ServiceDays
		that don't have any yet
	*/

	-- get the assignments for the lastServiceDays
	insert into Assignments (ServiceDayID, WorkerID)
		select ServiceDays.ServiceDayID, lastAssignments.WorkerID
		from
			Services,
			ServiceDays,
			(
				-- Assignments for the JobDays of the lastServices
				select 
					lastServiceDays.JobID
						as JobID,
					ServiceDays.ServiceDay
						as ServiceDay,
					Assignments.WorkerID
						as WorkerID

				from lastServiceDays, ServiceDays, Assignments

				where
					lastServiceDays.ServiceDayID = ServiceDays.ServiceDayID and
					ServiceDays.ServiceDayID = Assignments.ServiceDayID

			) as lastAssignments
	
		where
		 	lastAssignments.JobID = Services.JobID              and
		 	Services.ServiceID = ServiceDays.ServiceID          and
		 	ServiceDays.ServiceDay = lastAssignments.ServiceDay and
			(
				-- there are no Assignments for the ServiceDays
				select count(*) = 0
				from Assignments
				where
					Assignments.ServiceDayID = ServiceDays.ServiceDayID
			)
	;

	-- drop temporary tables
	drop table lastServices;
	drop table lastServiceDays;
	drop table newServiceDays;

end //

delimiter ;
-- end procedure RenewServiceData


/*
	Create a new Service.
*/
drop procedure if exists CreateService;

delimiter //

create procedure CreateService (in newJobID int, in newServiceDate date)
begin

	-- whether this will be the first Service for the given Job
	declare firstService boolean default 0;
	set firstService =
	(
		-- there are no Services for the given Job
		select count(*) = 0
		from Services
		where JobID = newJobID
	);

	if firstService
	then
		select "first service";

		insert into
			Services (   JobID,    ServiceDate)
		   values   (newJobID, newServiceDate)
		;

		insert into
			ServiceDays (       ServiceID, ServiceDay)
			values      (last_insert_id(),         0)
		;
	
	else
		start transaction;

			create temporary table newServices
			(
				JobID        int not null,
				ServiceDate date not null
			);

			insert into
				newServices (   JobID,    ServiceDate)
				values      (newJobID, newServiceDate)
			;

			call RenewServiceData();

			drop table newServices;

		commit;
	
	end if;

end //

delimiter ;

-- end procedure createService


/*
	Schedule a service for every recurring job that should have a service fall on
	this week.
*/
drop procedure if exists GenerateWeek;

delimiter //

create procedure GenerateWeek (in Week int)
begin

	drop table if exists newServices;
	-- Services created during this procedure
	create temporary table newServices
	(
		JobID        int not null,
		ServiceDate date not null
	);

	-- generate and save recurrences in the given week for the recurring Jobs
	insert into newServices (JobID, ServiceDate)
		select
			JobID,

			-- next service date
			LastScheduled + interval
				weeks_between (LastScheduled, curdate() + interval Week week) week

		from
		(
			-- get the last service and service interval of active recurring Jobs
			select
				Services.JobID
					as JobID,
				max(Services.ServiceDate)
					as LastScheduled,
				Jobs.ServiceInterval
					as ServiceInterval

			from Services, Jobs, Statuses

			where
				Services.JobID      = Jobs.JobID        and
				Jobs.StatusID       = Statuses.StatusID and
				Statuses.StatusName = "Active"          and
				Jobs.ServiceInterval is not null

			group by JobID

		) as serviceHistory

		-- in the given week
		where
			weeks_between (LastScheduled, curdate() + interval Week week)
				% ServiceInterval = 0 and

			-- prevent duplicate Services
			(
				select count(*) = 0
				from Jobs, Services
				where
					Services.JobID = Jobs.JobID      and
					Jobs.JobID = serviceHistory.JobID and
					weeks_between (Services.ServiceDate, curdate() + interval Week week) = 0
			)
	;

	call renewServiceData();

	drop table newServices;

end //

delimiter ;

-- end procedure GenerateWeek
