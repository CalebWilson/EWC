import Dropdown from "./Dropdown";

export default class JobDropdown extends Dropdown
{
	constructor (props)
	{
		super (props);

		this.size  = this.props.size  ? this.props.size  : "x-large";
		this.label = this.props.label ? this.props.label : "Job: ";

		this.options_endpoint = "jobs";
	}

	get_option_id (job)
	{
		return job.JobID;
	}

	get_option_name (job)
	{
		return job.JobName;
	}
}
