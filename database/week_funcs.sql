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
	Throw error if the given date is not a work day.
*/
drop function if exists assert_is_work_day;

delimiter //

create function assert_is_work_day (my_date date) returns int deterministic
begin
	
	if (weekday (my_date) > 4)
	then
		signal sqlstate "45000";
	end if;

	return 1;
		
end //

delimiter ;


/*
	The number of work days between two work days. Same sign as weeks_between.
*/

drop function if exists work_days_between;

delimiter //

create function work_days_between (date1 date, date2 date)
		returns int deterministic
begin

	return datediff (date2, date1) - (2 * weeks_between (date1, date2));

end //

delimiter ;

drop function if exists plus_work_days;

delimiter //

create function plus_work_days (first_date date, day_num int)
		returns date deterministic
begin

	set day_num = day_num + weekday (first_date);

	return first_date
		- interval weekday (first_date) day
		+ interval      (day_num div 5) week
		+ interval      (day_num   % 5) day
	;

end //

delimiter ;


/*
	The letter of the given week: A, B, C, or D.
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
