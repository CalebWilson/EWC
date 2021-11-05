import React, { Component } from "react";

import "./styles/NavMenu.css";

export default class NavMenu extends Component
{
	constructor (props)
	{
		super (props);

		this.state = {visible: false};
	}

	slide = () =>
	{
		this.setState ({visible: !this.state.visible});
	}

	render()
	{
		const links = ["Schedule", "Accounts & Jobs", "Workers"];

		return (
			<div id="nav-menu" className={this.state.visible ? "show" : "hide"}>
				{/* links */}
				<h1>EWC</h1>
				<ul>
				{
					links.map ((link) => (<li>{link}</li>))
				}
				</ul>

				{/* button */}
				<div id="menu-button" onClick={this.slide}>
					{this.state.visible ? "<<" : ">>"}
				</div>

			</div>
		);
	}
}
