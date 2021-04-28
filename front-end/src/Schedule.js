import React, { Component } from "react";
import "./Schedule.css";

import Day from "./Day";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { schedule: [], details_visible: false };
	}

	get_schedule()
	{
		fetch ("http://localhost:8080/schedule/" + this.props.match.params.week)
			.then ((response) =>
			{
				if (response.status !== 200)
				{
					throw response.status;
				}

				return response.json();
			})
			.then ((data) =>
			{
				this.setState ({ schedule: data });
			})
			.catch ((status_error) =>
			{
				this.setState ({ error: status_error });

				return status_error;
			})
		;
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
		this.get_schedule();
	}

	render()
	{
		if (this.state.error)
		{
			return (
				<div>
				<h1 style={{textAlign:"center"}}>
					Sorry, there was an error retrieving your data.<br/><br/>
					Error: "{this.state.error.toString()}"
				</h1>
				</div>
			);
		}

		return (
			<div className="App">
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
							this.state.schedule.map ((schedule_work_day, index) =>
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
				
				{
					this.state.details_visible
					?
						<div>Details visible: {JSON.stringify(this.state.details)}</div>
					:
						<div>Details invisible</div>
				}


			</div>
		);
	}
}
