import React, { Component } from "react";
import "./styles/Job.css";

import Uplink from "./Uplink";
import Clickable from "./Clickable";

import Checkbox from "./Checkbox";
import ServiceCompleteCheckbox from "./ServiceCompleteCheckbox";

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
		const { service_id, job_name, service_type, final_price } = this.props;

		//job name on the left, service type and price on the right
		return (
			<div className="job-container">

				{/* job name and info */}
				<Clickable
					action={this.edit_service}
					content={
					(
						<div className="job">

							{/* service type and final price */}
							<div className="job-info">{service_type} {final_price}</div>
							<div className="job-name" >{job_name}</div>
						</div>
					)}
				/>

				{/* complete checkbox*/}
				<ServiceCompleteCheckbox
					service_id={service_id}
					label=""
					is_complete={this.props.is_complete}
					sync_complete={this.props.sync_complete}
				/>

			 </div>
		);
	}
}
