import React, { Component } from "react";

import "./styles/buttons.css";

export default class Button extends Component
{
	render()
	{
		return (
			<button
				className={
					"button" + (this.props.className ? " " + this.props.className : "")
				}
				onClick={this.props.action}
			>
				{this.props.label}
			</button>
		);
	}
}
