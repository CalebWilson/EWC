import React, { Component } from "react";
import "./styles/Day.css";

import DateNum from "./DateNum";

export default class WeekNotes extends Component
{
	render()
	{
		return (
			<div className="day-container">
				<DateNum date={this.props.week_letter} />

				<div className="day-content">
					{this.props.week_notes}
				</div>

			</div>
		);
	}
}
