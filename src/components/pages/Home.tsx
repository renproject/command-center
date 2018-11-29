import * as React from "react";

import Footer from "@Components/Footer";
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
                <Footer />
            </div>
        );
    }
}

export default Exchange;
