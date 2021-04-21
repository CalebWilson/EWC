import React, { Component } from "react";
import "./Schedule.css";

import Day from "./Day";

class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { schedule: "" };
	}

	callAPI()
	{
		fetch ("http://localhost:8080/schedule/-1")
			.then  (response => response.json())
			.then  ((data) =>
			{
				console.log (data);
				this.setState ({ schedule: data});
			})
			.catch (error => error)
		;
	}

	componentDidMount()
	{
		this.callAPI();
	}

	render()
	{
		console.log("Hello");
		return (
			<div className="App">
				<table>
					<tr>
						<th>Notes</th>
						<th>Sunday</th>
						<th>Monday</th>
						<th>Tuesday</th>
						<th>Wednesday</th>
						<th>Thursday</th>
						<th>Friday</th>
						<th>Saturday</th>
					</tr>
					<tr>
						<Day content="Notes Content" />
						<Day content="Sunday Content" />
						<Day content={this.state.schedule[0]} />
						<Day content="Tuesday Content" />
						<Day content="Wednesday Content" />
						<Day content="Thursday Content" />
						<Day content="Friday Content" />
						<Day content="Saturday Content" />
					</tr>
				</table>
			</div>
		);
	}
}

export default Schedule;
