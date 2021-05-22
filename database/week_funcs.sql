select "week_funcs.sql";

use ewc;

/*
	Returns the number of weeks between the given dates.

	If date1 < date2, then weeks_between (date1, date2) >= 0.
	If date1 > date2, then weeks_between (date1, date2) <= 0.
*/
drop function if exists weeks_between; 

delimiter //

create function weeks_between (date1 date, date2 date) returns int deterministic
begin
	return
		52 * (year(date2) - year(date1))
		   + (week(date2) - week(date1))
	;
end //

delimiter ;

/*
	Returns the letter of the given week.
*/

drop function if exists week_letter; 

delimiter //

create function week_letter (week int) returns char(1) reads sql data
begin

	-- 0, 1, 2, or 3
	declare week_num int;

	set week_num =
	(
		select
			( week(curdate())  -- present week
			+ week             -- given week
			+ max(Offset)) % 4 -- offset for client's sake
		from WeekOffset
	);

	-- convert to char: A, B, C, or D
	return char (ascii('A') + week_num using utf8);

end //

delimiter ;
