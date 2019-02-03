import * as React from "react";

import { Loading } from "../../components/Loading";

/**
 * SigningPopup is a popup component for prompting for a user's ethereum
 * signature
 */
export class SigningPopup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            signing: true,
        };
    }

    public componentDidMount = async (): Promise<void> => {
        this.callSign()
            .catch(null);
    }

    public render = (): JSX.Element => {
        const { signing, error } = this.state;
        const { data } = this.props;
        return <div className="popup sign">
            <h2>Approve signature</h2>
            <p className="sign--data">
                {data.map((item: string, key: number) =>
                    <span key={key} className="monospace sign--datum">
                        {item}
                    </span>
                )}
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

    private readonly callSign = async () => {
        const { sign } = this.props;

        this.setState({ signing: true, error: null });

        try {
            await sign();
        } catch (error) {
            this.setState({ error: error.message || error });
        }
        this.setState({ signing: false });
    }
}

interface Props {
    data: string[];
    sign(): Promise<void>;
}

interface State {
    error: string | null;
    signing: boolean;
}
