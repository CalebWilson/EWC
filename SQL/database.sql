use ewc;

drop table if exists Assignments;
drop table if exists ScheduledJobDays;
drop table if exists ScheduledJobs;
drop table if exists Workers;
drop table if exists Jobs;
drop table if exists Accounts;

drop table if exists Statuses;
drop table if exists InvoiceProcs;
drop table if exists ServiceTypes;


source     ServiceTypes.sql;
source     InvoiceProcs.sql;
source         Statuses.sql;

source         Accounts.sql;
source             Jobs.sql;
source          Workers.sql;
source    ScheduledJobs.sql;
source ScheduledJobDays.sql;
source      Assignments.sql;

source test_data.sql;
