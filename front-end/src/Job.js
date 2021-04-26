import React, { Component } from "react";
import "./Job.css";

export default class Job extends Component
{
	render()
	{
		const { job_name, service_type, final_price} = this.props;

		return (

		<div>
			<div className="flex-row">
				<div className="right-item">{service_type} {final_price}</div>
				<div className="left-item" >{job_name}</div>
			</div><br/>
		</div>
		);
	}
}
