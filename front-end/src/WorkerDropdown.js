import Dropdown from "./Dropdown";

export default class WorkerDropdown extends Dropdown
{
	constructor (props)
	{
		super (props);

		this.label = this.props.label ? this.props.label : "Worker: ";

		this.options_endpoint = "workers";
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
