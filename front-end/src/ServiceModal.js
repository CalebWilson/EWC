import React, { Component } from "react";

import       Button from "./Button";
import RemoveButton from "./RemoveButton";

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
		this.state = (this.props.mode === "Add")
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
				editing_job: true,
				mode: this.props.mode
			}
		:
			//else, initialize from props
			{
				service: this.props.service,
				editing_job: false,
				mode: this.props.mode
			};
	}

	has_job_and_date = () =>
	{
		return (this.state.service.JobID && this.state.service.Days[0].Date);
	}


	sort_days = () =>
	{
		console.log ("Unsorted: " + JSON.stringify(this.state.service.Days));

		this.state.service.Days.sort
		(
			(day1, day2) => (day2.Date - day1.Date)
		);

		console.log ("  Sorted: " + JSON.stringify(this.state.service.Days));
	}


	create = () =>
	{
		let request_body =
		{
			JobID: this.state.service.JobID,
			ScheduleDate: this.state.service.Days[0].Date
		};

		Uplink.send_data ("scheduled_job", request_body)

		.then ((response) =>
		{
			if (response.error)
			{
				this.setState ((state) =>
				{
					state.service.Days[0].Date = null;
					state.duplicate_error = true;
					state.editing_day = 0;

					return state;
				});
			}

			else
			{
				this.setState
				({
					service: response.data,
					mode: "Edit",
					duplicate_error: false
				});
			}
		})
	}

	save = () =>
	{
		if (this.has_job_and_date())
		{
			if (this.state.mode === "Add")
			{
				this.create();
			}

			else
			{
				
			}

		}
	}

	//switch the job of the service to the selected option
	edit_job = (job_id, job_name) =>
	{
		this.setState ((state) =>
		{
			state.service.JobName = job_name;
			state.service.JobID   = job_id;

			state.editing_job     = false;
			state.duplicate_error = false;

			return state;
		});

		this.save();
	}

	//add new day to service
	add_day = () =>
	{
		this.setState ((state) =>
		{
			//add a day to the Days array with the same workers as the previous day
			state.service.Days = state.service.Days.concat (
			{
				Date: "",
				Workers: state.service.Days[state.service.Days.length - 1].Workers
			});

			console.log (state.service.Days.length);

			//edit last day
			state.editing_day = state.service.Days.length - 1;

			console.log (state.editing_day);

			return state;
		});
	}

	//remove a day from service
	remove_day = (day_index) =>
	{
		return (() =>
		{
			this.setState ((state) =>
			{
				state.service.Days.splice (day_index, 1);

				return state;
			});
		});
	}

	//edit the date of a day of a service
	edit_date = (day_index) =>
	{
		return ((edit) =>
		{
			//get the new date value
			this.setState ((state) =>
			{
				state.service.Days[day_index].Date =
					edit.target.value + "T00:00:00.000"	//reset timestamp to local
				;

				//stop editing
				state.editing_day = null;

				return state;
			});

			//editing first date updates the rest
			if (day_index === 0)
			{
				this.save();
			}
		});
	}

	//remove a worker from a service
	remove_worker = (day_index, worker_index) =>
	{
		return (() =>
		{
			//remove the given worker from the given Day
			this.setState ((state) =>
			{
				state.service.Days[day_index].Workers.splice (worker_index, 1);
				
				return state;
			});
		});
	}

	render()
	{
		return (

			<div className="service-modal">
				<div className="service-modal-content">

					<div className="service-modal-top">
						<div>{this.state.mode} Service</div>
						<Button
							label="X"
							action={this.props.close_service()}
							className="close"
						/>
					</div>


					{/* scrollable */}
					<div className="service-modal-inner">

					{
						this.state.duplicate_error
						?
							this.state.service.JobName
							+ " already has a Service scheduled for this date."
						:
							<div></div>
					}

						{/* job name */}
						{
							this.state.editing_job
							?
								<div>
									{/* edit */}
									<JobDropdown
										size="x-large"
										default={this.state.service.JobID}
										select_option={this.edit_job}
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
											this.setState ({ editing_job: true });
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
											<div className="remove-row">

												{// remove day
													day_index > 0
													?
														<RemoveButton
															remove={this.remove_day (day_index)}
														/>
													:
														<button className="remove">=</button>
												}

												<span className="remove-spacer"></span>

												{ //edit date
													day_index === this.state.editing_day
													?
														<input
															type="date"
															style={{fontSize: "large"}}
															value={
																day.Date ?
																	day.Date.toString()
																	.substr(0, 10)
																: null
															}
															onChange={
																this.edit_date (day_index)
															}
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
													<div className="remove-row">
														<RemoveButton
															remove=
															{
																this.remove_worker (
																	day_index, worker_index
																)
															}
														/>
														<span className="remove-spacer"></span>
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
									action={this.add_day}
								/><br />
								<br />
							</div>
						</div>

						Final Price: {this.state.service.FinalPrice}

					</div>

					<div className="service-modal-bottom">
						<Button
							label="Save"
							action={this.props.close_service (true)}
						/>
					</div>

				</div>
			</div>
		);
	}
}
