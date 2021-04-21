import React, { Component } from "react";
import './Day.css';

class Day extends Component
{
	render()
	{
		const { GroupWork, IndividualWork} = this.props.content;
		console.log ("GroupWork: " + GroupWork);
		console.log ("IndividualWork: " + IndividualWork);

		if (GroupWork === undefined) return (<td>{this.props.content}</td>);

		return (
			<td><div className="scrollable">
			{
				//JSON.stringify(this.props.content)
				GroupWork.map ((group_job) =>
				(
					<div>
						{group_job.JobName} {group_job.ServiceType} {group_job.FinalPrice}<br/>
						Workers:
						<div className="indent">
						{
							group_job.Workers.map ((Worker) =>
							(
								<div>{Worker.WorkerName}<br/></div>
							))
						}
						</div>
						<br/>
					</div>
				))
			}
			{
				IndividualWork.map ((indiv_worker) =>
				(
					<div>
						{indiv_worker.WorkerName}<br/>

						Jobs:
						<div className="indent">
						{
							indiv_worker.Jobs.map ((Job) =>
							(
								<div>{Job.JobName} {Job.ServiceType} {Job.FinalPrice}<br/></div>
							))
						}
						</div>
						<br/>
					</div>
				))
			}
			</div></td>
		);
	}
}

export default Day;
