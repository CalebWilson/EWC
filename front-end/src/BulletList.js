import React, { Component } from "react";

import "./BulletList.css";
import "./styles/indent.css";

class BulletButton extends Component
{
	render()
	{
		const action = this.props.add || this.props.remove;

		return (
			<button
				className="bullet-button"
				style={action ? {cursor: "pointer"} : {}}
				onClick={action ? action : () => {}}
			>
				{
					this.props.add    ? "+" :
					this.props.remove ? "×" :
											  "="
				}
			</button>
		);
	}
}

export default class BulletItem extends Component
{
	render()
	{
		return (
			<div className="bullet-item">

				{
					(this.props.index === 0)
					?
						<BulletButton />
					:
						<BulletButton remove={this.props.remove} />
				}

				<span className="list-button-spacer"></span>

				{this.content}

			</div>
		);
	}
}

class BulletList extends Component
{
	render()
	{
		const {
			name_singular,
			name_plural,
			items,
			map_func,
			add,
			remove

		} = this.props;

		return (
			<div>

				{name_plural + ":"}

				<div className="indent">
					{
						items.map ((item_value, item_index) =>
						(
							<BulletItem
								index={item_index}
								content={map_func (item_value, item_index)}
								remove={remove (item_index)}
							/>
						))
					}

					<BulletItem
						index="-1"
						content={"Add another " + name_singular}
						add={add}
					/>

				</div>

			</div>
		);
	}
}
