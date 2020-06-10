import * as React from "react";

import { ApolloWithNetwork } from "../../lib/graphQL/ApolloWithNetwork";
import { DEFAULT_REN_NETWORK } from "../../lib/react/environmentVariables";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { GraphContainer } from "../../store/graphStore";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { PopupContainer } from "../../store/popupStore";
import { UIContainer } from "../../store/uiStore";
import { Web3Container } from "../../store/web3Store";
import { MapContainer } from "../networkDarknodesPage/mapContainer";
import { RenVMContainer } from "../renvmPage/renvmContainer";

export const Connect: React.FC<Props> = ({ children }) => {
    return <PopupContainer.Provider>
        <Web3Container.Provider initialState={DEFAULT_REN_NETWORK}>
            <ApolloWithNetwork>
                <GraphContainer.Provider>
                    <NetworkStateContainer.Provider>
                        <UIContainer.Provider>
                            <MapContainer.Provider>
                                <RenVMContainer.Provider>
                                    <GithubAPIContainer.Provider>
                                        {children}
                                    </GithubAPIContainer.Provider>
                                </RenVMContainer.Provider>
                            </MapContainer.Provider>
                        </UIContainer.Provider>
                    </NetworkStateContainer.Provider>
                </GraphContainer.Provider>
            </ApolloWithNetwork>
        </Web3Container.Provider>
    </PopupContainer.Provider>;
};

interface Props {
}
