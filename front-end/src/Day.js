import React, { Component } from "react";
import "./styles/Day.css";

import            DateNum from            "./DateNum";
import      GroupWorkItem from      "./GroupWorkItem";
import IndividualWorkItem from "./IndividualWorkItem";

export default class Day extends Component
{
	render()
	{
		const { GroupWork, IndividualWork, day} = this.props.work_day;

		return (

			<div className="day-container">
				<DateNum date={this.props.date} />

				<div className="day-content">
				{
					//GroupWork
					GroupWork.map ((group_job) =>
					(
						<GroupWorkItem
							key={group_job.ServiceDayID}
							job={group_job}
							edit_service={this.props.edit_service}
							sync_complete={this.props.sync_complete}
						/>
					))
				}

				{
					//IndividualWork
					IndividualWork.map ((indiv_worker_day) =>
					(
						<IndividualWorkItem
							key={day + " " + indiv_worker_day.WorkerID}
							worker_day={indiv_worker_day}
							edit_service={this.props.edit_service}
							sync_complete={this.props.sync_complete}
						/>
					))
				}
				</div>

			</div>
		);
	}
}
