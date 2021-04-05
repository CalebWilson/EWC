/*
	Returns the number of weeks between the given dates.

	If date1 < date2, then weeks_between (date1, date2) >= 0.
	If date1 > date2, then weeks_between (date1, date2) <= 0.
*/


use ewc;

drop function if exists weeks_between; 

delimiter //

create function weeks_between (date1 date, date2 date) returns int deterministic
begin
	return
		52 * (year(date2) - year(date1))
		   + (week(date2) - week(date1))
	;
end//

delimiter ;
