use ewc;

drop view if exists ActiveJobs;

-- get the Intervals and LastScheduled date from the active recurring jobs
create view ActiveJobs
as

	group by JobID

;

drop procedure if exists Recur;

delimiter //

create procedure Recur (in Week int)
begin

	-- ScheduledJobs created during this procedure
	create temporary table newScheduledJobs
	(
		JobID         int not null,
		ScheduleDate date not null, 

		foreign key (JobID) references Jobs (JobID)
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
		)

		-- in the given week
		where
			weeks_between (LastScheduled, curdate() + interval Week week)
			% ServiceInterval
			= 0
	;

	-- schedule the recurrences
	insert into ScheduledJobs (JobID, ScheduleDate)
		select JobID, ScheduleDate
		from newScheduledJobs
	;



	-- create ScheduledJobDays for the ScheduledJobs that don't have any yet
	insert into ScheduledJobDays (ScheduledJobID, ScheduledJobDay)
		select ScheduledJobs.ScheduledJobID, previousScheduledJobDays.ScheduledJobDay
		from
			newScheduledJobs,
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
						select distinct
							ScheduledJobs.ScheduledJobID,
							ScheduledJobs.JobID

						from ScheduledJobs, newScheduledJobs

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
*/

	-- create Assignments for the ScheduledJobs that don't have any yet

/*


end //

delimiter ;
*/
