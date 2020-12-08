// tslint:disable: ordered-imports

import { gql, useApolloClient } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { createContainer } from "unstated-next";
import { TokenString } from "../../../lib/ethereum/tokens";

import {
    IntegratorRaw,
    QUERY_BLOCK,
    QUERY_INTEGRATORS,
    QUERY_INTEGRATORS_HISTORY,
    QueryBlockResponse,
    Integrator,
    parseTokenAmount,
} from "../../../lib/graphQL/queries/queries";
import {
    getPeriodTimespan,
    PeriodType,
    tokenArrayToMap,
} from "../../../lib/graphQL/volumes";
import { extractError } from "../../../lib/react/errors";
import { Web3Container } from "../../../store/web3Container";
import DefaultLogo from "../../../styles/images/default-integrator.png";
import Integrators from "./integrators.json";

const rawToIntegrator = (raw: IntegratorRaw): Integrator => {
    const {
        txCount: txCountRaw,
        volume: volumeRaw,
        locked: lockedRaw,
        ...remaining
    } = raw;

    const txCount = tokenArrayToMap(txCountRaw).map((count) => count.value);
    const locked = tokenArrayToMap(lockedRaw).map(parseTokenAmount);
    const volume = tokenArrayToMap(volumeRaw).map(parseTokenAmount);

    return {
        ...remaining,
        txCount,
        locked,
        volume,
    };
};

const integratorDifference = (
    now: Integrator,
    before: Integrator | null,
): Integrator => {
    return {
        ...now,
        txCount: before
            ? now.txCount.map(
                  (value, asset) => value - before.txCount.get(asset, 0),
              )
            : now.txCount,
        locked: before
            ? now.locked.map((value, asset) => {
                  let beforeValue = before.locked.get(asset);
                  return beforeValue
                      ? {
                            ...value,
                            amount: value.amount.minus(beforeValue.amount),
                            amountInEth: value.amountInEth.minus(
                                beforeValue.amountInEth,
                            ),
                            amountInUsd: value.amountInUsd.minus(
                                beforeValue.amountInUsd,
                            ),
                        }
                      : value;
              })
            : now.locked,
        volume: before
            ? now.volume.map((value, asset) => {
                  let beforeValue = before.volume.get(asset);
                  return beforeValue
                      ? {
                            ...value,
                            amount: value.amount.minus(beforeValue.amount),
                            amountInEth: value.amountInEth.minus(
                                beforeValue.amountInEth,
                            ),
                            amountInUsd: value.amountInUsd.minus(
                                beforeValue.amountInUsd,
                            ),
                        }
                      : value;
              })
            : now.volume,
    };
};

const resolveIntegrator = (
    networkDetails: RenNetworkDetails,
    address: string,
): { name: string; logo: string; urlHref: string; url: string } => {
    const details =
        (Integrators[networkDetails.name] &&
            Integrators[networkDetails.name][address]) ||
        {};

    return {
        name: details.name || address,
        logo: details.logo || DefaultLogo,
        urlHref:
            details.urlHref || `${networkDetails.etherscan}/address/${address}`,
        url: details.url || "Etherscan",
    };
};

const ROWS_PER_PAGE = 10;

const useIntegratorsContainer = () => {
    const { renNetwork } = Web3Container.useContainer();
    const [page, setPage] = useState(0);
    // const [search, setSearch] = useState("");
    const search: string = "";

    const [integrators, setIntegrators] = useState<
        OrderedMap<
            number,
            | Array<{ now: Integrator; day: Integrator }>
            | null
            | undefined
            | string
        >
    >(OrderedMap());
    const currentPage = useMemo(() => integrators.get(page), [
        integrators,
        page,
    ]);
    // const allIntegrators = useMemo(() =>
    //     (([] as Integrator[]).concat(...integrators.filter(Array.isArray).valueSeq().toArray())),
    //     [integrators],
    // );

    // Fetch integrators from GraphQL endpoint
    const apollo = useApolloClient();

    useEffect(() => {
        (async () => {
            // Fetch page of integrators

            if (integrators.get(page) === undefined) {
                setIntegrators((currentIntegrators) =>
                    currentIntegrators.set(page, null),
                );
                const response = await apollo.query<{
                    integrators: IntegratorRaw[];
                }>({
                    query: QUERY_INTEGRATORS,
                    variables: {
                        count: ROWS_PER_PAGE,
                        offset: page * ROWS_PER_PAGE,
                    },
                });

                const now = moment().unix();

                const latestBlockResponse = await apollo.query<
                    QueryBlockResponse
                >({
                    query: QUERY_BLOCK,
                });

                const activeBlock = new BigNumber(
                    latestBlockResponse.data.renVM.activeBlock,
                ).toNumber();
                const activeTimestamp = new BigNumber(
                    latestBlockResponse.data.renVM.activeTimestamp,
                ).toNumber();

                // TODO: Calculate dynamically or search for date in subgraph.
                const blockTime = renNetwork.isTestnet ? 4 : 13; // seconds

                // Allow 30 blocks for the subgraph to sync blocks. This also matches the
                // time for burns to be considered final in RenVM on mainnet.
                // currentBlock = currentBlock - 30;

                // Calculate the steps so that there are 30 segments show on the graph.
                // An extra segment is fetched at the start to calculate the volume of
                // the first segment.
                const periodSecondsCount = getPeriodTimespan(
                    PeriodType.DAY,
                    renNetwork,
                );
                const startingBlock = Math.floor(
                    activeBlock -
                        (periodSecondsCount - (now - activeTimestamp)) /
                            blockTime,
                );

                let integratorsWithDay: Array<{
                    now: Integrator;
                    day: Integrator;
                }> = [];

                if (response.data.integrators.length) {
                    // Build GraphQL query containing a request for each of the blocks.

                    const query = gql(`
                        {
                                ${response.data.integrators
                                    .map((integratorData) =>
                                        QUERY_INTEGRATORS_HISTORY(
                                            integratorData.id,
                                            startingBlock,
                                        ),
                                    )
                                    .join("\n")}
                        }
                    `);

                    const responseDay = await apollo.query<{
                        [block: string]: IntegratorRaw | null;
                    }>({
                        query,
                    });

                    integratorsWithDay = response.data.integrators.map(
                        (integrator) => {
                            const integratorDay =
                                Object.values(responseDay.data).filter(
                                    (iDay: IntegratorRaw | null) =>
                                        iDay && iDay.id === integrator.id,
                                )[0] || null;
                            const now = rawToIntegrator(integrator);
                            return {
                                now,
                                day: integratorDifference(
                                    now,
                                    integratorDay
                                        ? rawToIntegrator(integratorDay)
                                        : integratorDay,
                                ),
                            };
                        },
                    );
                }

                // response.data.integrators

                setIntegrators((currentIntegrators) =>
                    currentIntegrators.set(page, integratorsWithDay),
                );
            }
        })().catch((error) => {
            console.error(error);
            setIntegrators(integrators.set(page, extractError(error)));
        });
    }, [integrators, page, apollo, renNetwork]);

    // const onSearchChange = useCallback((event: React.FormEvent<HTMLInputElement>): void => {
    //     const element = (event.target as HTMLInputElement);
    //     setSearch(String(element.value));
    // }, [setSearch]);

    // Filter pages based on search
    const filteredPage = useMemo(
        () =>
            currentPage && Array.isArray(currentPage) && search
                ? currentPage.filter(
                      (integrator) =>
                          !search ||
                          resolveIntegrator(
                              renNetwork,
                              integrator.now.contractAddress,
                          )
                              .name.toLowerCase()
                              .includes(search.toLowerCase()),
                  )
                : currentPage,
        [currentPage, search, renNetwork],
    );

    const [activeIntegrator, setActiveIntegrator] = useState(
        null as string | null,
    );

    return {
        setPage,
        filteredPage,
        page,
        currentPage,
        ROWS_PER_PAGE,
        activeIntegrator,
        setActiveIntegrator,
    };
};

export const IntegratorsContainer = createContainer(useIntegratorsContainer);
