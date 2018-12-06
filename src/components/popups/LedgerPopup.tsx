import * as React from "react";

import { Creatable, Option } from "react-select";
import { Provider } from "web3/providers";

import Loading from "@Components/Loading";

interface LedgerPopupProps {
    address?: string;
    checkConnection(args: { derivation: string }): Promise<[Provider, string[]]>;
    resolve(args: [Provider, string[] | null]): void;
    reject(reason: Error): void;
}

interface LedgerPopupState {
    loading: boolean;
    error: string | null;
    // tslint:disable-next-line:no-any
    derivation: Option<string>;
}

// "44'/1'", "44'/60'", "44'/61'"
const derivationRegex = new RegExp(/^m\/(44'\/(?:0?1|60|61)')(\/\d\d?'?)*$/);

const options: Array<Option<string>> = [
    { value: "m/44'/60'/0'/0", label: "Default Derivation - m/44'/60'/0'/0" },
    // { value: "m/44'/60'/0'/0/0", label: "Ledger Live App - m/44'/60'/0'/0/0" },
    { value: "m/44'/1'/0'/0", label: "Testnet - m/44'/1'/0'/0" },
];

/**
 * LedgerPopup is a popup component that prompts a user for a JSON file and a
 * password
 */
class LedgerPopup extends React.Component<LedgerPopupProps, LedgerPopupState> {
    constructor(props: LedgerPopupProps) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            derivation: options[0],
        };
    }

    public componentDidMount() {
        //
    }

    public render(): JSX.Element {
        const { error, loading } = this.state;
        // const { address } = this.props;

        return (
            <div className="popup ledger">
                <div>
                    <h2>Connect to Ledger Wallet</h2>

                    <div className="ledger--instructions">
                        <p>Before connecting to your Ledger, make sure you have:</p>
                        <ol>
                            <li>Connected and unlocked your Ledger</li>
                            <li>Opened the Ethereum app on the device</li>
                            <li>Enabled browser and data support</li>
                        </ol>
                    </div>

                    {error !== null ? <p className="red">{error}</p> : null}
                    <form onSubmit={this.handleUnlock}>

                        <Creatable value={this.state.derivation}
                            onChange={this.handleChange}
                            options={options}
                            isValidNewOption={this.validatePath}
                        />

                        <button type="submit">{loading === true ? <Loading /> : "Connect"}</button>
                    </form>
                </div>
            </div>
        );
    }

    private validatePath = (arg: { label: string }): boolean => {
        return derivationRegex.test(arg.label);
    }

    // tslint:disable-next-line:no-any
    private handleChange = (derivation: any) => {
        this.setState({ derivation });
    }

    // private handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
    //     const element = (event.target as HTMLInputElement);
    //     this.setState((current) => ({ ...current, [element.name]: element.value }));
    // }

    // private handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (event.target.files === null || event.target.files.length === 0) {
    //         return;
    //     }
    //     const f = event.target.files[0];

    //     const reader = new FileReader();

    //     // Closure to capture the file information.
    //     reader.onload = ((file) => {
    //         // tslint:disable-next-line:no-any
    //         return (eInner: any) => {
    //             // tslint:disable-next-line:no-any
    //             let key: any | null;
    //             try {
    //                 key = JSON.parse(eInner.target.result);
    //             } catch (err) {
    //                 this.setState({ error: "Please select a valid Ledger file" });
    //                 return;
    //             }
    //             this.setState({ error: null, Ledger: key });
    //         };
    //     })(f);

    //     // Read in the image file as a data URL.
    //     reader.readAsText(f);
    // }

    private handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { checkConnection, resolve } = this.props;
        const { derivation } = this.state;

        this.setState({ loading: true });

        try {
            const value = derivation.value;
            if (!value) {
                throw new Error("Invalid derivation");
            }
            resolve(await checkConnection({ derivation: value }));
        } catch (error) {
            if (error.message.match(/invalid transport instance/)) {
                error = new Error("Unable to connect to Ledger.");
            } else {
                error = new Error(error ? error.message || error : "Unable to connect to Ledger.");
            }
            this.setState({ loading: false, error: error.message });
            return;
        }
    }
}

export default LedgerPopup;
