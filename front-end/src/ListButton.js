import React, { Component } from "react";

import "./styles/buttons.css";

export default class ListButton extends Component
{
	render()
	{
		return (
			<button
				className="list-button"
				style={this.props.action ? {cursor: "pointer"} : {}}
				onClick={this.props.action ? this.props.action : () => {}}
			>
				{
					(this.props.type === "add"   ) ? "+" :
					(this.props.type === "remove") ? "×" :
																"="
				}
			</button>
		);
	}
}
