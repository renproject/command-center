import * as React from "react";

import { Loading } from "../../components/Loading";

interface SigningPopupProps {
    data: string[];
    sign(): Promise<void>;
}

interface SigningPopupState {
    error: string | null;
    signing: boolean;
}

/**
 * SigningPopup is a popup component for prompting for a user's ethereum
 * signature
 */
export class SigningPopup extends React.Component<SigningPopupProps, SigningPopupState> {
    constructor(props: SigningPopupProps) {
        super(props);
        this.state = {
            error: null,
            signing: true,
        };
    }

    public async componentDidMount() {
        this.callSign().catch(null);
    }

    public render(): JSX.Element {
        const { signing, error } = this.state;
        const { data } = this.props;
        return <div className="popup sign">
            <h2>Approve signature</h2>
            <p className="sign--data">
                {data.map((item, key) => <span key={key} className="monospace sign--datum">{item}</span>)}
            </p>
            {signing ?
                <>
                    <Loading />
                </> :
                <>
                    {error ? <p className="red">{error}</p> : null}
                    <button className="sign--button" onClick={this.callSign}>Try again</button>
                </>
            }
        </div>;
    }

    private callSign = async () => {
        const { sign } = this.props;

        this.setState({ signing: true, error: null });

        try {
            await sign();
        } catch (err) {
            this.setState({ error: err.message || err });
        }
        this.setState({ signing: false });
    }
}
