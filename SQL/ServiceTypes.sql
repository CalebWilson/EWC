use ewc;

drop table if exists ServiceTypes;

-- Invoice Procedures
create table ServiceTypes
(
	ServiceTypeID           int NOT NULL AUTO_INCREMENT,
	ServiceTypeName varchar(10) NOT NULL,

	PRIMARY KEY (ServiceTypeID)
);

insert into ServiceTypes (ServiceTypeName) values ("IN"), ("OUT"), ("IN/OUT");

select * from ServiceTypes;
