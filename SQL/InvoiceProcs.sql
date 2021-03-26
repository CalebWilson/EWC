use ewc;

drop table if exists InvoiceProcs;

-- Invoice Procedures
create table InvoiceProcs
(
	InvoiceProcID           int NOT NULL AUTO_INCREMENT,
	InvoiceProcName varchar(10) NOT NULL,

	PRIMARY KEY (InvoiceProcID)
);

insert into
	InvoiceProcs (InvoiceProcName)
	values       (       "C.O.D."),
	             (       "Net 30")
;

select * from InvoiceProcs;
