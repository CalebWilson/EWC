use ewc;

drop procedure if exists Recur;

delimiter //

create procedure Recur (in Week int)
begin

	drop table if exists newScheduledJobs;
	-- ScheduledJobs created during this procedure
	create temporary table newScheduledJobs
	(
		JobID         int not null,
		ScheduleDate date not null
	);

	-- generate and save recurrences in the given week for the recurring Jobs
	insert into newScheduledJobs (JobID, ScheduleDate)
		select
			JobID,

			-- next service date
			LastScheduled + interval
				weeks_between (LastScheduled, curdate() + interval Week week) week

		from
		(
			-- get the last service and service interval of active recurring Jobs
			select
				ScheduledJobs.JobID
					as JobID,
				max(ScheduledJobs.ScheduleDate)
					as LastScheduled,
				Jobs.ServiceInterval
					as ServiceInterval

			from ScheduledJobs, Jobs, Statuses

			where
				ScheduledJobs.JobID = Jobs.JobID        and
				Jobs.StatusID       = Statuses.StatusID and
				Statuses.StatusName = "Active"          and
				Jobs.ServiceInterval is not null

			group by JobID

		) as serviceHistory

		-- in the given week
		where
			weeks_between (LastScheduled, curdate() + interval Week week)
			% ServiceInterval = 0 and

			-- prevent duplicate ScheduledJobs
			weeks_between (LastScheduled, curdate() + interval Week week)
			!= 0
	;

	-- the previous services of the new ScheduledJobs
	drop table if exists lastScheduledJobs;
	create temporary table lastScheduledJobs
	(
		JobID          int not null,
		ScheduledJobID int not null
	);

	insert into lastScheduledJobs (JobID, ScheduledJobID)
		select -- distinct
			ScheduledJobs.ScheduledJobID,
			ScheduledJobs.JobID

		from ScheduledJobs, newScheduledJobs

		where
			ScheduledJobs.JobID = newScheduledJobs.JobID and
			(
				-- the ScheduledJob is the latest
				select ScheduledJobs.ScheduleDate = max(inside.ScheduleDate)
				from ScheduledJobs as inside
				where ScheduledJobs.JobID = inside.JobID
			)
	;

	-- schedule the recurrences
	insert into ScheduledJobs (JobID, ScheduleDate)
		select JobID, ScheduleDate
		from newScheduledJobs
	;

	-- Job Days of the Jobs' previous ScheduledJobs
	drop table if exists lastScheduledJobDays;
	create temporary table lastScheduledJobDays
	(
		JobID             int not null,
		ScheduledJobID    int not null,
		ScheduledJobDayID int not null
	);

	insert into lastScheduledJobDays (JobID, ScheduledJobID, ScheduledJobDayID)
		select
			lastScheduledJobs.JobID,
			lastScheduledJobs.ScheduledJobID,
			ScheduledJobDays.ScheduledJobDayID
		from ScheduledJobDays, lastScheduledJobs
		where ScheduledJobDays.ScheduledJobID = lastScheduledJobs.ScheduledJobID
	;

	-- the ScheduledJobDays of the newScheduledJobs
	drop table if exists newScheduledJobDays;
	create temporary table newScheduledJobDays
	(
		ScheduledJobID  int not null,
		ScheduledJobDay int not null
	);

	-- create ScheduledJobDays for the newScheduledJobs
	insert into newScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select ScheduledJobs.ScheduledJobID, ScheduledJobDays.ScheduledJobDay
		from ScheduledJobs, lastScheduledJobDays, ScheduledJobDays
		where
			ScheduledJobs.JobID = lastScheduledJobDays.JobID
				and
			lastScheduledJobDays.ScheduledJobID = ScheduledJobDays.ScheduledJobID
				and
			lastScheduledJobDays.ScheduledJobDayID = ScheduledJobDays.ScheduledJobDayID
				and
			(
				select count(*) = 0
				from ScheduledJobDays as inside
				where inside.ScheduledJobID = ScheduledJobs.ScheduledJobID
			)
	;

	-- add the newScheduledJobDays
	insert into ScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select ScheduledJobID, ScheduledJobday
		from newScheduledJobDays
	;

	/*
		create Assignments for the ScheduledJobs with ScheduledJobDays
		that don't have any yet
	*/

	-- get the assignments for the lastScheduledJobDays
	insert into Assignments (ScheduledJobDayID, WorkerID)
		select ScheduledJobDays.ScheduledJobDayID, lastAssignments.WorkerID
		from
			ScheduledJobs,
			ScheduledJobDays,
			(
				-- Assignments for the JobDays of the lastScheduledJobs
				select 
					lastScheduledJobDays.JobID
						as JobID,
					ScheduledJobDays.ScheduledJobDay
						as ScheduledJobDay,
					Assignments.WorkerID
						as WorkerID

				from lastScheduledJobDays, ScheduledJobDays, Assignments

				where
					lastScheduledJobDays.ScheduledJobDayID =
						ScheduledJobDays.ScheduledJobDayID
						and
					ScheduledJobDays.ScheduledJobDayID = Assignments.ScheduledJobDayID

			) as lastAssignments
	
		where
		 	lastAssignments.JobID = ScheduledJobs.JobID and
		 	ScheduledJobs.ScheduledJobID = ScheduledJobDays.ScheduledJobID and
		 	ScheduledJobDays.ScheduledJobDay = lastAssignments.ScheduledJobDay and
			(
				-- there are no Assignments for the ScheduledJobDays
				select count(*) = 0
				from Assignments
				where
					Assignments.ScheduledJobDayID = ScheduledJobDays.ScheduledJobDayID
			)
	;

	-- drop temporary tables
	drop table newScheduledJobs;
	drop table lastScheduledJobs;
	drop table lastScheduledJobDays;
	drop table newScheduledJobDays;

end //

delimiter ;
