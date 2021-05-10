import React, { Component } from "react";

import       Button from "./Button";
import  CloseButton from "./CloseButton";
import DeleteButton from "./DeleteButton";

import JobDropdown from "./JobDropdown";

import "./styles/indent.css";
import "./ServiceModal.css";

export default class ServiceModal extends Component
{
	constructor (props)
	{
		super (props);

		//if new service, start in edit mode with empty service
		this.state = (this.props.mode == "Add")
		?
			{
				service: { Days: [] },
				editing_job_name: true
			}
		:
			//else, initialize from props
			{
				service: this.props.service,
				editing_job_name: false
			};
	}

	delete_day = (day_index) =>
	{
		return (() =>
		{
			this.state.service.Days.splice (day_index, 1);
			this.forceUpdate();
		});
	}

	delete_worker = (day_index, worker_index) =>
	{
		return (() =>
		{
			this.state.service.Days[day_index].Workers.splice (worker_index, 1);
			this.forceUpdate();
		});
	}

	render()
	{
		let date_options =
		{
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric"
		};

		return (

			<div className="service-modal">
				<div className="service-modal-content">
					<div className="service-modal-top">
						<div>{this.props.mode} Service</div>
						<Button
							label="X"
							action={this.props.hide_details}
							className="close"
						/>
					</div>

					{
						this.state.editing_job_name
						?
							<div>
								<JobDropdown
									size="x-large"
									default={this.state.service.JobID}
									select_option={(job_id, job_name) =>
									{
										this.state.service.JobName = job_name;
										this.state.service.JobID   = job_id;

										this.setState ({ editing_job_name: false });
									}}
								/>
							</div>
						:
							<div className="service-name">
								<div>Job: {this.state.service.JobName}</div>
								<Button
									label="Change"
									action={() =>
									{
										this.setState ({ editing_job_name: true });
									}}
								/>
							</div>
					}

					<br />
					<div>
						Days:
						<div className="indent">
						{
							//days and workers
							this.state.service.Days.map ((day, day_index) =>
							(
								<div>

									{/* date */}
									<DeleteButton delete={this.delete_day (day_index)} />
									{
										new Intl.DateTimeFormat ("en-US", date_options)
											.format (new Date (day.Date))
									}

									{/* workers */}
									<div className="indent">
									{
										day.Workers.map ((worker, worker_index) =>
										(
											<div>
												<DeleteButton
													delete=
													{
														this.delete_worker (
															day_index, worker_index
														)
													}
												/>
												{worker.WorkerName}
											</div>
										))
									}
									</div><br />

								</div>
							))
						}
						</div>

						Final Price: {this.state.service.FinalPrice}

					</div>
				</div>
			</div>
		);
	}
}
