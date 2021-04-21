import React, { Component } from "react";
import "./Schedule.css";

import Day from "./Day";

class Schedule extends Component
{
	constructor (props)
	{
		super (props);
		this.state = { apiResponse: "" };
	}

	callAPI()
	{
		fetch ("http://localhost:8080")
			.then  (response => response.text())
			.then  (response => this.setState ({ apiResponse: response }))
			.catch (error => error)
		;
	}

	componentDidMount()
	{
		this.callAPI();
	}

	render()
	{
		return (
			<div className="App">
				<p className="App-intro">
					Response: {this.state.apiResponse}
				</p>
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
						<Day content="Monday Content" />
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
