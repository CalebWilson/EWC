select "database.sql";

use ewc;

-- functions and procedures, and views
drop procedure if exists GenerateWeek;
drop procedure if exists CreateService;
drop procedure if exists RenewServiceData;
drop      view if exists GroupWork;
drop      view if exists IndividualWork;
drop      view if exists WeekWork;
drop      view if exists NumberedWeekNotes;
drop      view if exists WorkerStatuses;
drop  function if exists week_letter;
drop  function if exists plus_work_days;
drop  function if exists assert_is_work_day;
drop  function if exists work_days_between;
drop  function if exists weeks_between;

-- dynamic tables
drop table if exists WeekNotes;
drop table if exists Assignments;
drop table if exists ServiceDays;
drop table if exists Services;
drop table if exists Workers;
drop table if exists Jobs;
drop table if exists Accounts;

-- constant tables
drop table if exists Statuses;
drop table if exists InvoiceProcs;
drop table if exists ServiceTypes;

-- temporary tables
drop table if exists newServices;
drop table if exists newScheduledJobs;


-- constant tables
source ServiceTypes.sql;
source InvoiceProcs.sql;
source     Statuses.sql;

-- dynamic tables
source    Accounts.sql;
source        Jobs.sql;
source     Workers.sql;
source    Services.sql;
source ServiceDays.sql;
source Assignments.sql;
source   WeekNotes.sql;

-- functions, procedures, and views
source           week_funcs.sql;
source         Schedule_vws.sql;
source    WorkerStatuses_vw.sql;
source NumberedWeekNotes_vw.sql;
source       Schedule_procs.sql;

-- test data
source test_data.sql;
