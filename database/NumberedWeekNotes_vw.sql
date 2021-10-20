select "NumberedWeekNotes.sql";

use ewc;

drop view if exists NumberedWeekNotes;

-- get each week's notes along with their week numbers
create view NumberedWeekNotes
as
	select
		weeks_between (curdate(), WeekOf) as Week,
		Content
	from WeekNotes
;

select * from NumberedWeekNotes;
