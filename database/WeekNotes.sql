select "WeekNotes.sql";

use ewc;

drop table if exists WeekNotes;

-- Notes for each week
create table WeekNotes
(
	WeekNoteID int not null auto_increment,

	WeekOf  date not null, -- the Monday of the week the notes are for
	Content text not null,

	unique (WeekOf),

	primary key (WeekNoteID)
);

show warnings;

-- test
insert into
	WeekNotes (                                           WeekOf,                    Content)
	values    (date(curdate() - interval weekday(curdate()) day), 'Test notes from database')
;

select * from WeekNotes;


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
