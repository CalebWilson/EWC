import React, { Component } from "react";

import get_data from "./get_data";

import "./WorkerDropdown.css";

export default class WorkerDropdown extends Component
{
	constructor (props)
	{
		super (props);

		this.state = { workers: [], worker: "" };
	}

	select_worker = (worker_id) =>
	{
		return (() =>
		{
			//this.setState ({ worker: worker });
			this.props.select_worker (worker_id);
		});
	}

	componentDidMount()
	{
		//worker options
		get_data ("workers").then ((workers) =>
		{
			workers.data.splice (0, 0, {WorkerID: "", WorkerName: "All"});
			this.setState ({ workers: workers.data });
		});
	}

	render()
	{
		return (
			<span>
				Worker: {this.state.worker}
				<span className="worker-dropdown">
					<select>
						{
							this.state.workers.map ((worker) =>
							(
								<option
									key={worker.WorkerID}
									value={worker.WorkerID}
									onClick={this.select_worker (worker.WorkerID)}
								>
									{worker.WorkerName}
								</option>
							))
						}
					</select>
				</span>
			</span>
		);
	}
}
