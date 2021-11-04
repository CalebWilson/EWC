import React, { Component } from "react";

import "./styles/Checkbox.css";

export default class Checkbox extends Component
{
	render()
	{
		return (
			<div className="checkbox-label">
				<input
					className="checkbox-input"
					type="checkbox"
					defaultChecked={this.props.checked}
					onClick={this.props.onChange}
				/>
				{this.props.label}
			</div>
		);
	}
}
