import React, { Component } from "react";

import WeekNotes      from "./WeekNotes";
import Day            from "./Day";
import NavArrow       from "./NavArrows";
import WorkerDropdown from "./WorkerDropdown";
import Button         from "./Button";
import ServiceModal   from "./ServiceModal";

import Uplink from "./Uplink";

import "./styles/Schedule.css";
import "./styles/buttons.css";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state =
		{
			worker_id: "",
			data: { week_letter: null, week_notes: "", schedule: []},
			mode: null
		};

		//get the week from the URL
		this.week = parseInt(this.props.match.params.week);
	}

	get_schedule = () =>
	{
		Uplink.get_data (
			"schedule/" + this.props.match.params.week +
			"/"         + this.state.worker_id
		)

		.then ((data) =>
		{
			this.setState (data, this.mark_cont);
		});
	}

	//mark all service continuations as such
	mark_cont = () =>
	{
		this.modify_services ((job) =>
		{
			if (job.ServiceDay !== 0)
				job.JobName += " (cont.)";

			return job;
		});
	}

	/*
		Modify every job on the schedule with the callback modify_func.

		modify_func should take in a service object of the form
		{
			JobName: string,
			ServiceID: int,
			ServiceType: "IN", "OUT", or "IN/OUT",
			FinalPrice: int,
			Complete: boolean int,
			ServiceDayID: int
		}

		and return an object with the same structure.
	*/
	modify_services = (modify_func) =>
	{
		this.setState ((state) =>
		{
			//for every day
			state.data.schedule = state.data.schedule.map ((work_day) =>
			{
				//update group work
				work_day.GroupWork = work_day.GroupWork.map (modify_func);

				//update individual work
				work_day.IndividualWork = work_day.IndividualWork.map ((worker) =>
				{
					worker.Jobs = worker.Jobs.map (modify_func);

					return worker;
				});

				return work_day;
			});

			return state;
		});
	}

	//date of the given day of the current week
	get_date = (day) =>
	{
		let date = new Date (Date.now());
		date.setDate
		(
			date.getDate()        //today's date
			+ (this.week * 7)     //same day as today of current week
			- (date.getDay() - 1) //monday of current week, 0-indexed
			+ day                 //given day of current week
		);

		return date;
	}

	//month(s) of the current week
	get_month = () =>
	{
		let monday = this.get_date (0);
		let friday = this.get_date (4);

		let monday_month =
			new Intl.DateTimeFormat ("en-US", {month: "long"}).format(monday)
		;
		let friday_month =
			new Intl.DateTimeFormat ("en-US", {month: "long"}).format(friday)
		;

		//this works
/*
		if (monday_month != friday_month)
			monday_month += " - " + friday_month;

		return monday_month;
*/

		//but this is cooler
		return (monday_month === friday_month)
		?
				monday_month
			: 
				monday_month + " - " + friday_month
		;
	}

	//show the given details of a job; to be passed as a prop to the Job component
	edit_service = (new_service) =>
	{
		this.setState ({ service: new_service, mode: "Edit"});
	}

	//tell the back-end to add a scheduled job
	add_service = () =>
	{
		this.setState ({ mode: "Add" });
	}

	//hide job details; to be passed as a prop to the ServiceModal component
	close_service = () =>
	{
		if (this.state.mode)
		{
			this.setState
			(
				{mode: null},
				() => { this.get_schedule(); }
			);
		}
	}

	//get worker-specific schedule from the back-end
	select_worker = (worker_id) =>
	{
		this.setState
		(
			(state) =>
			{
				state.worker_id = worker_id;

				return state;
			},

			() => { this.get_schedule() }
		);
	}

	//tell the back-end to generate the current week's recurring jobs
	generate = () =>
	{
		Uplink.get_data ("generate/" + this.week)

		.then ((data) =>
		{
			this.setState (data, this.mark_cont);
		});
	}

	//called when a service is marked complete to update all days of the service
	sync_complete = (service_id, is_complete) =>
	{
		this.modify_services ((job) =>
		{
			if (job.ServiceID === service_id)
				job.Complete = is_complete;

			return job;
		});
	}

	//get main schedule from the back-end
	componentDidMount()
	{
		this.get_schedule();

		document.addEventListener
		(
			"keydown",

			(key_down) =>
			{
				if (key_down.key === "Escape")
					this.close_service();
			},

			false
		);
	}

	render()
	{
		if (this.state.error)
		{
			return this.state.error;
		}

		let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

		return (
			<div>
				{/* main schedule page */}
				<div
					className="schedule"
					onClickCapture={this.close_service}
				>

					{/* top of the schedule */}
					<div className="schedule-top">

						{/* month name */}
						<div className="month">
							{this.get_month()}
						</div>

						<div className="schedule-top-right">

							<WorkerDropdown
								blank={{ WorkerID: "", WorkerName: "MASTER" }}
								select_option={this.select_worker}
							/>

							<Button label="Add Service" action={this.add_service} />

							<span className="button-container">
								<Button label="Generate" action={this.generate} />
							</span>
						</div>
					
					</div>

					{/* previous week button */}
					<NavArrow
						direction="up"
						href={"/schedule/" + (this.week - 1)}
					/> 

					{/* schedule table */}
					<div className="schedule-table-container">
					<table className="schedule-table">
						<thead className="schedule-thead"><tr>
							<th className="schedule-th">Notes</th>

							{
								days.map ((day_name) =>
								(
									<th key={day_name} className="schedule-th">
										{day_name}
									</th>
								))
							}
						</tr></thead>

						<tbody className="schedule-body">
							<tr style={{height: "100%"}}>
							{/* notes for the week */}
							<td className="schedule-td"><WeekNotes
								week_letter={this.state.data.week_letter}
								week_notes={this.state.data.week_notes}
							/></td>
							{
								//work days
								this.state.data.schedule.map ((schedule_work_day, day) =>
								(
									<td className="schedule-td" key={day}>
										<Day
											date={this.get_date(day).getDate()}
											day={day}
											work_day={schedule_work_day}
											edit_service={this.edit_service}
											sync_complete={this.sync_complete}
										/>
									</td>
								))
							}
						</tr></tbody>
					</table>
					</div>

					<div className="schedule-bottom">
						{/* next week button */}
						<NavArrow
							direction="down"
							href={"/schedule/" + (this.week + 1)}
						/> 
					</div>

				</div>

				{/* display service, if any */}
				<div>
				{
					this.state.mode
					?
						<ServiceModal
							service={this.state.service}
							mode={this.state.mode}
							close_service={this.close_service}
						/>
					:
						<div></div>
				}
				</div>

			</div>
		);
	}
}
