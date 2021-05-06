import React, { Component } from "react";

//import get_data from "./get_data";

//import "./GenerateButton.css";

export default class GenerateButton extends Component
{
	render()
	{
		return (
			<button
				className="button"
				onClick={this.props.generate}
			>
				Generate
			</button>
		);
	}
}
