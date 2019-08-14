import * as React from "react";

// import drizzle functions and contract artifact
import { Loading } from "@renproject/react-components";
import { Drizzle } from "drizzle";
import { drizzleReactHooks } from "drizzle-react";
import { connect } from "react-redux";

import { INFURA_KEY } from "../lib/react/environmentVariables";
import { ApplicationState } from "./applicationState";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        renNetwork: state.account.renNetwork,
    },
});

interface Props extends ReturnType<typeof mapStateToProps> {
    children: React.ReactNode;
}

export const DrizzleContainerClass = ({ store: { renNetwork }, children }: Props) => {
    // tslint:disable-next-line: no-any prefer-const
    let [drizzle, setDrizzle] = React.useState<any | null>(null);

    React.useEffect(() => {
        (async () => {
            const fallBackURL = `${renNetwork.infura.replace("https://", "wss://")}/ws/v3/${INFURA_KEY}`;
            // const injectedWeb3 = await getInjectedWeb3Provider();
            // const web3 = new Web3(injectedWeb3);
            // const network = (await web3.eth.net.getNetworkType());

            // let provider: provider | undefined;
            // // if (network !== renNetwork.chain) {
            // provider = new Web3.providers.WebsocketProvider(fallBackURL);
            // // }

            // let drizzle know what contracts we want and how to access our test blockchain
            const options = {
                contracts: [renNetwork.addresses.ren.DarknodeRegistry.artifact, renNetwork.addresses.ren.DarknodePayment.artifact],
                networkWhitelist: [renNetwork.networkID],
                web3: {
                    // customProvider: provider,
                    fallback: {
                        type: "ws",
                        url: fallBackURL,
                    }
                }
            };

            // setup drizzle
            drizzle = new Drizzle(options);
            setDrizzle(drizzle);
        })().catch(console.error);
    }, []);

    if (!drizzle) {
        return <Loading className="not-found" alt />;
    }

    return <drizzleReactHooks.DrizzleProvider drizzle={drizzle}>
        {children}
    </drizzleReactHooks.DrizzleProvider>;
};

export const DrizzleContainer = connect(mapStateToProps)(DrizzleContainerClass);
