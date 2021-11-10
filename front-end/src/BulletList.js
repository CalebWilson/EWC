import React, { Component } from "react";

import Clickable from "./Clickable";

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
			add,    //optional
			edit,   //optional
			save,   //optional
			remove, //optional

			editing,

			item,

			render_item,
			render_edit_item,
			render_rest,
		}
			= this.props;

		return (
			<div className="bullet-item">
				<BulletButton
					add={add}
					remove={remove}
				/>

				{
					editing
					?
						render_edit_item (item, save)
					:
						<span>
							<Clickable
								action={edit}
								content={render_item (item)}
							/>
						</span>
				}

				{render_rest (item)}
			</div>
		);
	}
}

//class BulletList extends Component
export default class BulletList extends Component
{
	/*
		props:
		{
			string name_singular
			string name_plural

			array items
			int editing

			function render_item (obj): content of Clickable
			function render_edit_item (obj): input element for use in editing
			function render_rest(): content after the Clickable

			function new_item (array): item to be added given current items
			function sanitize_input (obj): santized input given raw input
			function onChange(): callback to be run after input changes
		}
	*/

	constructor (props)
	{
		super (props);

		this.state =
		{
			items: props.items,
			editing: props.editing
		};
	}

	render()
	{
		const {
			name_singular,
			name_plural,

			render_item,
			render_edit_item,
			render_rest,
		}
			= this.props;

		return (
			<div>

				{name_plural ? name_plural + ":" : ""}

				<div className="indent">
					{
						(this.state.items.length === 1)
						?
							<BulletItem
								item={this.state.items[0]}
								editing={this.is_editing()}

								edit={this.edit (0)}
								save={this.save (0)}

								render_item={render_item}
								render_edit_item={render_edit_item}
								render_rest={render_rest}
							/>

						:
							this.state.items.map ((item, item_index) =>
							(
								<BulletItem
									key={item_index}

									item={item}
									editing={this.is_editing (item_index)}

									edit={this.edit (item_index)}
									save={this.save (item_index)}
									remove={this.remove}

									render_item={render_item}
									render_edit_item={render_edit_item}
									render_rest={render_rest}
								/>
							))
					}

					{
						//add new item
						this.is_editing()
						?
							<div></div>
						:
							<div className="bullet-item">
								<BulletButton add={this.add} />

								<span style={{paddingTop: "0.2rem"}}>
									{"Add another " + name_singular}
								</span>
							</div>
					}

					{render_rest()}

				</div>

			<br/>


			</div>
		);
	}

	get_items = () =>
	{
		return this.state.items;
	}

	is_editing = (index) =>
	{
		if (index)
			return (index === this.state.editing);

		return Number.isInteger (this.state.editing);
	}

	add = () =>
	{
		this.setState ((state) =>
		{
			state.items.push (this.props.new_item (state.items));

			state.editing = state.items.length - 1;

			return state;
		});
	}

	remove = (item_index) =>
	{
		return (() =>
		{
			this.setState ((state) =>
			{
				state.items.splice (item_index, 1);

				if (item_index === state.editing)
					state.editing = false;

				return state;
			});
		});
	}

	edit = (item_index) =>
	{
		return (() =>
		{
			if (!this.is_editing())
			{
				this.setState ({ editing: item_index });
			}
		});
	}

	save = (item_index) =>
	{
		return ((edit) =>
		{
			const clean_value = this.props.sanitize_input (edit.target.value);

			this.setState
			(
				(state) =>
				{
					state.items[item_index].value = clean_value;
					state.editing = false;

					return state;
				},

				() =>
				{
					alert (JSON.stringify(this.state));
					this.setState
					(
						(state) =>
						{
							if (this.props.sort_items)
								state.items = this.props.sort_items (state.items);

							return state;
						},

						this.props.onChange()
					);
				}
			);
		});
	}
}
