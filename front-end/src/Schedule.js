import React, { Component } from "react";

import Day            from "./Day";
import Details        from "./Details";
import NavArrow       from "./NavArrows";
import GenerateButton from "./GenerateButton";

import get_data from "./get_data";

import "./Schedule.css";
import "./styles/buttons.css";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { data: [], details: null };

		//get the week from the URL
		this.week = parseInt(this.props.match.params.week);
	}

	show_details = (new_details) =>
	{
		this.setState ({ details: new_details});
	}

	hide_details = () =>
	{
		this.setState ({ details: null});
	}

	generate = () =>
	{
		get_data ("generate/" + this.week)

		.then ((data) =>
		{
			this.setState (data);
		});
	}

	componentDidMount()
	{
		get_data ("schedule/" + this.props.match.params.week)

		.then ((data) =>
		{
			this.setState (data);
		});
	}

	render()
	{
		if (this.state.error)
		{
			return this.state.error;
		}

		return (
			<div className="App">
				<div className="schedule-top">

					<div className="month">
						Month
					</div>

					<GenerateButton generate={this.generate}/>
				
				</div>

				{/* Previous week*/}
				<NavArrow
					direction="up"
					href={"/schedule/" + (this.week - 1)}
				/> 

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
						<Day
							work_day="Notes Content"
							show_details={this.show_details}
						/>
						{
							this.state.data.map ((schedule_work_day, index) =>
							(
								<Day
									day={index}
									key={index}
									work_day={schedule_work_day}
									show_details={this.show_details}
								/>
							))
						}
					</tr></tbody>
				</table><br />

				{/* Next week*/}
				<NavArrow
					direction="down"
					href={"/schedule/" + (this.week + 1)}
				/> 
				
				{
					this.state.details
					?
						<Details
							details={this.state.details}
							hide_details={this.hide_details}/>
					:
						<div>Details invisible</div>
				}


			</div>
		);
	}
}
