use ewc;

/*
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

*/

	-- create ScheduledJobDays for the ScheduledJobs that don't have any yet
	insert into ScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select ScheduledJobs.ScheduledJobID, previousScheduledJobDays.ScheduledJobDay
		from
			ScheduledJobs,
			(
				/*
					get the ScheduledJobDays for the previous services of the Jobs with
					ScheduledJobs that have no ScheduledJobDays
				*/
				select previousServices.JobID, ScheduledJobDay
				from
					ScheduledJobDays,
					(
						-- get the previous service of the new ScheduledJobs
						select distinct ScheduledJobs.ScheduledJobID, ScheduledJobs.JobID

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
									where ScheduledJobDays.ScheduledJobID
							    		= ScheduledJobs.ScheduledJobID
								)
							) as newScheduledJobs

						where
							ScheduledJobs.JobID = newScheduledJobs.JobID and
							(
								-- there are ScheduledJobDays for the ScheduledJob
								select count(*) > 0
								from ScheduledJobDays
								where ScheduledJobDays.ScheduledJobID = ScheduledJobs.ScheduledJobID
							)
					) as previousServices

				where
					ScheduledJobDays.ScheduledJobID = previousServices.ScheduledJobID
			)
				as previousScheduledJobDays
		where
			ScheduledJobs.JobID = previousScheduledJobDays.JobID and
         (
				-- there are no ScheduledJobDays for the ScheduledJob
				select count(*) = 0
				from ScheduledJobDays
				where ScheduledJobDays.ScheduledJobID = ScheduledJobs.ScheduledJobID
			)

		order by ScheduledJobs.ScheduledJobID
		;
/*


end //

delimiter ;
*/
