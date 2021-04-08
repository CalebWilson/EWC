use ewc;

/*
drop procedure if exists Recur;

delimiter //

create procedure Recur (in Week int)
begin
*/

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
				weeks_between (LastScheduled, curdate() + interval /*Week*/2 week) week

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
			weeks_between (LastScheduled, curdate() + interval /*Week*/2 week)
			% ServiceInterval = 0 and

			-- prevent duplicate ScheduledJobs
			weeks_between (LastScheduled, curdate() + interval /*Week*/2 week)
			!= 0
	;

	select * from newScheduledJobs;

	drop table if exists lastScheduledJobs;
	-- the previous services of the new ScheduledJobs
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


	-- create ScheduledJobDays for the ScheduledJobs that don't have any yet
	insert into ScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select ScheduledJobs.ScheduledJobID, lastScheduledJobDays.ScheduledJobDay

		from
			ScheduledJobs,
		(
			select
				lastScheduledJobs.JobID
					as JobID,
				lastScheduledJobs.ScheduledJobID
					as ScheduledJobID,
				ScheduledJobDays.ScheduledJobDay
						as ScheduledJobDay
			from ScheduledJobDays, lastScheduledJobs
			where ScheduledJobDays.ScheduledJobID = lastScheduledJobs.ScheduledJobID

		) as lastScheduledJobDays

		where
			ScheduledJobs.JobID           = lastScheduledJobDays.JobID and
			ScheduledJobs.ScheduledJobID != lastScheduledJobDays.ScheduledJobID
	;

	-- create Assignments for the ScheduledJobs that don't have any yet


/*
end //

delimiter ;
*/
