use ewc;

drop view if exists ActiveJobs;

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
		ScheduledJobs.JobID = Jobs.JobID and
		Jobs.StatusID = Statuses.StatusID and
		Statuses.StatusName = "Active" and
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

end //

delimiter ;
