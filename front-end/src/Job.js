import React, { Component } from "react";
//import "./WorkItem.css";

export default class Job extends Component
{
	render()
	{
		const { job_name, service_type, final_price} = this.props;

		return (

		<div>
			{job_name} {service_type} {final_price}<br/>
		</div>
		);
	}
}
