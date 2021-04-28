import React, { Component } from "react";
import "./Job.css";

export default class Job extends Component
{
	show_details = () =>
	{
		this.props.show_details(this.props);
	}

	render()
	{
		const { job_name, service_type, final_price} = this.props;

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
