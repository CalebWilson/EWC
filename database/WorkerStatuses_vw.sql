select "WorkerStatuses.sql";

use ewc;

drop view if exists WorkerStatuses;

create view WorkerStatuses
as
	select
		WorkerID,
		Username,
		WorkerName,
		WorkerPhone,
		Email,
		Address,
		HiredDate,
		TerminationDate,
		StatusName
			as Status

	from Workers, Statuses

	where Workers.StatusID = Statuses.StatusID
;
