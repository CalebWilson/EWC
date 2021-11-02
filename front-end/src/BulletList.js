import React, { Component } from "react";

import "./styles/BulletList.css";
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

//export default class BulletItem extends Component
class BulletItem extends Component
{
	render()
	{
		const {
			list_length,
			action,
			content
		}
			= this.props;

		return (
			<div className="bullet-item">

				{
					//if a list length is provided
					(list_length !== undefined)
					?
						//don't allow removal of the last item
						(list_length === 1)
						?
							<BulletButton />
						: 
							<BulletButton remove={action} />
					:
						//no list length means add button
						<BulletButton add={action} />
				}

				{content}

			</div>
		);
	}
}

//class BulletList extends Component
export default class BulletList extends Component
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
		}
			= this.props;

		return (
			<div>

				{name_plural ? name_plural + ":" : ""}

				<div className="indent">
					{
						items.map ((item_value, item_index) =>
						(
							<BulletItem
								list_length={items.length}
								content={map_func (item_value, item_index)}
								action={remove (item_index)}
							/>
						))
					}

					<BulletItem
						content={
							<span style={{paddingTop: "0.2rem"}}>
								{"Add another " + name_singular}
							</span>
						}
						action={add}
					/>


				</div>

			<br/>


			</div>
		);
	}
}
