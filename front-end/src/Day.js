import React, { Component } from "react";
import './Day.css';

class Day extends Component
{
	render()
	{
		return (
			<td><div className="scrollable">{this.props.content}</div></td>
		);
	}
}

export default Day;
