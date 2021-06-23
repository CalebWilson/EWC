import React, { Component } from "react";
import "./styles/Clickable.css";

export default class Clickable extends Component
{
	render()
	{
		return (
			<div className="clickable-container">
				<div className="clickable" onClick={this.props.action}>
					{this.props.content}
				</div>
			</div>
		);
	}
}
