import React, { Component } from "react";

import CloseButton from "./CloseButton";

import "./ScheduledJobModal.css";

export default class ScheduledJobModal extends Component
{
	render()
	{
		return (

			<div className="scheduled-job-modal">
				<div className="scheduled-job-modal-content">
					<CloseButton close={this.props.hide_details} />
					Details visible: {JSON.stringify(this.props.details)}<br/>
				</div>
			</div>
		);
	}
}
