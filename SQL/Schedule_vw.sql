use ewc;

drop view if exists Schedule;
drop view if exists WeekWork;

create view WeekWork
as
	select
			weeks_between (
				curdate(),
				ScheduledJobs.ScheduleDate + interval ScheduledJobDays.ScheduledJobDay day
			)
			as Week,
		weekday(ScheduledJobs.ScheduleDate + interval ScheduledJobDays.ScheduledJobDay day)
			as Day,
		ScheduledJobs.ScheduleDate + interval ScheduledJobDays.ScheduledJobDay day
			as "Date",
		Jobs.JobName as Job,
		Workers.Workername as Worker
	from Jobs, ScheduledJobs, ScheduledJobDays, Assignments, Workers
	where
		Jobs.JobID = ScheduledJobs.JobID and
		ScheduledJobs.ScheduledJobID = ScheduledJobDays.ScheduledJobID and
		ScheduledJobDays.ScheduledJobDayID = Assignments.ScheduledJobDayID and
		Assignments.WorkerID = Workers.WorkerID
;

drop view if exists IndividualWork;

create view IndividualWork
as
	select *
	from WeekWork as outside
	where
	(
		select count(*) = 0
		from WeekWork as inside
		where
			outside.Job     = inside.Job and
			outside.Worker != inside.Worker
	)
;

drop view if exists GroupWork;

create view GroupWork
as
	select *
	from WeekWork as outside
	where
	(
		select count(*) > 0
		from WeekWork as inside
		where
			outside.Job     = inside.Job and
			outside.Worker != inside.Worker
	)
;
