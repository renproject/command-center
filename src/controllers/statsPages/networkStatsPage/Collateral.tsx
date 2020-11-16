import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";

import { classNames } from "../../../lib/react/className";
import { ReactComponent as IconBurnFee } from "../../../styles/images/icon-burn-fee.svg";
import { ReactComponent as IconCheckCircle } from "../../../styles/images/icon-check-circle.svg";
import { ReactComponent as IconCollateralization } from "../../../styles/images/icon-collateralization.svg";
import { ReactComponent as IconMintFee } from "../../../styles/images/icon-mint-fee.svg";
import { ExternalLink } from "../../../views/ExternalLink";
import { InfoLabel } from "../../../views/infoLabel/InfoLabel";
import { Stat, Stats } from "../../../views/Stat";

interface Props {
    minted: BigNumber;
    l: BigNumber;
    b: BigNumber | null;
    bRen: BigNumber;
    quoteCurrency: Currency;
    mintFee: number | undefined;
    burnFee: number | undefined;
}

const RowBullet = () => (
    <div className="collateral-table--bullet">
        <div className="collateral-table--bullet--inner" />
    </div>
);

// This will be updated once the Greycore is phased out.
const GREYCORE_ACTIVE = true;

export const Collateral: React.FC<Props> = ({
    minted,
    l,
    b,
    bRen,
    quoteCurrency,
    mintFee,
    burnFee,
}) => {
    const lDivB =
        b === null || l.isZero()
            ? 0
            : b.isEqualTo(0)
            ? 100
            : BigNumber.min(l.div(b), 1).multipliedBy(100).toNumber();
    const bDivL =
        b === null || l.isZero()
            ? 100
            : l.isEqualTo(0)
            ? 100
            : BigNumber.min(b.div(l), 1).multipliedBy(100).toNumber();
    // const r3 = Math.max(0, 33 - lDivR);

    const loadingCollateralization = b === null || l.isZero();
    const overCollateralized = GREYCORE_ACTIVE || b === null || l.lte(b);

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
                            {loadingCollateralization ? <>...</> : null}
                        </div>
                        <div className="collateral-status">
                            {loadingCollateralization ? (
                                <Loading alt={true} />
                            ) : null}
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
                        {!GREYCORE_ACTIVE ? (
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
                                    {!overCollateralized ? (
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
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                        <div
                            className={classNames(
                                "collateral-table",
                                GREYCORE_ACTIVE
                                    ? "collateral-table-greycore"
                                    : "",
                            )}
                        >
                            <div className="collateral-table--row">
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
                                    <span className="monospace nowrap">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        {l.toFormat(2)}
                                    </span>
                                    <InfoLabel>
                                        The total value (TVL) of all digital
                                        assets currently locked in RenVM.
                                    </InfoLabel>
                                </div>
                            </div>
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b">
                                    <RowBullet /> Value in motion
                                </div>
                                <div className="collateral-table--row--right">
                                    {l && minted && minted.gt(0) ? (
                                        <span className="collateral-chart--bow--small monospace nowrap">
                                            <CurrencyIcon
                                                currency={quoteCurrency}
                                            />
                                            {BigNumber.max(
                                                l.minus(minted),
                                                0,
                                            ).toFormat(2)}
                                        </span>
                                    ) : null}{" "}
                                    <InfoLabel>
                                        The value of digital assets currently
                                        being minted or burned through RenVM.
                                        Equal to the value locked minus the
                                        value minted.
                                    </InfoLabel>
                                </div>
                            </div>
                            {/* <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b3"><RowBullet /> Ceiling (R/3)</div>
                                <div className="collateral-table--row--right"><CurrencyIcon currency={quoteCurrency} />{(r || new BigNumber(0)).div(3).toFormat(2)} <InfoLabel>Locked</InfoLabel></div>
                            </div> */}
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b">
                                    <RowBullet /> Value Bonded&nbsp;(B)
                                </div>
                                <div className="collateral-table--row--right">
                                    <span className="monospace">
                                        {bRen.toFormat(0)} REN{" "}
                                        {b ? (
                                            <span className="collateral-chart--bow--small monospace nowrap">
                                                (
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {b.toFormat(2)})
                                            </span>
                                        ) : null}
                                    </span>{" "}
                                    <InfoLabel>
                                        The collective value bonded by
                                        darknodes. Each node is required to bond
                                        100,000 REN.
                                    </InfoLabel>
                                </div>
                            </div>
                        </div>
                    </div>
                </Stat>
            </Stats>
            <Stats>
                <Stat
                    className="collateral-stat stat--extra-big"
                    message="Mint Fee"
                    icon={<IconMintFee />}
                    infoLabel={
                        <>
                            The current RenVM minting fee. It is a dynamic fee
                            which fluctuates based on the amount of value locked
                            within in RenVM. For more information,{" "}
                            <ExternalLink href="https://github.com/renproject/ren/wiki/Fees-and-Economics#minting-and-burning-fee">
                                see here
                            </ExternalLink>
                            .
                        </>
                    }
                    big={true}
                >
                    {mintFee === undefined ? (
                        <Loading alt={true} />
                    ) : (
                        <>{mintFee / 100}%</>
                    )}
                </Stat>
                <Stat
                    className="collateral-stat stat--extra-big"
                    message="Burn Fee"
                    icon={<IconBurnFee />}
                    infoLabel={
                        <>
                            The current RenVM burning fee. It is a dynamic fee
                            which fluctuates based on the amount of value locked
                            within in RenVM. For more information,{" "}
                            <ExternalLink href="https://github.com/renproject/ren/wiki/Fees-and-Economics#minting-and-burning-fee">
                                see here
                            </ExternalLink>
                            .
                        </>
                    }
                    big={true}
                >
                    {burnFee === undefined ? (
                        <Loading alt={true} />
                    ) : (
                        <>{burnFee / 100}%</>
                    )}
                </Stat>
            </Stats>
        </div>
    );
};
