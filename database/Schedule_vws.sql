select "Schedule_vws.sql";

use ewc;

drop view if exists WeekWork;

-- get all work assignments and their date information
create view WeekWork
as
	select
		-- week relative to current week
		weeks_between (
			curdate(),
			plus_work_days (Services.ServiceDate, ServiceDays.ServiceDay)
		)
			as Week,

		-- numeric day of the week that the work falls on
		weekday (plus_work_days (Services.ServiceDate, ServiceDays.ServiceDay))
			as Day,

		-- whether the Job Day is the first
		ServiceDays.ServiceDay = 0
			as FirstDay,

		-- date that the work falls on
		plus_work_days (Services.ServiceDate, ServiceDays.ServiceDay)
			as "Date",

		-- Job and Worker info
		Jobs.JobName
			as JobName,
		Jobs.JobID
			as JobID,
		ServiceTypes.ServiceType
			as ServiceType,
		Services.FinalPrice
			as FinalPrice,
		Services.Complete
			as Complete,
		Workers.WorkerName
			as WorkerName,
		WorkerStatuses.StatusName
			as WorkerStatus,

		-- Primary keys for front-end reference
		Services.ServiceID
			as ServiceID,
		ServiceDays.ServiceDayID
			as ServiceDayID,
		Workers.WorkerID
			as WorkerID

	from
		Jobs,
		Services,
		ServiceDays,
		Assignments,
		Workers,
		ServiceTypes,
		Statuses as WorkerStatuses

	where
		Jobs.JobID               = Services.JobID             and
		Services.ServiceID       = ServiceDays.ServiceID      and
		ServiceDays.ServiceDayID = Assignments.ServiceDayID   and
		Assignments.WorkerID     = Workers.WorkerID           and
		Jobs.ServiceTypeID       = ServiceTypes.ServiceTypeID and
		Workers.StatusID         = WorkerStatuses.StatusID
	
	order by Week, Day, JobName
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
