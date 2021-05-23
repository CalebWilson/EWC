import React, { Component } from "react";

import         Button from "./Button";
import     BulletList from "./BulletList";
//import     BulletItem from "./BulletList";
import      Clickable from "./Clickable";

import    JobDropdown from "./JobDropdown";
import WorkerDropdown from "./WorkerDropdown";

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

	//add escape listener
	componentDidMount()
	{
		document.addEventListener
		(
			"keydown",

			//if the user presses escape, hide service info
			(key_down) =>
			{
				if (key_down.key === "Escape")
					this.props.close_service()();
			},

			false
		);
	}


	has_job_and_date = () =>
	{
		return (this.state.service.JobID && this.state.service.Days[0].Date);
	}


/*
	sort_days = () =>
	{
		this.setState ((state) =>
		{
			console.log ("Unsorted: " + JSON.stringify(state.service.Days));

			state.service.Days = state.service.Days.sort
			(
				(day1, day2) => (day2.Date - day1.Date)
			);

			console.log ("  Sorted: " + JSON.stringify(state.service.Days));
		});
	}
*/


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
				this.setState ((state) =>
				{
					state.service.Days[0].Date = null;
					state.duplicate_service_error = true;
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
					duplicate_service_error: false
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
			/*
			if (
					day_index !== 0 &&
					edit.target.value < this.state.service.Days[0].Date
			)
			{
				this.setState ((state) =>
				{
					state.out_of_order_error = true;

					state.service.Days[day_index].Date =
						edit.target.value + "T00:00:00.000"	//reset timestamp local
					;

					return state;
				});
			}
			else
			{
			*/

			//get the new date value
			this.setState
			(
				(state) =>
				{
					state.service.Days[day_index].Date =
						edit.target.value + "T00:00:00.000"	//reset timestamp to local
					;

					//stop editing
					state.editing_day = false;
					state.out_of_order_error = false;

					return state;
				},

				//editing first date updates the rest
				() =>
				{
					if (day_index === 0)
					{
						this.save();
					}
				}
			);
		});
	}

	//add new day to service
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
					<WorkerDropdown
						label=""
						default={worker.WorkerID}
						blank={null}
						select_option={
							this.edit_worker (day_index, worker_index)
						}
					/>
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
					<input
						type="date"
						style={{fontSize: "large"}}
						value={ day.Date ? day.Date.toString().substr(0, 10) : null }
						onChange={this.edit_date (day_index)}
					/>
				:
					<span> <Clickable

						action={() =>
						{
							if (!this.out_of_order_error)
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

						{	//days out of order error
							this.state.out_of_order_error
							?
								"Subsequent days cannot be scheduled for before the first day."
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
						Final Price: {this.state.service.FinalPrice}

					</div>

					{/* save or cancel */}
					<div className="service-modal-bottom">

						<Button
							label="Cancel Service"
							action={this.props.close_service()}
						/>

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
