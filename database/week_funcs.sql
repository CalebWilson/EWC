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

create function week_letter (week int) returns char(1)
begin
	declare week_num;

	set week_num = (week(curdate()) + week) % 4;
