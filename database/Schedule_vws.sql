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

		-- whether the Job Day is the first
		ScheduledJobDays.ScheduledJobDay = 0
			as FirstDay,

		-- date that the work falls on
		ScheduledJobs.ScheduleDate + interval ScheduledJobDays.ScheduledJobDay day
			as "Date",

		-- Job and Worker info
		Jobs.JobName
			as JobName,
		ServiceTypes.ServiceType
			as ServiceType,
		ScheduledJobs.FinalPrice
			as FinalPrice,
		ScheduledJobs.Complete
			as Complete,
		Workers.WorkerName
			as WorkerName,
		WorkerStatuses.StatusName
			as WorkerStatus,

		-- Primary keys for front-end reference
		Workers.WorkerID
			as WorkerID,
		ScheduledJobs.ScheduledJobID
			as ScheduledJobID,
		ScheduledJobDays.ScheduledJobDayID
			as ScheduledJobDayID

	from
		Jobs,
		ScheduledJobs,
		ScheduledJobDays,
		Assignments,
		Workers,
		ServiceTypes,
		Statuses as WorkerStatuses

	where
		Jobs.JobID                         = ScheduledJobs.JobID             and
		ScheduledJobs.ScheduledJobID       = ScheduledJobDays.ScheduledJobID and
		ScheduledJobDays.ScheduledJobDayID = Assignments.ScheduledJobDayID   and
		Assignments.WorkerID               = Workers.WorkerID                and
		Jobs.ServiceTypeID                 = ServiceTypes.ServiceTypeID      and
		Workers.StatusID                   = WorkerStatuses.StatusID
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
			outside.JobName     = inside.JobName and
			outside.WorkerName != inside.WorkerName
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
			outside.JobName     = inside.JobName and
			outside.WorkerName != inside.WorkerName
	)
;
