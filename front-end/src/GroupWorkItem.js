import React, { Component } from "react";
import "./styles/WorkItem.css";

import Job from "./Job";

export default class GroupWorkItem extends Component
{
	render()
	{
		const job = this.props.job;

		return (

			<div>
				<Job
					key={job.ServiceID}
					service_id={job.ServiceID}
					job_name={job.JobName}
					service_type={job.ServiceType}
					final_price={job.FinalPrice}
					edit_service={this.props.edit_service}
				/>
				Workers:
				<div className="indent">
				{
					job.Workers.map ((worker) =>
					(
						<div key={worker.WorkerID}>{worker.WorkerName}<br/></div>
					))
				}
				</div>
				<br/>
			</div>
		);
	}
}
