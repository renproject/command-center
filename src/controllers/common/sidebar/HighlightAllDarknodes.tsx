import { List } from "immutable";
import React, { useMemo } from "react";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { StatusDot, StatusDotColor } from "../../../views/StatusDot";

export const HighlightAllDarknodes: React.FC<{}> = () => {
    const { address } = Web3Container.useContainer();
    const {
        darknodeDetails,
        darknodeList,
        hiddenDarknodes,
    } = NetworkContainer.useContainer();

    const accountDarknodeList = useMemo(
        () => (address ? darknodeList.get(address, null) : null),
        [address, darknodeList],
    );
    const accountHiddenDarknodes = useMemo(
        () => (address ? hiddenDarknodes.get(address, null) : null),
        [address, hiddenDarknodes],
    );

    const shownDarknodeList = !accountDarknodeList
        ? accountDarknodeList
        : accountDarknodeList.filter(
              (d) =>
                  !accountHiddenDarknodes ||
                  !accountHiddenDarknodes.contains(d),
          );

    const shownDarknodeDetails = shownDarknodeList
        ? (shownDarknodeList
              .toList()
              .map((darknode) => darknodeDetails.get(darknode))
              .filter((x) => !!x) as List<DarknodesState>)
        : shownDarknodeList;

    if (shownDarknodeDetails && shownDarknodeDetails.size > 1) {
        return (
            <StatusDot
                style={{ marginTop: -10 }}
                color={StatusDotColor.Blue}
                size={16}
            />
        );
    } else {
        return <></>;
    }
};
