import React, { Component } from "react";

import Day            from "./Day";
import NavArrow       from "./NavArrows";
import WorkerDropdown from "./WorkerDropdown";
import Button         from "./Button";
import ServiceModal   from "./ServiceModal";

import Uplink from "./Uplink";

import "./Schedule.css";
import "./styles/buttons.css";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state =
		{
			data: { week_letter: null, schedule: []},
			mode: null
		};

		//get the week from the URL
		this.week = parseInt(this.props.match.params.week);
	}

	get_schedule = () =>
	{
		Uplink.get_data ("schedule/" + this.props.match.params.week)
		.then ((data) =>
		{
			this.setState (data);
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
	close_service = (refresh) =>
	{
		return (() =>
		{
			this.setState ({ mode: null});

			if (refresh)
				this.get_schedule();
		});
	}

	//get worker-specific schedule from the back-end
	select_worker = (worker_id) =>
	{
		Uplink.get_data (
			"schedule/" + this.props.match.params.week + "/" + worker_id
		)
		.then ((data) =>
		{
			this.setState (data);
		});
	}

	//tell the back-end to generate the current week's recurring jobs
	generate = () =>
	{
		Uplink.get_data ("generate/" + this.week)

		.then ((data) =>
		{
			this.setState (data);
		});
	}

	//get main schedule from the back-end
	componentDidMount()
	{
		this.get_schedule();
	}

	render()
	{
		if (this.state.error)
		{
			return this.state.error;
		}

		return (
			<div>
				{/* main schedule page */}
				<div onClickCapture={this.close_service()}>

					{/* top of the schedule */}
					<div className="schedule-top">

						{/* month name */}
						<div className="month">
							{this.get_month()}
						</div>

						<div className="schedule-top-right">

							<WorkerDropdown select_option={this.select_worker} />

							<Button label="Add Service" action={this.add_service} />

							<span className="button-container">
								<Button label="Generate" action={this.generate}    />
							</span>
						</div>
					
					</div>

					{/* previous week button */}
					<NavArrow
						direction="up"
						href={"/schedule/" + (this.week - 1)}
					/> 

					{/* schedule table */}
					<table>
						<thead><tr>
							<th>Notes</th>
							<th>Monday</th>
							<th>Tuesday</th>
							<th>Wednesday</th>
							<th>Thursday</th>
							<th>Friday</th>
						</tr></thead>
						<tbody><tr>
							{/* notes for the week */}
							<Day
								date={this.state.data.week_letter}
								work_day="Notes Content"
								edit_service={this.edit_service}
							/>
							{
								//work days
								this.state.data.schedule.map ((schedule_work_day, day) =>
								(
									<Day
										date={this.get_date(day).getDate()}
										day={day}
										key={day}
										work_day={schedule_work_day}
										edit_service={this.edit_service}
									/>
								))
							}
						</tr></tbody>
					</table><br />

					{/* next week button */}
					<NavArrow
						direction="down"
						href={"/schedule/" + (this.week + 1)}
					/> 
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
