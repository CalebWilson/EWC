import React, { Component } from "react";
import "./Schedule.css";

import Day     from "./Day";
import Details from "./Details";

import NavArrow from "./NavArrows";

import get_data from "./get_data";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { data: [], details_visible: false };

		//get the week from the URL
		this.week = parseInt(this.props.match.params.week);
	}

	show_details = (new_details) =>
	{
		this.setState ({ details_visible: true, details: new_details});
	}

	hide_details = () =>
	{
		this.setState ({ details_visible: false });
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

					//href={this.props.match.params.path + 
		return (
			<div className="App">
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
				</table>

				{/* Next week*/}
				<NavArrow
					direction="down"
					href={"/schedule/" + (this.week + 1)}
				/> 
				
				{
					this.state.details_visible
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
