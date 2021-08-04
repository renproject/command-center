import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";

import { classNames } from "../../../lib/react/className";
import { ReactComponent as IconCheckCircle } from "../../../styles/images/icon-check-circle.svg";
import { ReactComponent as IconCollateralization } from "../../../styles/images/icon-collateralization.svg";
import { ReactComponent as IconMintFee } from "../../../styles/images/icon-mint-fee.svg";
import { ExternalLink } from "../../../views/ExternalLink";
import { InfoLabel } from "../../../views/infoLabel/InfoLabel";
import { SimpleTable } from "../../../views/SimpleTable";
import { Stat, Stats } from "../../../views/Stat";
import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";

interface Props {
    total: BigNumber | null;
    bondedRenValue: BigNumber | null;
    bondedRen: BigNumber | null;
    quoteCurrency: Currency;
    mintFee?: number;
    burnFee?: number;
}

const RowBullet = () => (
    <div className="collateral-table--bullet">
        <div className="collateral-table--bullet--inner" />
    </div>
);

// This will be updated once the Greycore is phased out.
const GREYCORE_ACTIVE = true;

export const Collateral: React.FC<Props> = ({
    total,
    bondedRenValue,
    bondedRen,
    quoteCurrency,
    mintFee,
    burnFee,
}) => {
    // TODO: do we need this?
    const lDivB =
        bondedRenValue === null || !total
            ? 0
            : bondedRenValue.isEqualTo(0)
            ? 100
            : BigNumber.min(total.div(bondedRenValue), 1)
                  .multipliedBy(100)
                  .toNumber();
    const bDivL =
        bondedRenValue === null || !total
            ? 100
            : total.isEqualTo(0)
            ? 100
            : BigNumber.min(bondedRenValue.div(total), 1)
                  .multipliedBy(100)
                  .toNumber();
    // const r3 = Math.max(0, 33 - lDivR);

    const loadingCollateralization = bondedRenValue === null || !total;
    const overCollateralized =
        GREYCORE_ACTIVE ||
        bondedRenValue === null ||
        !total ||
        total.lte(bondedRenValue);

    return (
        <div className="collateral">
            <Stats className="collateral-stats--top">
                <Stat
                    className="collateral-stat"
                    message="Collateralization"
                    icon={<IconCollateralization />}
                    infoLabel={
                        GREYCORE_ACTIVE ? undefined : ( // <>During RenVM phases Subzero and Zero, there is a semi-decentralized network of Darknodes called the Greycore. These Darknodes are responsible for execution and whilst they are in operation, RenVM does not need to be over-collateralized to remain secure. Over time, once the economics are safe, the Ren team will phase out the Greycore. <ExternalLink href="https://github.com/renproject/ren/wiki/Greycore">Read more</ExternalLink></> :
                            <>
                                To ensure maximum security, the amount of value
                                locked should not exceed the value of REN bonded
                                in the Darknode contract. For more information,{" "}
                                <ExternalLink href="https://github.com/renproject/ren/wiki/Safety-and-Liveliness#safety">
                                    see here
                                </ExternalLink>
                                .
                            </>
                        )
                    }
                    big={true}
                >
                    <div className="collateral-status-outer">
                        <div className="collateral-pre-status">
                            RenVM is currently
                            {loadingCollateralization && <>...</>}
                        </div>
                        <div className="collateral-status">
                            {loadingCollateralization && <Loading alt={true} />}
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                                className={
                                    loadingCollateralization
                                        ? "collateral-status--loading"
                                        : ""
                                }
                            >
                                {GREYCORE_ACTIVE ? (
                                    <>
                                        <span
                                            className={
                                                overCollateralized
                                                    ? "collateral-status--over"
                                                    : "collateral-status--under"
                                            }
                                        >
                                            secure.{" "}
                                        </span>
                                        <IconCheckCircle />
                                        <InfoLabel direction="bottom">
                                            During RenVM phases Subzero and
                                            Zero, there is a semi-decentralized
                                            network of Darknodes called the
                                            Greycore. These Darknodes are
                                            responsible for execution and whilst
                                            they are in operation, RenVM does
                                            not need to be over-collateralized
                                            to remain secure. Over time, once
                                            the economics are safe, the Ren team
                                            will phase out the Greycore.{" "}
                                            <ExternalLink href="https://github.com/renproject/ren/wiki/Greycore">
                                                Read more
                                            </ExternalLink>
                                            .
                                        </InfoLabel>
                                    </>
                                ) : overCollateralized ? (
                                    <>
                                        over-collateralized. <IconCheckCircle />
                                    </>
                                ) : (
                                    <>under-collateralized.</>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="collateral-chart-section">
                        {!GREYCORE_ACTIVE && (
                            <div className="collateral-chart">
                                <div className="collateral-chart--bar">
                                    <div
                                        style={{ width: `${lDivB}%` }}
                                        className={classNames(
                                            "collateral-chart--l",
                                            overCollateralized
                                                ? "collateral-chart--l--over"
                                                : "collateral-chart--l--under",
                                        )}
                                    >
                                        <span className="collateral-chart--label">
                                            L
                                        </span>
                                    </div>
                                    {/* <div style={{ width: `${r3}%` }} className="collateral-chart--b3"><span className="collateral-chart--label">{overCollateralized ? <>B/3</> : null}</span></div> */}
                                    <div
                                        style={{ width: `${100 - lDivB}%` }}
                                        className="collateral-chart--b"
                                    >
                                        <span className="collateral-chart--label">
                                            B
                                        </span>
                                    </div>
                                    {overCollateralized && (
                                        <div
                                            style={{ width: `${bDivL}%` }}
                                            className="collateral-chart--b-line"
                                        >
                                            <span
                                                className={classNames(
                                                    "collateral-chart--label",
                                                    bDivL > 99
                                                        ? "collateral-chart--label--down"
                                                        : bDivL < 3
                                                        ? "collateral-chart--label--right"
                                                        : "",
                                                )}
                                            >
                                                B
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <SimpleTable>
                            <div>
                                <div
                                    className={classNames(
                                        "collateral-table--row--left",
                                        "row--l",
                                        overCollateralized
                                            ? "row--l--over"
                                            : "row--l--under",
                                    )}
                                >
                                    <RowBullet /> Value Locked (L)
                                </div>
                                <div className="collateral-table--row--right">
                                    {total ? (
                                        <span className="monospace nowrap">
                                            <CurrencyIcon
                                                currency={quoteCurrency}
                                            />
                                            {total.toFormat(2)}
                                        </span>
                                    ) : null}
                                    <InfoLabel>
                                        The total value (TVL) of all digital
                                        assets currently locked in RenVM.
                                    </InfoLabel>
                                </div>
                            </div>
                            <div>
                                <div className="collateral-table--row--left row--b">
                                    <RowBullet /> Value Bonded&nbsp;(B)
                                </div>
                                <div className="collateral-table--row--right">
                                    {bondedRen ? (
                                        <span className="monospace">
                                            {bondedRen.toFormat(0)} REN{" "}
                                            {bondedRenValue !== null && (
                                                <span className="collateral-chart--bow--small monospace nowrap">
                                                    (
                                                    <CurrencyIcon
                                                        currency={quoteCurrency}
                                                    />
                                                    {bondedRenValue.toFormat(2)}
                                                    )
                                                </span>
                                            )}
                                        </span>
                                    ) : null}{" "}
                                    <InfoLabel>
                                        The collective value bonded by
                                        darknodes. Each node is required to bond
                                        100,000 REN.
                                    </InfoLabel>
                                </div>
                            </div>
                        </SimpleTable>
                    </div>
                </Stat>
            </Stats>
            <Stats>
                <Stat
                    className="collateral-stat stat--extra-big"
                    message="Mint/Burn Fees"
                    icon={<IconMintFee />}
                    infoLabel={
                        <>
                            The current RenVM minting and burning fee. These
                            fees are voted on by the community based on recent
                            network volume and TVL. For more information,{" "}
                            <ExternalLink href="https://github.com/renproject/ren/wiki/Fees-and-Economics#minting-and-burning-fee">
                                see here
                            </ExternalLink>
                            .
                        </>
                    }
                    big={true}
                >
                    {/* TODO: Populate this dynamically. */}
                    <SimpleTable>
                        <div>
                            <span>
                                <TokenIcon token="EthChain" /> Ethereum
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Mint</span>
                            <span>
                                {mintFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Burn</span>
                            <span>
                                {burnFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span>
                                <TokenIcon token="BSCChain" /> Binance Smart
                                Chain
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Mint</span>
                            <span>
                                {mintFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Burn</span>
                            <span>
                                {burnFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span>
                                <TokenIcon token="FantomChain" /> Fantom
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Mint</span>
                            <span>
                                {mintFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Burn</span>
                            <span>
                                {burnFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span>
                                <TokenIcon token="PolygonChain" /> Polygon
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Mint</span>
                            <span>
                                {mintFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                        <div>
                            <span style={{ marginLeft: "40px" }}>Burn</span>
                            <span>
                                {burnFee !== undefined ? (
                                    <>{15 / 100}%</>
                                ) : (
                                    <Loading />
                                )}
                            </span>
                        </div>
                    </SimpleTable>
                </Stat>
            </Stats>
        </div>
    );
};
