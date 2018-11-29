import * as React from "react";

import { List } from "immutable";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import WalletItem from "@Components/WalletItem";

import { clearPopup, ClearPopupAction, setPopup, SetPopupAction } from "@Actions/popup/popupActions";
import { Wallet, WalletList } from "@Library/wallets/wallet";

interface WalletsProps {
    actions: {
        clearPopup: ClearPopupAction;
        setPopup: SetPopupAction;
    };
}

/**
 * Wallets displays a selection of wallets (MetaMask, Ledger, etc.)
 */
class Wallets extends React.Component<WalletsProps> {
    public constructor(props: WalletsProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        return (
            <div className="section wallets">
                <div className="container">
                    <h2 className="wallets--title">Connect your wallet to access your Darknode</h2>
                    <div className="wallets--wrapper">
                        {this.listWallets()}
                    </div>
                </div>
            </div>
        );
    }

    private listWallets(): List<JSX.Element> {
        return WalletList.map((wallet: Wallet, i: number) => {
            return (
                <WalletItem key={i} wallet={wallet} />
            );
        }).toList();
    }
}

function mapDispatchToProps(dispatch: Dispatch): { actions: WalletsProps["actions"] } {
    return {
        actions: bindActionCreators({
            clearPopup,
            setPopup,
        }, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(Wallets);
