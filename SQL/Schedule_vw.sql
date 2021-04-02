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
	select *
	from WeekWork as outside
	where
	(
		select count(*) = 1
		from WeekWork as inside
		where outside.Job = inside.Job
	)
;

drop view if exists GroupWork;

create view GroupWork
as
	select *
	from WeekWork as outside
	where
	(
		select count(*) > 1
		from WeekWork as inside
		where outside.Job = inside.Job
	)
;
