import Dropdown from "./Dropdown";

export default class JobDropdown extends Dropdown
{
	constructor (props)
	{
		super (props);

		this.label = this.props.label ? this.props.label : "Job: ";

		this.options_endpoint = "jobs";

		this.blank =
			(this.props.blank !== undefined)
			?
				this.props.blank
			:
				{ JobID: "", JobName: "" }
		;
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
