use ewc;

-- functions and procedures, and views
drop procedure Recur;
drop      view ActiveJobs;
drop      view GroupWork;
drop      view IndividualWork;
drop      view WeekWork;
drop  function weeks_between;

-- dynamic tables
drop table if exists Assignments;
drop table if exists ScheduledJobDays;
drop table if exists ScheduledJobs;
drop table if exists Workers;
drop table if exists Jobs;
drop table if exists Accounts;

-- constant tables
drop table if exists Statuses;
drop table if exists InvoiceProcs;
drop table if exists ServiceTypes;


-- constant tables
source ServiceTypes.sql;
source InvoiceProcs.sql;
source     Statuses.sql;

-- dynamic tables
source         Accounts.sql;
source             Jobs.sql;
source          Workers.sql;
source    ScheduledJobs.sql;
source ScheduledJobDays.sql;
source      Assignments.sql;

-- functions, procedures, and views
source weeks_between_func.sql;
source       Schedule_vws.sql;
source Recurrence_proc_vw.sql;

-- test data
source test_data.sql;
