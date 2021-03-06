import { ApolloProvider } from "@apollo/react-hooks";
import React, { useMemo } from "react";

import { Web3Container } from "../../store/web3Container";
import { apolloClient } from "./client";

export const ApolloWithNetwork: React.FC<{}> = ({ children }) => {
    const { renNetwork } = Web3Container.useContainer();
    const client = useMemo(() => apolloClient(renNetwork), [renNetwork]);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
