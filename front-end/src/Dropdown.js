import React, { Component } from "react";

import Uplink from "./Uplink";

import "./Dropdown.css";

export default class Dropdown extends Component
{
	constructor (props)
	{
		super (props);

		this.state = { options: [], current: "" };

		this.style = "";
		this.label = "";
		this.options_endpoint = "";
	}

	get_option_id (option)
	{}

	get_option_name (option)
	{}

	select_option = (option_id, option_name) =>
	{
		return (() =>
		{
			this.props.select_option (option_id, option_name);
		});
	}

	componentDidMount()
	{
		//worker options
		Uplink.get_data (this.options_endpoint).then ((options) =>
		{
			this.setState ({ options: options.data });
		});
	}

	render()
	{
		return (
			<span>
				<label>{this.label}</label>
				<span className="dropdown">
					<select className={this.style}>
						{
							this.state.options.map ((option) =>
							{
								let   id = this.get_option_id   (option);
								let name = this.get_option_name (option);

								if (this.props.default)
								{
									if (this.props.default === id) return (
										<option
											key={id}
											value={id}
											onClick={this.select_option (id, name)}
											selected
										>
											{name}
										</option>
									);
								}

								return (
									<option
										key={id}
										value={id}
										onClick={this.select_option (id, name)}
									>
										{name}
									</option>
								);
							})
						}
					</select>
				</span>
			</span>
		);
	}
}
