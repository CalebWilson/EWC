import React, { Component } from "react";

import         Button from "./Button";
import     BulletList from "./BulletList";
//import     BulletItem from "./BulletList";
import      Clickable from "./Clickable";

import    JobDropdown from "./JobDropdown";
import WorkerDropdown from "./WorkerDropdown";

import Uplink from "./Uplink";

import "./styles/indent.css";
import "./styles/ServiceModal.css";

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
			}
		;

		this.setState ((state) =>
		{
			state.service.Days = this.sort_days (state.service.Days);

			return state;
		});
	}

	//add escape listener
	componentDidMount()
	{
		document.addEventListener
		(
			"keydown",

			(key_down) =>
			{
				switch (key_down.key)
				{
					//if the user presses escape, hide service info
					case "Escape":
						this.props.close_service();
						break;

					//if the user presses space, submit data
					case " ":
						this.save (true);
						break;

					//get rid of compiler warning
					default:
						break;
				}
			},

			false
		);
	}

	has_job_and_date = () =>
	{
		return (this.state.service.JobID && this.state.service.Days[0].Date);
	}

	sort_days = (days) =>
	{
		days.sort
		(
			(day1, day2) =>
			{
				console.log (new Date (day1.Date) - new Date (day2.Date));
				return (new Date (day1.Date) - new Date (day2.Date));
			}
		);

		return days;
	}

	create = () =>
	{
		let request_body =
		{
			JobID: this.state.service.JobID,
			ServiceDate: this.state.service.Days[0].Date
		};

		Uplink.send_data ("service", "post", request_body)

		.then ((response) =>
		{
			if (response.error)
			{
				alert (JSON.stringify(response.error));
			}

			else if (response.data.errors && response.data.errors.length > 0)
			{
				this.setState ((state) =>
				{
					state.errors = response.data.errors;
					state.service.Days[0].Date = null;
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
					errors: []
				});
			}
		});
	}

	confirm_close = (response) =>
	{
		if (response.error)
		{
			alert (JSON.stringify(response.error));
		}

		else
		{
			//display errors, if any
			if (response.data.errors && response.data.errors.length > 0)
			{
				this.setState ({ errors: response.data.errors });
			}

			//if no errors, close
			else
			{
				this.props.close_service ();
			}
		}
	};

	update = (close) =>
	{
		const service = this.state.service;

		let request_body = 
		{
			ServiceID: service.ServiceID,
			JobID: service.JobID,
			FinalPrice: service.FinalPrice,
			Complete: service.Complete,
			Days: service.Days.map
			(
				(day) =>
				(
					{
						...day,
						Workers: day.Workers.map ((worker) => (worker.WorkerID))
					}
				)
			)
		};

		Uplink.send_data (
			"service/" + this.state.service.ServiceID, "patch", request_body
		)

		.then (this.confirm_close);
	}

	remove = () =>
	{
		Uplink.send_data ("service/" + this.state.service.ServiceID, "delete")

		.then (this.confirm_close);
	};

	save = (close) =>
	{
		if (this.has_job_and_date())
		{
			if (this.state.mode === "Add")
			{
				this.create();
			}

			else
			{
				this.update (close);
			}
		}
	}

	//switch the job of the service to the selected option
	edit_job = (job_id, job_name) =>
	{
		this.setState
		(
			(state) =>
			{
				state.service.JobName = job_name;
				state.service.JobID   = job_id;

				state.editing_job = false;

				state.duplicate_service_error = false;

				return state;
			},

			() => { this.save(); }
		);
	}

	//show the service job name or a dropdown to select it
	render_job = () =>
	(
		<div>
		{
			this.state.editing_job
			?
				<div>

					{/* edit job name */
						(this.state.mode === "Add")
						?
							<JobDropdown
								size="x-large"
								select_option={this.edit_job}
							/>
						:
							<JobDropdown
								size="x-large"
								select_option={this.edit_job}
								blank={null}
								default={this.state.service.JobID}
							/>
					}
					<br />
					<br />

				</div>
			:
				<div>

					{/* view job name */}
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

		</div>
	)


	//add new day to service
	add_day = () =>
	{
		if (!Number.isInteger (this.state.editing_day))
		{
			this.setState ((state) =>
			{
				//add a day to the Days array with the same workers as the previous day
				state.service.Days = state.service.Days.concat (
				{
					Date: "",
					Workers: state.service.Days[state.service.Days.length - 1].Workers
				});

				//edit last day
				state.editing_day = state.service.Days.length - 1;

				return state;
			});
		}
	}

	//remove a day from service
	remove_day = (day_index) =>
	{
		return (() =>
		{
			this.setState ((state) =>
			{
				state.service.Days.splice (day_index, 1);

				if (day_index === state.editing_day)
				{
					state.editing_day = false;
				}

				return state;
			});
		});
	}

	//edit the date of a day of a service
	edit_date = (day_index) =>
	{
		return ((edit) =>
		{
			//if date value is good
			if (edit.target.value)
			{
				//set the new date value
				this.setState
				(
					(state) =>
					{
						state.service.Days[day_index].Date =
							edit.target.value + "T00:00:00.000"	//reset timestamp to local
						;

						//stop editing
						state.editing_day = false;

						//sort days
						state.service.Days = this.sort_days (state.service.Days);

						return state;
					},

					//editing date in Add mode sav
					() =>
					{
						//if (day_index === 0)
						if (this.state.mode === "Add")
						{
							this.save();
						}
					}
				);
			}

			//bad date value, set null
			else
			{
				this.setState ((state) =>
				{
					state.service.Days[day_index].Date = null;

					return state;
				});
			}
		});
	}

	//add new worker to service day
	add_worker = (day_index) =>
	{
		return (() =>
		{
			this.setState ((state) =>
			{
				//add a worker to the day
				state.service.Days[day_index].Workers =
				state.service.Days[day_index].Workers.concat (
				{
					WorkerID: null,
					WorkerName: ""
				});

				//edit last worker of the current day
				state.editing_day_workers = day_index;
				state.editing_worker
					= state.service.Days[day_index].Workers.length - 1;

				return state;
			});
		});
	}

	edit_worker = (day_index, worker_index) =>
	{
		return ((worker_id, worker_name) =>
		{
			this.setState ((state) =>
			{
				state.service.Days[day_index].Workers[worker_index] = 
				{
					WorkerID: worker_id,
					WorkerName: worker_name
				};

				state.editing_worker = false;

				return state;
			});
		});
	}

	//remove a worker from a service
	remove_worker = (day_index) =>
	{
		return ((worker_index) =>
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
		});
	}

	//show a worker
	render_worker = (day_index) =>
	{
		return ((worker, worker_index) =>
		(
			<div>
			{
				this.state.editing_day_workers === day_index &&
				this.state.editing_worker      === worker_index
				?
					<div style={{height: "3rem", paddingTop: "0.25rem"}}>
					<WorkerDropdown
						label=""
						default={worker.WorkerID}
						blank={null}
						select_option={
							this.edit_worker (day_index, worker_index)
						}
						size="x-large"
					/>
					</div>
				:
					<span> <Clickable
						action={() =>
						{
							this.setState (
							{
								editing_day_workers: day_index,
								editing_worker: worker_index
							});
						}}
						content={worker.WorkerName}
					/> </span>
			}
			</div>
		));
	}

	//show a day and its workers
	render_day = (day, day_index) =>
	(
		<div>

			{	//edit date
				day_index === this.state.editing_day
				?
					<div style={{height: "3rem", paddingBottom: "0.25rem"}}>
						<input
							type="date"
							style={{fontSize: "x-large"}}
							value={ day.Date ? day.Date.toString().substr(0, 10) : null }
							onChange={this.edit_date (day_index)}
						/>
					</div>
				:
					<span> <Clickable

						action={() =>
						{
							//set editing_day to day_index unless already set
							if (!Number.isInteger (this.state.editing_day))
							{
								this.setState ({ editing_day: day_index });
							}
						}}

						content={
							//view date
							new Intl.DateTimeFormat ( "en-US",
							{
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric"
							}).format (new Date (day.Date))
						}
					/> </span>
				}

			{	//workers
				<BulletList
					name_singular="worker"
					items={day.Workers}
					map_func={this.render_worker (day_index)}
					add={this.add_worker (day_index)}
					remove={this.remove_worker (day_index)}
				/>
			}

		</div>
	)

	//display and edit the final price
	render_price = () =>
	{
		let save_price = () =>
		{
			this.setState ({ editing_price: false });
		};

		return (

			<div>
			{
				this.state.mode === "Edit"
				?
					<div>
					{
						//if editing price
						this.state.editing_price
						?
							<div>

								{/* input */}
								<div>
									Final Price: <input
										type="number"
										style={{fontSize: "x-large"}}
										value={this.state.service.FinalPrice}
										onChange={(edit) =>
										{
											this.setState ((state) =>
											{
												state.service.FinalPrice = edit.target.value;

												return state;
											});
										}}
										onKeyDown={(key_down) =>
										{
											//pressing Enter saves input
											if (key_down.key === "Enter")
												save_price();
										}}
									/>
								</div>

								{/* save button */}
								<Button
									label="Save"
									action={save_price}
								/>

							</div>
						:
							<div>
								{/* not edting price */}
								<div>
									Final Price: {this.state.service.FinalPrice}
								</div>

								{/* change button */}
								<Button
									label="Change"
									action={() =>
									{
										this.setState ({ editing_price: true });
									}}
								/>
							</div>
					}
					</div>
				:
					<div></div>
			} 
			</div>

		);
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
							action={this.props.close_service}
							className="close"
						/>
					</div>

					{	//errors
						this.state.errors
						?
							<div>
							{
								this.state.errors.map ((error) =>
								(
									<div className="error">{"Error: " + error}</div>
								))
							}
							</div>

						:
							<div></div>
					}

					{/* main scrollable content */}
					<div className="service-modal-inner">

						{	//duplicate service error
							this.state.duplicate_service_error
							?
								this.state.service.JobName
								+ " already has a Service scheduled for this date."
							:
								<div></div>
						}

						{/* job name or dropdown */}
						{this.render_job()}

						<br/>

						{/* days and workers */}

						<BulletList
							name_singular="day"
							name_plural="Days"
							items={this.state.service.Days}
							map_func={this.render_day}
							add={this.add_day}
							remove={this.remove_day}
						/>

						<br />
						
						{/* final price */}
						{this.render_price()}

					</div> {/* end service-modal-inner */}

					{/* save and cancel */}
					<div className="service-modal-bottom">

						<Button
							label="Cancel Service"
							action={this.remove}
						/>

						<Button
							label="Save"
							action={() =>
							{
								this.save(true);
							}}
						/>

					</div>

				</div>
			</div>
		);
	}
}
