use ewc;

drop view if exists WeekWork;

-- get all work assignments and their date information
create view WeekWork
as
	select
		-- week relative to current week
		weeks_between (
			curdate(),
			ScheduledJobs.ScheduleDate
			+ interval ScheduledJobDays.ScheduledJobDay day
		)
			as Week,

		-- numeric day of the week that the work falls on
		weekday (
			ScheduledJobs.ScheduleDate
			+ interval ScheduledJobDays.ScheduledJobDay day
		)
			as Day,

		-- date that the work falls on
		ScheduledJobs.ScheduleDate + interval ScheduledJobDays.ScheduledJobDay day
			as "Date",

		-- names of Job and Worker
		Jobs.JobName
			as Job,
		Workers.Workername
			as Worker

	from Jobs, ScheduledJobs, ScheduledJobDays, Assignments, Workers

	where
		Jobs.JobID                         = ScheduledJobs.JobID             and
		ScheduledJobs.ScheduledJobID       = ScheduledJobDays.ScheduledJobID and
		ScheduledJobDays.ScheduledJobDayID = Assignments.ScheduledJobDayID   and
		Assignments.WorkerID               = Workers.WorkerID
;

drop view if exists IndividualWork;

-- extract from WeekWork Jobs assigned to lone Workers
create view IndividualWork
as
	select *
	from WeekWork as outside
	where
	(
		-- there are no jobs assigned to multiple different workers
		select count(*) = 0
		from WeekWork as inside
		where
			outside.Job     = inside.Job and
			outside.Worker != inside.Worker
	)
;

drop view if exists GroupWork;

-- extract from WeekWork Jobs assigned to multiple Workers
create view GroupWork
as
	select *
	from WeekWork as outside
	where
	(
		-- there are some jobs assigned to multiple different workers
		select count(*) > 0
		from WeekWork as inside
		where
			outside.Job     = inside.Job and
			outside.Worker != inside.Worker
	)
;
