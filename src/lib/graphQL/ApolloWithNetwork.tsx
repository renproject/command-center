import { ApolloProvider } from "@apollo/react-hooks";
import React, { useMemo } from "react";

import { Web3Container } from "../../store/web3Store";
import { apolloClient } from "./client";

export const ApolloWithNetwork: React.StatelessComponent<{}> = ({ children }) => {
    const { renNetwork } = Web3Container.useContainer();
    const client = useMemo(() => apolloClient(renNetwork), [renNetwork]);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
