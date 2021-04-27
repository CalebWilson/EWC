import React, { Component } from "react";
import "./Schedule.css";

import Day from "./Day";

export default class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { schedule: [] };
	}

	callAPI()
	{
		fetch ("http://localhost:8080/schedule/" + this.props.match.params.week)
			.then ((response) =>
			{
				console.log (response.status);
				if (response.status !== 200)
				{
					throw response.status;
				}

				return response.json();
			})
			.then ((data) =>
			{
				this.setState ({ schedule: data });
				console.log (this.state.schedule);
			})
			.catch ((status_error) =>
			{
				this.setState ({ error: status_error });

				return status_error;
			})
		;
	}

	componentDidMount()
	{
		this.callAPI();
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
						<Day work_day="Notes Content" />
						{
							this.state.schedule.map ((schedule_work_day, index) =>
							(
								<Day
									day={index}
									key={index}
									work_day={schedule_work_day}
								/>
							))
						}
					</tr></tbody>
				</table>
			</div>
		);
	}
}
