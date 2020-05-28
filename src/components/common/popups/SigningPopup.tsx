import * as React from "react";

import { Loading } from "@renproject/react-components";

interface Props {
    data: string[];
    sign(): Promise<void>;
}

/**
 * SigningPopup is a popup component for prompting for a user's ethereum
 * signature
 */
export const SigningPopup: React.StatelessComponent<Props> = ({ data, sign }) => {
    const [error, setError] = React.useState(null as string | null);
    const [signing, setSigning] = React.useState(true);

    const callSign = async () => {
        setSigning(true);
        setError(null);

        try {
            await sign();
        } catch (error) {
            setError(error.message || String(error));
        }
        setSigning(false);
    };

    React.useEffect(() => {
        callSign()
            .catch(null);
    }, []);

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
                <Loading alt={true} />
            </> :
            <>
                {error ? <p className="red">{error}</p> : null}
                <button className="sign--button" onClick={callSign}>Try again</button>
            </>
        }
    </div>;
};
