import React, { Component } from "react";
import "./styles/NavArrows.css";

export default class NavArrow extends Component
{
	render()
	{
		return (
			<div className="nav-container">
				<a className="nav-arrow" href={this.props.href}>
					<i class={"fa fa-angle-" + this.props.direction}></i>
				</a>
			</div>
		);
	}
}
