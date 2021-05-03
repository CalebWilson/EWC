import React, { Component } from "react";
import "./NavArrows.css";

class UpArrow extends Component
{
	render()
	{
		return (
			<div style={{textAlign: "center"}}>
				<button><i class="fa fa-angle-up"></i></button>
			</div>
		);
	}
}

class DownArrow extends Component
{
	render()
	{
		return (
			<div className="up">
				<button><i class="fa fa-angle-up"></i></button>
			</div>
		);
	}
}

export {UpArrow, DownArrow};
