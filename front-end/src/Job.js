import React, { Component } from "react";
//import "./WorkItem.css";

export default class Job extends Component
{
	render()
	{
		const { job_name, service_type, final_price} = this.props;

		return (

		<div>
			<div>{job_name}</div><div>{service_type} {final_price}</div><br/>
		</div>
		);
	}
}
