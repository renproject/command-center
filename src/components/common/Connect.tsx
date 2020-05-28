import * as React from "react";

import { ApolloWithNetwork } from "../../lib/graphQL/ApolloWithNetwork";
import { DEFAULT_REN_NETWORK } from "../../lib/react/environmentVariables";
import { EpochContainer } from "../../store/epochStore";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { PopupContainer } from "../../store/popupStore";
import { UIContainer } from "../../store/uiStore";
import { Web3Container } from "../../store/web3Store";
import { MapContainer } from "../networkDarknodesPage/mapContainer";
import { RenVMContainer } from "../renvmPage/renvmContainer";

export const Connect: React.StatelessComponent<Props> = ({ children }) => {
    return <PopupContainer.Provider>
        <Web3Container.Provider initialState={DEFAULT_REN_NETWORK}>
            <ApolloWithNetwork>
                <NetworkStateContainer.Provider>
                    <UIContainer.Provider>
                        <MapContainer.Provider>
                            <RenVMContainer.Provider>
                                <EpochContainer.Provider>
                                    <GithubAPIContainer.Provider>
                                        {children}
                                    </GithubAPIContainer.Provider>
                                </EpochContainer.Provider>
                            </RenVMContainer.Provider>
                        </MapContainer.Provider>
                    </UIContainer.Provider>
                </NetworkStateContainer.Provider>
            </ApolloWithNetwork>
        </Web3Container.Provider>
    </PopupContainer.Provider>;
};

interface Props {
}
