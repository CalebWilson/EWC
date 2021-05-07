import React, { Component } from "react";

import CloseButton from "./CloseButton";

import "./styles/indent.css";
import "./ScheduledJobModal.css";

export default class ScheduledJobModal extends Component
{
	render()
	{
		let scheduled_job = this.props.scheduled_job.data;

		let date_options =
		{
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric"
		};

		return (

			<div className="scheduled-job-modal">
				<div className="scheduled-job-modal-content">

					<CloseButton close={this.props.hide_details} />

					<div className="scheduled-job-name">{scheduled_job.JobName}</div>
					<br />
					<div>
						Days:
						<div className="indent">
						{
							scheduled_job.Days.map ((day) =>
							(
								<div>
									{
										new Intl.DateTimeFormat ("en-US", date_options)
											.format (new Date (day.Date))
									}
									<div className="indent">
									{
										day.Workers.map ((worker) =>
										(
											<div>{worker.WorkerName}</div>
										))
									}
									</div><br />
								</div>
							))
						}
						</div>

						Final Price: {scheduled_job.FinalPrice}

					</div>
				</div>
			</div>
		);
	}
}
