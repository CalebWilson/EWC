import React, { Component } from "react";

import "./styles/Checkbox.css";

export default class Checkbox extends Component
{
	constructor (props)
	{
		super (props);

		this.label = this.props.label;

		this.state = {checked: this.props.checked};
	}

	toggle = () =>
	{
		this.setState
		(
			{checked: !this.state.checked},
			() => { this.props.onChange (this.state.checked); }
		);
	}

	render()
	{
		return (
			<label className="checkbox-label">
				<input
					className="checkbox-input"
					type="checkbox"
					checked={this.state.checked}
					onChange={this.toggle}
				/>
				{this.label}
			</label>
		);
	}
}
