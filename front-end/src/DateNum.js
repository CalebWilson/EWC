import React, { Component } from "react";
import "./DateNum.css";

export default class Day extends Component
{
	render()
	{
		return (
			<div className="date-num-container">
				<span className="date-num">
					{this.props.date}
				</span>
			</div>
		);
	}
}
