import * as React from "react";

import { Header } from "../Header";

interface NotFoundProps {
}

interface NotFoundState {
}

class NotFoundClass extends React.Component<NotFoundProps, NotFoundState> {
    public constructor(props: NotFoundProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        return (
            <div>
                <Header />
                <div className="container">
                    <div className="not-found">404</div>
                </div>
            </div >
        );
    }
}

export const NotFound = NotFoundClass;
