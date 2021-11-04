import Checkbox from "./Checkbox";

import "./styles/ServiceCompleteCheckbox.css";

import React, { Component } from "react";

import Uplink from "./Uplink";

export default class ServiceCompleteCheckbox extends Component
{
	toggle = () =>
	{
		const { service_id, is_complete } = this.props;

		//update server
		Uplink.send_data
		(
			"service/complete/" + service_id,
			"patch",
			{is_complete: !is_complete}
		);

		//update schedule
		this.props.sync_complete (service_id, !is_complete);
	}

	render()
	{
		return (
			<div className="service-complete-checkbox">
				<Checkbox
					key={this.props.is_complete}
					checked={this.props.is_complete}
					onChange={this.toggle}
				/>
			</div>
		);
	}

}
