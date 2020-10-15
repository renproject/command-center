import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Blocky, Currency, CurrencyIcon } from "@renproject/react-components";
import React, { useCallback } from "react";
import { Link } from "react-router-dom";

import { Token } from "../../../../lib/ethereum/tokens";
import { classNames } from "../../../../lib/react/className";
import { DarknodesState } from "../../../../store/networkContainer";
import { DarknodeID } from "../../../../views/DarknodeID";
import { TokenBalance } from "../../../common/TokenBalance";
import { statusText } from "../../darknodePage/Registration";

interface Props {
  darknodeID: string;
  darknodeDetails: DarknodesState | null;
  name: string | undefined;
  quoteCurrency: Currency;
  url: string;
  faded: boolean | null;
  hidable: boolean;
  confirmedRemove: boolean;
  removeDarknode: () => void;
  continuable: boolean;
}

export const CardView: React.FC<Props> = ({
  darknodeID,
  darknodeDetails,
  name,
  quoteCurrency,
  url,
  faded,
  hidable,
  confirmedRemove,
  removeDarknode,
  continuable,
}) => {
  const handleRemoveDarknode = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.stopPropagation();
      e.preventDefault();
      removeDarknode();
    },
    [removeDarknode]
  );

  return (
    <Link className="no-underline" to={url}>
      <div
        className={classNames(
          "darknode-card",
          faded ? "darknode-card--faded" : ""
        )}
      >
        <div className="darknode-card--top">
          {hidable ? (
            <div
              role="button"
              className="card--hide"
              onClick={handleRemoveDarknode}
            >
              {confirmedRemove ? (
                "Are you sure?"
              ) : (
                <FontAwesomeIcon
                  icon={faTimes as FontAwesomeIconProps["icon"]}
                  pull="left"
                />
              )}
            </div>
          ) : null}
        </div>
        <div className="darknode-card--middle">
          <Blocky
            address={darknodeID}
            fgColor="#006FE8"
            bgColor="transparent"
          />

          <h3 className="darknode-card--name">
            {name ? name : <DarknodeID darknodeID={darknodeID} />}
          </h3>
          <span className="darknode-card--status">
            {continuable
              ? "Continue registering"
              : darknodeDetails
              ? statusText[darknodeDetails.registrationStatus]
              : ""}
          </span>
        </div>
        {darknodeDetails ? (
          <div className="darknode-card--bottom">
            <div className="darknode-card--rewards">
              <FontAwesomeIcon
                icon={faStar as FontAwesomeIconProps["icon"]}
                className="darknode-card--bottom--icon"
              />
              <span className="currency-value">
                <CurrencyIcon currency={quoteCurrency} />
                {darknodeDetails.feesEarnedTotalEth ? (
                  <TokenBalance
                    token={Token.ETH}
                    convertTo={quoteCurrency}
                    amount={darknodeDetails.feesEarnedTotalEth}
                  />
                ) : (
                  "..."
                )}
              </span>{" "}
              <span className="currency-symbol">
                {quoteCurrency.toUpperCase()}
              </span>
            </div>
            <div className="darknode-card--gas">
              <FontAwesomeIcon
                icon={faFire as FontAwesomeIconProps["icon"]}
                className="darknode-card--bottom--icon"
              />
              <span className="currency-value">
                <CurrencyIcon currency={Currency.ETH} />
                {darknodeDetails.ethBalance ? (
                  <TokenBalance
                    token={Token.ETH}
                    amount={darknodeDetails.ethBalance}
                    digits={3}
                  />
                ) : (
                  <>...</>
                )}
              </span>{" "}
              <span className="currency-symbol">ETH</span>
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
};
