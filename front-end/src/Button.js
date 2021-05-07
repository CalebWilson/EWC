import React, { Component } from "react";

import "./styles/buttons.css";

export default class Button extends Component
{
	render()
	{
		return (
			<button
				className="button"
				onClick={this.props.action}
			>
				{this.props.label}
			</button>
		);
	}
}
