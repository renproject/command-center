import * as React from "react";

import Loading from "@Components/Loading";

interface KeystorePopupProps {
    address?: string;
    resolve(value: { keystore: object; password: string }): void;
    reject(reason: Error): void;
}

interface KeystorePopupState {
    error: string | null;
    // tslint:disable-next-line:no-any
    keystore: any | null;
    loading: boolean;
    password: string | undefined;
}

/**
 * KeystorePopup is a popup component that prompts a user for a JSON file and a
 * password
 */
class KeystorePopup extends React.Component<KeystorePopupProps, KeystorePopupState> {
    constructor(props: KeystorePopupProps) {
        super(props);
        this.state = {
            error: null,
            keystore: null,
            loading: false,
            password: "",
        };
    }

    public componentDidMount() {
        //
    }

    public render(): JSX.Element {
        const { error, password, loading } = this.state;
        const { address } = this.props;

        return (
            <div className="popup keystore">
                <div>
                    <h2>
                        {address ?
                            `Log in to ${address}` :
                            "Select an account:"
                        }
                    </h2>
                    <form onSubmit={this.handleUnlock}>
                        <input type="file" name="files[]" onChange={this.handleUpload} />
                        <input
                            type="password" name="password" placeholder="Password (optional)" value={password} onChange={this.handleInput}
                        />
                        <button type="submit">{loading === true ? <Loading /> : "Unlock"}</button>
                    </form>
                    {error !== null ? <p className="red">{error}</p> : null}
                </div>
            </div>
        );
    }

    private handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((current) => ({ ...current, [element.name]: element.value }));
    }

    private handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null || event.target.files.length === 0) {
            return;
        }
        const f = event.target.files[0];

        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = ((file) => {
            // tslint:disable-next-line:no-any
            return (eInner: any) => {
                // tslint:disable-next-line:no-any
                let key: any | null;
                try {
                    key = JSON.parse(eInner.target.result);
                } catch (err) {
                    this.setState({ error: "Please select a valid Keystore file" });
                    return;
                }
                this.setState({ error: null, keystore: key });
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }

    private handleUnlock = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!this.state.keystore) {
            console.error("Invalid keystore");
            return;
        }
        this.setState({ loading: true });

        const keystore = this.state.keystore;
        const password: string = (this.state.password === undefined) ?
            "" :
            this.state.password;

        this.props.resolve({
            keystore,
            password,
        });
    }
}

export default KeystorePopup;
