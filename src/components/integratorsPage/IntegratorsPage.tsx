import { useApolloClient } from "@apollo/react-hooks";
import { Loading } from "@renproject/react-components";
import { OrderedMap } from "immutable";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withRouter } from "react-router-dom";
import { RenNetworkDetails } from "@renproject/contracts";

import { Token } from "../../lib/ethereum/tokens";
import { Integrator, INTEGRATORS } from "../../lib/graphQL/queries";
import { getCurrent24HourPeriod } from "../../lib/graphQL/volumes";
import { extractError } from "../../lib/react/errors";
import { Web3Container } from "../../store/web3Store";
import CurveLogo from "../../styles/images/integrators/curve.svg";
// import DefaultLogo from "../../styles/images/integrators/default.png";
import UniswapLogo from "../../styles/images/integrators/uniswap.png";
import { ReactComponent as RemoteBack } from "../../styles/images/remote-back.svg";
import { ReactComponent as RemoteForward } from "../../styles/images/remote-forward.svg";
import { ReactComponent as RemoteStart } from "../../styles/images/remote-start.svg";
import { ExternalLink } from "../common/ExternalLink";
import { TokenBalance } from "../common/TokenBalance";
import Integrators from "./integrators.json";

const DefaultLogo = require("../../styles/images/integrators/default.png");

const resolveIntegrator = (networkDetails: RenNetworkDetails, address: string): { name: string, logo: string, urlHref: string, url: string } => {
    const details = (Integrators[networkDetails.name] && Integrators[networkDetails.name][address]) || {};

    return {
        name: details.name || address,
        logo: details.logo || DefaultLogo,
        urlHref: details.urlHref || `${networkDetails.etherscan}/address/${address}`,
        url: details.url || "Etherscan"
    };
};

const EmptyRow: React.FunctionComponent<{}> = ({ children }) =>
    <tr className="empty-row">
        <td colSpan={5}>{children}</td>
    </tr>;

const ROWS_PER_PAGE = 10;

export const IntegratorsPage = withRouter(({ match: { params }, history }) => {
    const { renNetwork } = Web3Container.useContainer();
    const currentTime = useMemo(() => getCurrent24HourPeriod(), []);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");

    // Load page from URL
    useEffect(() => {
        const paramsPage = Math.max(params.page && ((parseInt(params.page, 10) || 1) - 1), 0);
        if (params.page && paramsPage !== page) {
            setPage(paramsPage);
        }
    }, [params.page]);

    const changePage = React.useCallback((nextPage: number) => {
        // Add page to URL
        history.push(`/integrators/${nextPage + 1}`);
        setPage(nextPage);
    }, [history, setPage]);

    // Handle changing page
    const goToFirstPage = useCallback(() => changePage(0), [changePage]);
    const goToPreviousPage = useCallback(() => changePage(page - 1), [changePage, page]);
    const goToNextPage = useCallback(() => changePage(page + 1), [changePage, page]);
    // const lastPage = useCallback(() => setPage(0), [setPage]);

    const [integrators, setIntegrators] = useState<OrderedMap<number, Integrator[] | null | undefined | string>>(OrderedMap());
    const currentPage = useMemo(() => integrators.get(page), [integrators, page]);
    // const allIntegrators = React.useMemo(() =>
    //     (([] as Integrator[]).concat(...integrators.filter(Array.isArray).valueSeq().toArray())),
    //     [integrators],
    // );

    // Fetch integrators from GraphQL endpoint
    const apollo = useApolloClient();
    useEffect(() => {
        if (integrators.get(page) === undefined) {
            setIntegrators(integrators.set(page, null));
            apollo.query<{ integrators: Integrator[] }>({
                query: INTEGRATORS,
                variables: {
                    count: ROWS_PER_PAGE,
                    offset: page * ROWS_PER_PAGE,
                },

            }).then((response) => {
                setIntegrators(integrators.set(page, response.data.integrators));
            }).catch((error: Error) => {
                setIntegrators(integrators.set(page, extractError(error)));
            });
        }
    }, [integrators, page, apollo]);

    // const onSearchChange = React.useCallback((event: React.FormEvent<HTMLInputElement>): void => {
    //     const element = (event.target as HTMLInputElement);
    //     setSearch(String(element.value));
    // }, [setSearch]);

    // Filter pages based on search
    const filteredPage = React.useMemo(() =>
        currentPage && Array.isArray(currentPage) && search ?
            currentPage.filter((integrator) => !search || resolveIntegrator(renNetwork, integrator.contractAddress).name.toLowerCase().includes(search.toLowerCase())) :
            currentPage,
        [currentPage, search, renNetwork]
    );

    // If there are less than 10 results, show empty rows below
    const empty = [];
    for (let i = 0; i < (!Array.isArray(filteredPage) || filteredPage.length === 0 ? (ROWS_PER_PAGE - 1) : (ROWS_PER_PAGE) - filteredPage.length); i++) {
        empty.push(i);
    }

    return (
        <div className="integrators-page container">
            <table className="integrators-top">
                <thead>
                    <tr>
                        <th className="col-0">#</th>
                        <th className="col-1">Integrator</th>
                        <th className="col-2" />
                        <th className="col-3">24 Hr Volume</th>
                        <th className="col-4">All Time Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {!filteredPage ? <EmptyRow><Loading alt={true} /></EmptyRow> :
                        typeof filteredPage === "string" ? <EmptyRow>Error loading integrators: {currentPage}</EmptyRow> :
                            filteredPage.length === 0 ? <EmptyRow>No results</EmptyRow> :
                                filteredPage.map((integrator, i) => {
                                    const { name, logo, url, urlHref } = resolveIntegrator(renNetwork, integrator.contractAddress);
                                    return <tr key={integrator.id}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <object role="presentation" data={logo} type="image/png">
                                                <img role="presentation" alt="" src={DefaultLogo} />
                                            </object>
                                        </td>
                                        <td><div className="integrator-name"><span>{name}</span><ExternalLink href={urlHref}>{url}</ExternalLink></div></td>
                                        <td>{integrator.integrator24H.date === currentTime ? <TokenBalance token={Token.BTC} amount={integrator.integrator24H.volumeBTC} digits={3} /> : 0} BTC</td>
                                        <td><TokenBalance token={Token.BTC} amount={integrator.volumeBTC} digits={3} /> BTC</td>
                                    </tr>;
                                })}
                    {empty.map((i) => {
                        return <EmptyRow key={i} />;
                    })}
                </tbody>
            </table>
            <div className="integrators-bottom">
                <div className="integrators-bottom-left">
                    {/* <input type="text" placeholder="Search Integrators" value={search} onChange={onSearchChange} /> */}
                </div>
                <div className="integrators-bottom-right">
                    <button disabled={page === 0} onClick={goToFirstPage}><RemoteStart /></button>
                    <button disabled={page === 0} onClick={goToPreviousPage}><RemoteBack /></button>
                    <button disabled={Array.isArray(currentPage) && currentPage.length === 0} onClick={goToNextPage}><RemoteForward /></button>
                    {/* <button><RemoteEnd /></button> */}
                </div>
            </div>
        </div>
    );
});
