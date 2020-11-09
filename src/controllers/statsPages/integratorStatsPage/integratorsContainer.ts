// tslint:disable: ordered-imports

import { gql, useApolloClient } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import {
  Integrator,
  QUERY_BLOCK,
  QUERY_INTEGRATORS,
  QUERY_INTEGRATORS_HISTORY,
  QueryBlockResponse,
} from "../../../lib/graphQL/queries";
import { getPeriodTimespan, PeriodType } from "../../../lib/graphQL/volumes";
import { extractError } from "../../../lib/react/errors";
import { Web3Container } from "../../../store/web3Container";
import Integrators from "./integrators.json";

const DefaultLogo = require("../../../styles/images/integrators/default.png");

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
      | Array<{ now: Integrator; day: Integrator | null }>
      | null
      | undefined
      | string
    >
  >(OrderedMap());
  const currentPage = useMemo(() => integrators.get(page), [integrators, page]);
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
          integrators: Integrator[];
        }>({
          query: QUERY_INTEGRATORS,
          variables: {
            count: ROWS_PER_PAGE,
            offset: page * ROWS_PER_PAGE,
          },
        });

        const now = moment().unix();

        const latestBlockResponse = await apollo.query<QueryBlockResponse>({
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
            (periodSecondsCount - (now - activeTimestamp)) / blockTime,
        );

        let integratorsWithDay: Array<{
          now: Integrator;
          day: Integrator | null;
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
            [block: string]: Integrator | null;
          }>({
            query,
          });

          integratorsWithDay = response.data.integrators.map((integrator) => {
            const integratorDay =
              Object.values(responseDay.data).filter(
                (iDay: Integrator | null) => iDay && iDay.id === integrator.id,
              )[0] || null;
            return { now: integrator, day: integratorDay };
          });
        }

        // response.data.integrators

        setIntegrators((currentIntegrators) =>
          currentIntegrators.set(page, integratorsWithDay),
        );
      }
    })().catch((error) => {
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
              resolveIntegrator(renNetwork, integrator.now.contractAddress)
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
