import * as React from "react";

import { ApolloWithNetwork } from "../../lib/graphQL/ApolloWithNetwork";
import { DEFAULT_REN_NETWORK } from "../../lib/react/environmentVariables";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { GraphContainer } from "../../store/graphStore";
import { NetworkContainer } from "../../store/networkContainer";
import { PopupContainer } from "../../store/popupStore";
import { UIContainer } from "../../store/uiStore";
import { Web3Container } from "../../store/web3Store";
import { IntegratorsContainer } from "../integratorsPage/integratorsContainer";
import { MapContainer } from "../networkDarknodesPage/mapContainer";
import { NetworkStatsContainer } from "../networkStatsPage/networkStatsContainer";
import { RenVMContainer } from "../renvmPage/renvmContainer";

export const Connect: React.FC = ({ children }) => (
    <PopupContainer.Provider>
        <Web3Container.Provider initialState={DEFAULT_REN_NETWORK}>
            <ApolloWithNetwork>
                <GraphContainer.Provider>
                    <NetworkContainer.Provider>
                        <UIContainer.Provider>
                            <MapContainer.Provider>
                                <RenVMContainer.Provider>
                                    <GithubAPIContainer.Provider>
                                        <NetworkStatsContainer.Provider>
                                            <IntegratorsContainer.Provider>
                                                {children}
                                            </IntegratorsContainer.Provider>
                                        </NetworkStatsContainer.Provider>
                                    </GithubAPIContainer.Provider>
                                </RenVMContainer.Provider>
                            </MapContainer.Provider>
                        </UIContainer.Provider>
                    </NetworkContainer.Provider>
                </GraphContainer.Provider>
            </ApolloWithNetwork>
        </Web3Container.Provider>
    </PopupContainer.Provider>
);
