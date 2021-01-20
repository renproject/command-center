import "./styles/index.scss";

import * as ReactDOM from "react-dom";

import React from "react";
import { Router } from "react-router-dom";

import { ThemeProvider } from "styled-components";
import { App } from "./controllers/App";
import { Connect } from "./controllers/common/Connect";
import { ErrorBoundary } from "./controllers/common/ErrorBoundary";
import {
    DEFAULT_REN_NETWORK,
    NODE_ENV,
} from "./lib/react/environmentVariables";
import { history } from "./lib/react/history";
import { onLoad } from "./lib/react/onLoad";
import { theme } from "./styles/theme";

// Redirect to https if we aren't serving locally
if (NODE_ENV !== "development") {
    const loc = window.location.href + "";
    if (loc.indexOf("http://") === 0) {
        console.warn("Redirecting to use TLS");
        window.location.href = loc.replace("http://", "https://");
    }
}

onLoad(
    `Command Center${
        DEFAULT_REN_NETWORK !== "mainnet"
            ? " (" + DEFAULT_REN_NETWORK + ")"
            : ""
    }`,
);

const render = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <ErrorBoundary popup={true}>
            <ThemeProvider theme={theme}>
                <Router history={history}>
                    <Connect>
                        <Component />
                    </Connect>
                </Router>
            </ThemeProvider>
        </ErrorBoundary>,
        document.getElementById("root") as HTMLElement,
    );
};

render(App);

// Enable hot-reloading in development environment.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (module as any).hot.accept("./controllers/App", () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NextApp = require("./controllers/App").App;
        render(NextApp);
    });
}
