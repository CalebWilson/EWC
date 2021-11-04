import React, { Component } from "react";
import "./styles/WorkItem.css";

import Job from "./Job";

export default class IndividualWorkItem extends Component
{
	render()
	{
		const worker_day = this.props.worker_day;

		return (

			<div>
				{worker_day.WorkerName}<br/>

				Jobs:
				<div className="indent">
				{
					worker_day.Jobs.map ((job) =>
					(
						<Job
							key={job.ServiceID}
							service_id={job.ServiceID}
							job_name={job.JobName}
							service_type={job.ServiceType}
							final_price={job.FinalPrice}
							is_complete={job.Complete}
							edit_service={this.props.edit_service}
							sync_complete={this.props.sync_complete}
						/>
					))
				}
				</div><br/>

			</div>
		);
	}
}
