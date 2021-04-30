import React, { Component } from "react";
import "./WorkItem.css";

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
							key={job.ScheduledJobID}
							scheduled_job_id={job.ScheduledJobID}
							job_name={job.JobName}
							service_type={job.ServiceType}
							final_price={job.FinalPrice}
							show_details={this.props.show_details}
						/>
					))
				}
				</div><br/>

			</div>
		);
	}
}
