import React, { Component } from "react";

import       Button from "./Button";
import DeleteButton from "./DeleteButton";

import JobDropdown from "./JobDropdown";

import Uplink from "./Uplink";

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
				service:
				{
					JobID: null,
					Days:
					[{
						Date: "",
						Workers: []
					}]
				},
				editing_day: 0,
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

	create = () =>
	{
		console.log (this.state.service);

		Uplink.send_data ("scheduled_job", this.state.service);
	}

	correct_date = (old_date) =>
	{
		let new_date = new Date (old_date);

		new_date.setDate (new_date.getDate() + 1);

		return new_date;
	}


	render()
	{

/*
console.log ("2021-05-05");
console.log (new Date ("2021-05-05"));
*/

		return (

			<div className="service-modal">
				<div className="service-modal-content">

					<div className="service-modal-top">
						<div>{this.props.mode} Service</div>
						<Button
							label="X"
							action={this.props.close_service}
							className="close"
						/>
					</div>

					{/* scrollable */}
					<div className="service-modal-inner">

						{/* job name */}
						{
							this.state.editing_job_name
							?
								<div>
									{/* edit */}
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
									<br />
									<br />
								</div>
							:
								<div>
									{/* view */}
									<div>Job: {this.state.service.JobName}</div>
									<div>
									<Button
										label="Change"
										action={() =>
										{
											this.setState ({ editing_job_name: true });
										}}
									/>
									</div>
								</div>
						}
						<br/>

						{/* days and workers */}
						<div>
							Days:
							<div className="indent">
								{
									this.state.service.Days.map ((day, day_index) =>
									(
										<div>
											<div className="delete-row">

												{// delete day
													day_index > 0
													?
														<DeleteButton
															delete={this.delete_day (day_index)}
														/>
													:
														<button className="delete">=</button>
												}

												<span className="delete-spacer"></span>

												{ //edit date
													day_index === this.state.editing_day
													?
														<input
															type="date"
															style={{fontSize: "large"}}
															value={
																day.Date.toString().substr(0, 10)
															}
															onChange={(change) =>
															{
																//get the new date value
																//reset timestamp to local
																this.state.service
																		.Days[day_index].Date =
																	change.target.value +
																	"T00:00:00.000"
																;

																this.setState (
																	{ editing_day: null }
																);
															}}
														/>
													:
														<span
															style={{cursor: "pointer"}}
															onClick={() =>
															{
																this.setState (
																	{ editing_day: day_index }
																);
															}}
														>
														{ //view date
															new Intl.DateTimeFormat (
																	"en-US",
																	{
																		weekday: "long",
																		month: "long",
																		day: "numeric",
																		year: "numeric"
																	}
															)
																.format (new Date (day.Date))

														}
														</span>
												}
											</div>

											{/* workers */}
											<div className="indent">
											{
												day.Workers.map ((worker, worker_index) =>
												(
													<div className="delete-row">
														<DeleteButton
															delete=
															{
																this.delete_worker (
																	day_index, worker_index
																)
															}
														/>
														<span className="delete-spacer"></span>
														{worker.WorkerName}
													</div>
												))
											}
											</div><br />

										</div>
									))
								}

								<Button
									label="Continue service to another day"
									action={() =>
									{
										this.setState
										({
											editing_day: this.state.service.Days.length - 1
										});
									}}
								/><br />
								<br />
							</div>
						</div>

						Final Price: {this.state.service.FinalPrice}

					</div>

					<div className="service-modal-bottom">
						<Button label="Save" action={this.create} />
					</div>

				</div>
			</div>
		);
	}
}
