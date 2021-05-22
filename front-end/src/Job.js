import React, { Component } from "react";
import "./Job.css";

import Uplink from "./Uplink";
import Clickable from "./Clickable";

export default class Job extends Component
{
	edit_service = () =>
	{
		Uplink.get_data ("service/" + this.props.service_id)

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
			<div> <Clickable
				action={this.edit_service}
				content={
				(
					<div className="job">
						<div className="type-price">{service_type} {final_price}</div>
						<div className="job-name" >{job_name}</div>
					</div>
				)}
			/> </div>
		);
	}
}
