import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { darknodeIDBase58ToHex, darknodeIDHexToBase58 } from "../../lib/darknode/darknodeID";
import { Ox } from "../../lib/ethereum/contractReads";
import { EncodedData } from "../../lib/general/encodedData";
import { classNames } from "../../lib/react/className";
import { storeRenNetwork } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { storeQuoteCurrency } from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";
import { showMobileMenu } from "../../store/ui/uiActions";

const isDarknodeAddress = (search: string): string | undefined => {
    const regex = new RegExp(/^(0x)?[a-f0-9]{40}$/i);
    try {
        if (search.match(regex)) { return darknodeIDHexToBase58(search); }
        if (darknodeIDBase58ToHex(search).match(regex)) { return search; }
    } catch (error) { /* Ignore error */ }
    return undefined;
};

const isTransaction = (search: string): string | undefined => {
    const regex = new RegExp(/^(0x)?[a-f0-9]{64}$/i);
    try {
        if (search.match(regex)) { return Ox(search); }
        if (new EncodedData(search, EncodedData.Encodings.BASE64).toHex().match(regex)) { return new EncodedData(search, EncodedData.Encodings.BASE64).toHex(); }
    } catch (error) { /* Ignore error */ }
    return undefined;
};

const isBlock = (search: string): number | undefined => {
    const regex = new RegExp(/^\d+$/);
    return !!search.match(regex) ? parseInt(search, 10) : undefined;
};

const SearchClass = ({ history }: Props) => {

    const [searchInput, setSearchInput] = React.useState("");
    const [loadingSearch, setLoadingSearch] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        setNotFound(false);
        const element = (event.target as HTMLInputElement);
        setSearchInput(String(element.value));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        setLoadingSearch(true);
        event.preventDefault();
        const search = searchInput;

        if (isDarknodeAddress(search)) {
            // setSearchInput("");
            history.push(`/darknode/${isDarknodeAddress(search)}`);
        } else if (isTransaction(search)) {
            // setSearchInput("");
            history.push(`/renvm/tx/${isTransaction(search)}`);
        } else if (isBlock(search)) {
            // setSearchInput("");
            history.push(`/renvm/${isBlock(search)}`);
        } else {
            setNotFound(true);
        }
        setLoadingSearch(false);
    };

    return (
        <li className="header--group header--group--search">
            <form onSubmit={loadingSearch ? () => { /* disabled */ } : handleSubmit}>
                <input disabled={loadingSearch} type="text" className={classNames("header--search--input", "header--selected", notFound ? "header--search--404" : "")} onChange={handleInput} value={searchInput} placeholder="Search darknodes / transactions" />
            </form>
        </li>
    );
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        quoteCurrency: state.network.quoteCurrency,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        storeQuoteCurrency,
        showMobileMenu,
        storeRenNetwork,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const Search = connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchClass));
