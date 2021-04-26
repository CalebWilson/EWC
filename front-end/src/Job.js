import React, { Component } from "react";
import "./Job.css";

export default class Job extends Component
{
	render()
	{
		const { job_name, service_type, final_price} = this.props;

		return (

		<div className="flex-row">
			<div>{job_name}</div>
			<div style={{paddingLeft:"10px"}}>{service_type} {final_price}</div><br/>
		</div>
		);
	}
}
