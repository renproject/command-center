import * as React from "react";

import { ErrorCanceledByUser } from "@Library/wallets/wallet";

interface ApprovalPopupProps {
    call: () => Promise<void>;
    closePopup: () => void;
}

interface ApprovalPopupState {
    error: Error | null;
    logCount: number;
}

/**
 * ApprovalPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
export class ApprovalPopup extends React.Component<ApprovalPopupProps, ApprovalPopupState> {

    constructor(props: ApprovalPopupProps) {
        super(props);
        this.state = {
            error: null,
            logCount: 0,
        };
    }

    public async componentDidMount() {
        const { call } = this.props;

        await call()
            .catch((error) => {
                console.error(error);
                // Set state may fail if unmounted
                try {
                    this.setState({ error });
                } catch (err) {
                    console.error(err);
                }
            });
    }

    public render(): JSX.Element {
        const { error } = this.state;
        const { closePopup } = this.props;

        let title = <h2>Creating transaction...</h2>;
        let message = <p>Please wait. Do not close this window.</p>;
        if (error) {
            switch (error.message) {
                case ErrorCanceledByUser:
                    title = <h2>Transaction canceled</h2>;
                    message = <p />;
                    break;
                default:
                    title = <h2 className="red">Unable to complete transaction</h2>;
                    message = <p>{error.message}</p>;
                    break;
            }
        }
        return <div className="popup approve">
            {title}
            {message}
            {error &&
                <div className="popup--buttons">
                    <button onClick={closePopup}>Close</button>
                </div>
            }
        </div>;
    }
}
