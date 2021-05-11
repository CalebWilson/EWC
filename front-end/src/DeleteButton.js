import React, { Component } from "react";

import "./styles/buttons.css";

export default class DeleteButton extends Component
{
	render()
	{
		return (
			<button className="delete" onClick={this.props.delete}>×</button>
		);
	}
}
