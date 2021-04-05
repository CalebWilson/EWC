use ewc;

drop procedure if exists Recur;

delimiter //

create procedure Recur (in Week int)
begin

	insert into ScheduledJobs (JobID, ScheduleDate)
		select JobID, LastScheduled + ServiceInterval
		from Jobs
		where 
