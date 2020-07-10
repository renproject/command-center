import "./styles/index.scss";

import * as ReactDOM from "react-dom";

import React from "react";
import { Router } from "react-router-dom";

import { App } from "./components/App";
import { Connect } from "./components/common/Connect";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { DEFAULT_REN_NETWORK, NODE_ENV } from "./lib/react/environmentVariables";
import { history } from "./lib/react/history";
import { onLoad } from "./lib/react/onLoad";

// Redirect to https if we aren't serving locally
if (NODE_ENV !== "development") {
    const loc = window.location.href + "";
    // tslint:disable-next-line: no-http-string
    if (loc.indexOf("http://") === 0) {
        console.warn("Redirecting to use TLS");
        // tslint:disable-next-line: no-http-string
        window.location.href = loc.replace("http://", "https://");
    }
}

onLoad(`Command Center${DEFAULT_REN_NETWORK !== "mainnet" ? " (" + DEFAULT_REN_NETWORK + ")" : ""}`);

const render = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <ErrorBoundary popup={true}>
            <Router history={history}>
                <Connect>
                    <Component />
                </Connect>
            </Router>
        </ErrorBoundary>,
        document.getElementById("root") as HTMLElement
    );
};

render(App);

// Enable hot-reloading in development environment.

// tslint:disable-next-line: no-any
if ((module as any).hot) {
    // tslint:disable-next-line: no-any
    (module as any).hot.accept("./components/App", () => {
        const NextApp = require("./components/App").App;
        render(NextApp);
    });
}
