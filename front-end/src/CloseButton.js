import React, { Component } from "react";

import "./CloseButton.css";

export default class CloseButton extends Component
{
	render()
	{
		return (
			<button
				className="button close"
				onClick={this.props.close}
			>
				X
			</button>
		);
	}
}

