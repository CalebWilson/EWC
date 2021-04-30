import React, { Component } from "react";
import "./Job.css";

import get_data from "./get_data";

export default class Job extends Component
{
	show_details = () =>
	{
		get_data ("scheduled_job/" + this.props.scheduled_job_id)

		.then ((data) =>
		{
			this.props.show_details (data);
		});
	}

	render()
	{
		const { job_name, service_type, final_price} = this.props;

		//job name on the left, service type and price on the right
		return (
			<div>
				<div className="flex-row" onClick={this.show_details}>
					<div className="right-item">{service_type} {final_price}</div>
					<div className="left-item" >{job_name}</div>
				</div>
			</div>
		);
	}
}
