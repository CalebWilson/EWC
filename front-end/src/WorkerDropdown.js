import Dropdown from "./Dropdown";

export default class WorkerDropdown extends Dropdown
{
	constructor (props)
	{
		super (props);

		this.label =
			(this.props.label !== undefined)
			?
				this.props.label
			:
				"Worker: "
		;

		this.options_endpoint = "workers";

		this.blank =
			(this.props.blank !== undefined)
			?
				this.props.blank
			:
				{ WorkerID: "", WorkerName: "" }
		;
	}

	get_option_id (worker)
	{
		return worker.WorkerID;
	}

	get_option_name (worker)
	{
		return worker.WorkerName;
	}
}
