use ewc;

drop view if exists Schedule;
drop view if exists WeekWork;

create view WeekWork
as
	select
      52 * (year(ScheduledJobs.ScheduleDate) - year(curdate()))
		   + (week(ScheduledJobs.ScheduleDate) - week(curdate())) as Week,
		dayname(ScheduledJobs.ScheduleDate) as Day,
		ScheduledJobs.ScheduleDate as "Date",
		Jobs.JobName as Job,
		Workers.Workername as Worker
	from ScheduledJobs, Jobs, Assignments, Workers
	where
		ScheduledJobs.JobID = Jobs.JobID and
		Assignments.ScheduledJobID = ScheduledJobs.ScheduledJobID and
		Assignments.WorkerID = Workers.WorkerID
;

drop view if exists IndividualWork;

create view IndividualWork
as
	select Week, Day, Worker, Job
	from WeekWork
	where
	(
		select count(*) = 1
		from WeekWork as ww
		where ww.Worker = WeekWork.Worker
	)
;

create view GroupWork
as
	select Week, Day, Job, Worker
	from WeekWork
	where
	(
		select count(*) > 1
		from WeekWork as ww
		where ww.Worker = WeekWork.Worker
	)
;
