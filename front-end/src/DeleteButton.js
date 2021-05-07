import React, { Component } from "react";

export default class Schedule extends Component
{
	render()
	{
		return (
			<button onClick={this.props.delete}>x</button>
		);
	}
}
