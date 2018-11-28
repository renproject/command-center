import * as React from "react";

import Header from "@Components/Header";

interface ExchangeProps {
}

interface ExchangeState {
}

/**
 * Home is a page whose principal component allows users to open orders. The
 * page also displays the hidden orderbook.
 */
class Exchange extends React.Component<ExchangeProps, ExchangeState> {
    public render(): JSX.Element {
        return (
            <div className="home">
                <Header withMenu />
                <div className="content" />
            </div>
        );
    }
}

export default Exchange;
