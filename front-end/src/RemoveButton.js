import React, { Component } from "react";

import "./styles/buttons.css";

export default class RemoveButton extends Component
{
	render()
	{
		return (
			<button className="remove" onClick={this.props.remove}>×</button>
		);
	}
}
