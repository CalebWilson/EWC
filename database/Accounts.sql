select "Accounts.sql";

use ewc;

drop table if exists Accounts;

-- Accounts that have hired EWC
create table Accounts
(
	AccountID int NOT NULL AUTO_INCREMENT,

	AccountName    varchar(  50) NOT NULL,
	AccountPhone      char(  10),
	AccountAddress varchar( 150) NOT NULL,
	AccountNotes   varchar(1000),

	UNIQUE (AccountName),

	PRIMARY KEY (AccountID)
);

show warnings;

/*
-- test
insert into
	Accounts (AccountName,  AccountPhone,                  AccountAddress)
	values  (      "Test",  "3175555555",  "000 Street St. Town IN 00000")
;
*/

select * from Accounts;
