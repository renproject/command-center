
import { Loading } from "@renproject/react-components";
import React, { useCallback, useEffect } from "react";
import { withRouter } from "react-router-dom";

import { ReactComponent as RemoteBack } from "../../styles/images/remote-back.svg";
import { ReactComponent as RemoteForward } from "../../styles/images/remote-forward.svg";
import { ReactComponent as RemoteStart } from "../../styles/images/remote-start.svg";
import { IntegratorRow } from "./IntegratorRow";
import { IntegratorsContainer } from "./integratorsContainer";

const EmptyRow: React.FunctionComponent<{}> = ({ children }) =>
    <>
        <tr className="empty-row">
            <td colSpan={5}>{children}</td>
        </tr>
        <tr className="integrator-extra integrator-extra-closed" />
    </>;

export const IntegratorsPage = withRouter(({ match: { params }, history }) => {

    const { setPage, filteredPage, page, currentPage, ROWS_PER_PAGE, activeIntegrator, setActiveIntegrator } = IntegratorsContainer.useContainer();

    // Load page from URL
    useEffect(() => {
        const paramsPage = Math.max(params.page && ((parseInt(params.page, 10) || 1) - 1), 0);
        if (params.page && paramsPage !== page) {
            setPage(paramsPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <th className="col-3">24 Hr <span className="integrators-large">Volume</span></th>
                        <th className="col-4">All Time <span className="integrators-large">Volume</span></th>
                    </tr>
                </thead>
                <tbody>
                    {!filteredPage ? <EmptyRow><Loading alt={true} /></EmptyRow> :
                        typeof filteredPage === "string" ? <EmptyRow>Error loading integrators: {currentPage}</EmptyRow> :
                            filteredPage.length === 0 ? <EmptyRow>No results. <button className="text-button" onClick={goToPreviousPage}>Previous page</button></EmptyRow> :
                                filteredPage.map((integrator, i) =>
                                    <IntegratorRow key={integrator.now.id} index={i + 1} integrator={integrator} isActive={activeIntegrator === integrator.now.id} setActiveIntegrator={setActiveIntegrator} />
                                )}
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
                    <button disabled={!Array.isArray(currentPage) || currentPage.length < ROWS_PER_PAGE} onClick={goToNextPage}><RemoteForward /></button>
                    {/* <button><RemoteEnd /></button> */}
                </div>
            </div>
        </div>
    );
});
