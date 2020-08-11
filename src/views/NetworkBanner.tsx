import { RenNetworkDetails } from "@renproject/contracts";
import React from "react";

interface Props {
    renNetwork: RenNetworkDetails;
}

export const NetworkBanner: React.FC<Props> = ({ renNetwork }) => (
    <div className="network--banner">
        Using <span className="banner--bold">{renNetwork.label}</span> RenVM network, <span className="banner--bold">{renNetwork.chainLabel}</span> Ethereum network
    </div>
);
