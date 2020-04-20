import * as React from "react";

import { connect } from "react-redux"; // Custom typings

import { ApplicationState } from "../../store/applicationState";
import { EpochContainer } from "../../store/epochStore";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { PopupContainer } from "../../store/popupStore";
import { UIContainer } from "../../store/uiStore";
import { Web3Container } from "../../store/web3Store";
import { MapContainer } from "../networkDarknodesPage/mapContainer";
import { RenVMContainer } from "../renvmPage/renvmContainer";

const ConnectClass: React.StatelessComponent<Props> = ({ children, renNetwork }) => {
    return <Web3Container.Provider initialState={renNetwork}>
        <NetworkStateContainer.Provider>
            <PopupContainer.Provider>
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
            </PopupContainer.Provider>
        </NetworkStateContainer.Provider>
    </Web3Container.Provider>;
};

const mapStateToProps = (state: ApplicationState) => ({
    renNetwork: state.account.renNetwork,
});

interface Props extends ReturnType<typeof mapStateToProps> {
}

export const Connect = connect(mapStateToProps)(ConnectClass);
