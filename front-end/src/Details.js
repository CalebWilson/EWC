import React, { Component } from "react";

export default class Details extends Component
{
	render()
	{
		return (

			<div>
				Details visible: {JSON.stringify(this.props.details)}<br/>
				<button onClick={this.props.hide_details}>Hide Details</button>
			</div>
		);
	}
}
