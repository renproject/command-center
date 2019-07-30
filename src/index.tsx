import "./styles/index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import { App } from "./components/App";
import { _catch_ } from "./components/ErrorBoundary";
import { NODE_ENV } from "./lib/react/environmentVariables";
import { history } from "./lib/react/history";
import { onLoad } from "./lib/react/onLoad";
import { persistor, store } from "./store/configureStore";

// Redirect to https if we aren't serving locally
if (NODE_ENV !== "development") {
    const loc = window.location.href + "";
    // tslint:disable-next-line: no-http-string
    if (loc.indexOf("http://") === 0) {
        // tslint:disable-next-line: no-http-string
        window.location.href = loc.replace("http://", "https://");
    }
}

onLoad("Command Center");

ReactDOM.render(
    _catch_(<Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Router history={history}>
                <Switch>
                    {/* We add the routes here as well as in App so that App has access to the URL parameters */}
                    <Route path="/darknode/:darknodeID" exact component={App} />
                    <Route component={App} />
                    {/* Don't add extra routes here - add them in App */}
                </Switch>
            </Router>
        </PersistGate>
    </Provider>),
    document.getElementById("root") as HTMLElement
);
