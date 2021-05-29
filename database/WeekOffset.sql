select "WeekOffset.sql";

use ewc;

/*
	Hold the week offset to be used in the function week_letter().
*/

drop table if exists WeekOffset;

create table WeekOffset
(
	Offset tinyint not null primary key,

	check (Offset >= 0),
	check (Offset <  4)
);

/*
	Block inserts for WeekOffset
*/

drop trigger if exists BlockWeekOffsetInsert;

delimiter //

create trigger BlockWeekOffsetInsert before insert on WeekOffset
for each row
begin

	-- if there is already an entry
	if (select count(*) > 0 from WeekOffset)
	then
		-- block the insert
		signal sqlstate "45000";
	end if;

end //

delimiter ;

/*
	Block deletes for WeekOffset
*/

drop trigger if exists BlockWeekOffsetDelete;

create trigger BlockWeekOffsetDelete before delete on WeekOffset
for each row
begin

	-- block the delete
	signal sqlstate "45000";

end //

delimiter ;
