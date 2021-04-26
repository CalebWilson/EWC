import React        from "react";
import ReactDOM     from "react-dom";

//routing
import {
	BrowserRouter,
	Switch,
	Route
}                   from "react-router-dom";
import { Redirect } from "react-router";

//styling
import "./index.css";

//components
import Schedule from "./Schedule";

//route and render
ReactDOM.render(
	<BrowserRouter>
		<Switch>
			{/*redirect to current week*/}
			<Route exact path="/"        > <Redirect to="/schedule/0" /> </Route>
			<Route exact path="/schedule"> <Redirect to="/schedule/0" /> </Route>

			<Route path="/schedule/:week" component={Schedule} />
		</Switch>
	</BrowserRouter>,
	document.getElementById("root")
);
