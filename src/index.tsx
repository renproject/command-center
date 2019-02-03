import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import { App } from "./components/App";
import { _catch_ } from "./components/ErrorBoundary";
import { history } from "./lib/history";
import { onLoad } from "./lib/onLoad";
import { configureStore } from "./store/configureStore";

import "./index.scss";

const { store, persistor } = configureStore();

onLoad("DCC");

ReactDOM.render(
    _catch_(<Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Router history={history}>
                <Switch>
                    {/* We add the routes here as well as in App so that App has access to the URL parameters */}
                    <Route path="/darknode/:darknodeID" exact component={App} />
                    <Route component={App} />
                </Switch>
            </Router>
        </PersistGate>
    </Provider>),
    document.getElementById("root") as HTMLElement
);
