import React, { Component } from "react";
import "./Day.css";

import      GroupWorkItem from      "./GroupWorkItem";
import IndividualWorkItem from "./IndividualWorkItem";

export default class Day extends Component
{
	constructor (props)
	{
		super (props);
	}

	render()
	{
		const { GroupWork, IndividualWork, day} = this.props.work_day;

		if (GroupWork === undefined) return (<td>{this.props.work_day}</td>);

		return (

			<td><div className="scrollable">
			{
				//GroupWork
				GroupWork.map ((group_job) =>
				(
					<GroupWorkItem
						key={group_job.ScheduledJobDayID}
						job={group_job}
						show_details={this.props.show_details}
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
						show_details={this.props.show_details}
					/>
				))
			}

			</div></td>
		);
	}
}
