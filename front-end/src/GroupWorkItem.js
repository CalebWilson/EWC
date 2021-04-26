import React, { Component } from "react";
import "./WorkItem.css";

import Job from "./Job";

export default class GroupWorkItem extends Component
{
	render()
	{
		const job = this.props.job;

		return (

			<div>
				<Job
					key={job.ScheduledJobID}
					job_name={job.JobName}
					service_type={job.ServiceType}
					final_price={job.FinalPrice}
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
