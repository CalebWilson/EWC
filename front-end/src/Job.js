import React, { Component } from "react";
import "./Job.css";

import Uplink from "./Uplink";

export default class Job extends Component
{
	edit_service = () =>
	{
		Uplink.get_data ("scheduled_job/" + this.props.scheduled_job_id)

		.then ((data) =>
		{
			this.props.edit_service (data.data);
		});
	}

	render()
	{
		const { job_name, service_type, final_price} = this.props;

		//job name on the left, service type and price on the right
		return (
			<div>
				<div className="job" onClick={this.edit_service}>
					<div className="type-price">{service_type} {final_price}</div>
					<div className="job-name" >{job_name}</div>
				</div>
			</div>
		);
	}
}
