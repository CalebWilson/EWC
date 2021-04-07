use ewc;

drop view if exists ActiveJobs;

-- get the Intervals and LastScheduled date from the active recurring jobs
create view ActiveJobs
as
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
;

drop procedure if exists Recur;

delimiter //

create procedure Recur (in Week int)
begin

	insert into ScheduledJobs (JobID, ScheduleDate)
		select
			JobID,
			LastScheduled + interval
				weeks_between (LastScheduled, curdate() + interval Week week) week

		from ActiveJobs

		where
			weeks_between (LastScheduled, curdate() + interval Week week)
			% ServiceInterval
			= 0
	;


	-- create ScheduledJobDays for the ScheduledJobs that don't have any yet
	insert into ScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select newScheduledJobs.ScheduledJobID, ScheduledJobDays.ScheduledJobDay

		from
			(
				-- get the ScheduledJobDays for the most recent

			)


		-- get the date of the previous service of the new ScheduledJobs
		select
			JobID,
			max (ScheduledJobs.ScheduleDate) as LastScheduled

		from
			ScheduledJobs,
			(
				-- get the ScheduledJobs that have no ScheduledJobDays
				select JobID, ScheduledJobID
				from ScheduledJobs
				where
				(
					-- there are no ScheduledJobDays for the ScheduledJob
					select count(*) = 0
					from ScheduledJobDays
					where ScheduledJobDays.ScheduledJobID != ScheduledJobs.ScheduledJobID
				)
			) as newScheduledJobs

		where ScheduledJobs.JobID = newScheduledJobs.JobID

		group by JobID;


end //

delimiter ;
