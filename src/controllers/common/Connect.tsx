import React from "react";

import { ApolloWithNetwork } from "../../lib/graphQL/ApolloWithNetwork";
import { DEFAULT_REN_NETWORK } from "../../lib/react/environmentVariables";
import { GithubAPIContainer } from "../../store/githubApiContainer";
import { GraphContainer } from "../../store/graphContainer";
import { NetworkContainer } from "../../store/networkContainer";
import { NotificationsContainer } from "../../store/notificationsContainer";
import { PopupContainer } from "../../store/popupContainer";
import { UIContainer } from "../../store/uiContainer";
import { Web3Container } from "../../store/web3Container";
import { MapContainer } from "../../store/mapContainer";
import { IntegratorsContainer } from "../pages/integratorStatsPage/integratorsContainer";
import { NetworkStatsContainer } from "../pages/networkStatsPage/networkStatsContainer";
import { RenVMContainer } from "../pages/renvmStatsPage/renvmContainer";

export const Connect: React.FC = ({ children }) => (
    <PopupContainer.Provider>
        <Web3Container.Provider initialState={DEFAULT_REN_NETWORK}>
            <NotificationsContainer.Provider>
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
            </NotificationsContainer.Provider>
        </Web3Container.Provider>
    </PopupContainer.Provider>
);
