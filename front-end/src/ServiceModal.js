import React, { Component } from "react";

import     Button from "./Button";
import BulletList from "./BulletList";
import  Clickable from "./Clickable";

import    JobDropdown from "./JobDropdown";
import WorkerDropdown from "./WorkerDropdown";

import Checkbox from "./Checkbox";

import Uplink from "./Uplink";

import "./styles/indent.css";
import "./styles/ServiceModal.css";

export default class ServiceModal extends Component
{
	constructor (props)
	{
		super (props);

		//if new service, start in edit mode with empty service
		let state = (this.props.mode === "Add")
		?
			{
				service:
				{
					JobID: null,
					Complete: false,
					Days:
					[{
						value: "", //datetime value
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

		state.service.Days = state.service.Days.map ((day) =>
		(
			{
				value: day.Date,
				Workers: day.Workers
			}
		));

		state.service.Days = this.sort_days (state.service.Days);

		this.state = state;

		this.day_list = React.createRef();

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
		return (this.state.service.JobID && this.state.service.Days[0].value);
	}

	sort_days = (days) =>
	{
		days.sort
		(
			(day1, day2) =>
			{
				console.log (new Date (day1.value) - new Date (day2.value));
				return (new Date (day1.value) - new Date (day2.value));
			}
		);

		return days;
	}

	create = () =>
	{
		if
		(
			!(
				this.state.mode === "Add" &&
				this.state.service.JobID  &&
				this.day_list.current.get_items()[0].value
			)
		){
			return;
		}

		let request_body =
		{
			JobID: this.state.service.JobID,
			ServiceDate: this.day_list.current.get_items()[0].value
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
				this.props.close_service();
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
		if (this.state.service.ServiceID === undefined)
		{
			this.props.close_service();
			return;
		}

		Uplink.send_data ("service/" + this.state.service.ServiceID, "delete")

		.then (this.confirm_close);
	};

	save = (close) =>
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

			this.save
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

	//add new worker to service day
	add_worker = (day_index) =>
	{
		return (() =>
		{
			if (
				!(
					this.state.editing_day_workers === day_index &&
					Number.isInteger (this.state.editing_worker)
				)
			){
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
			}
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
				if (
					!(
						day_index    === this.state.editing_day_workers &&
						worker_index !== this.state.editing_worker
					)
				){
					//remove the given worker from the given Day
					this.setState ((state) =>
					{
						state.service.Days[day_index].Workers.splice (worker_index, 1);

						if (day_index === state.editing_day_workers)
						{
							state.editing_day_workers = false;
							state.editing_worker = false;
						}

						return state;
					}, () => {alert(JSON.stringify(this.state));});
				}
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
	old_render_day = (day, day_index) =>
	(
		<div>

			{	//edit date
				day_index === this.state.editing_day
				?

					<div style={{height: "3rem", paddingBottom: "0.25rem"}}>
						<input
							type="date"
							style={{fontSize: "x-large"}}
							value={ day.Date ? day.Date.toString().substr(0, 10) : ""}
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

	render_day = (day) =>
	{
		console.log (day);

		return (
			new Intl.DateTimeFormat
			(
				"en-US",

				{
					weekday: "long",
					month: "long",
					day: "numeric",
					year: "numeric"
				}

			).format (new Date (day.value))

		);
	}

	render_edit_day = (day, save) =>
	{
		return (
			<div style={{height: "3rem", paddingBottom: "0.25rem"}}>
				<input
					type="date"
					style={{fontSize: "x-large"}}
					value={ day.value ? day.value.toString().substr(0, 10) : ""}
					onChange={save}

				/>
			</div>
		);
	}

	new_day = (days) =>
	{
		return (
		{
			value: "",
			Workers: days[days.length - 1].Workers
		});
	}

	//reset timestamp to local and make nullsafe
	sanitize_day = (date) =>
	{
		return (date ? date + "T00:00:00.0000" : null);
	}

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
					<div></div>
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
							ref={this.day_list}
							name_singular="day"
							name_plural="Days"

							items={this.state.service.Days}
							editing={this.state.mode == "Add" ? 0 : undefined}

							render_item={this.render_day}
							render_edit_item={this.render_edit_day}
							render_rest={() => {}}

							sanitize_input={this.sanitize_day}
							onChange={this.create}

							new_item={this.new_day}
							sort_items={this.sort_days}
						/>


						<br/>
						
						{/* final price */}
						{this.render_price()}

						<br/>

						{/* complete checkbox */}
						<Checkbox
							label="Complete"
							checked={this.state.service.Complete}
							onChange={(checked) =>
							{
								this.setState ((state) =>
								{
									state.service.Complete = !state.service.Complete;
									return state;
								});
							}}
						/>

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
