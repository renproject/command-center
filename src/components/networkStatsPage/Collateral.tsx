import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";

import { classNames } from "../../lib/react/className";
import { ReactComponent as IconBurnFee } from "../../styles/images/icon-burn-fee.svg";
import { ReactComponent as IconCheckCircle } from "../../styles/images/icon-check-circle.svg";
import {
    ReactComponent as IconCollateralization,
} from "../../styles/images/icon-collateralization.svg";
import { ReactComponent as IconMintFee } from "../../styles/images/icon-mint-fee.svg";
import { Stat, Stats } from "../common/Stat";

interface Props {
    minted: BigNumber;
    l: BigNumber;
    b: BigNumber | null;
    bRen: BigNumber;
    quoteCurrency: Currency;
}

const RowBullet = () => <div className="collateral-table--bullet"><div className="collateral-table--bullet--inner" /></div>;

export const Collateral: React.FC<Props> = ({ minted, l, b, bRen, quoteCurrency }) => {

    const lDivB = b === null || l.isZero() ? 0 : b.isEqualTo(0) ? 100 : BigNumber.min(l.div(b), 1).multipliedBy(100).toNumber();
    const bDivL = b === null || l.isZero() ? 100 : l.isEqualTo(0) ? 100 : BigNumber.min(b.div(l), 1).multipliedBy(100).toNumber();
    // const r3 = Math.max(0, 33 - lDivR);

    const loadingCollateralization = b === null || l.isZero();
    const overCollateralized = b === null || l.lte(b);

    return (
        <div className="collateral">
            <Stats className="collateral-stats--top">
                <Stat className="collateral-stat" message="Collateralization" icon={<IconCollateralization />} big>
                    <div className="collateral-status-outer">
                        <div className="collateral-pre-status">RenVM is currently{loadingCollateralization ? <>...</> : null}</div>
                        <div className={classNames("collateral-status", overCollateralized ? "collateral-status--over" : "collateral-status--under")}>
                            {loadingCollateralization ? <Loading /> : null}
                            <span className={loadingCollateralization ? "collateral-status--loading" : ""}>
                                {overCollateralized ?
                                    <>over-collateralized. <IconCheckCircle /></> :
                                    <>under-collateralized.</>
                                }
                            </span>
                        </div>
                    </div>

                    <div className="collateral-chart-section">
                        <div className="collateral-chart">
                            <div className="collateral-chart--bar">
                                <div style={{ width: `${lDivB}%` }} className={classNames("collateral-chart--l", overCollateralized ? "collateral-chart--l--over" : "collateral-chart--l--under")}><span className="collateral-chart--label">L</span></div>
                                {/* <div style={{ width: `${r3}%` }} className="collateral-chart--b3"><span className="collateral-chart--label">{overCollateralized ? <>B/3</> : null}</span></div> */}
                                <div style={{ width: `${100 - lDivB}%` }} className="collateral-chart--b"><span className="collateral-chart--label">B</span></div>
                                {!overCollateralized ?
                                    <div style={{ width: `${bDivL}%` }} className="collateral-chart--b-line"><span className={classNames("collateral-chart--label", bDivL > 99 ? "collateral-chart--label--down" : bDivL < 3 ? "collateral-chart--label--right" : "")}>B</span></div> :
                                    null
                                }
                            </div>
                        </div>
                        <div className="collateral-table">
                            <div className="collateral-table--row">
                                <div className={classNames("collateral-table--row--left", "row--l", overCollateralized ? "row--l--over" : "row--l--under")}><RowBullet /> Value Locked (L)</div>
                                <div className="collateral-table--row--right"><CurrencyIcon currency={quoteCurrency} />{l.toFormat(2)}</div>
                            </div>
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b"><RowBullet /> Value Minted</div>
                                <div className="collateral-table--row--right">{minted ? <span className="collateral-chart--bow--small"><CurrencyIcon currency={quoteCurrency} />{minted.toFormat(2)}</span> : null}</div>
                            </div>
                            {/* <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b3"><RowBullet /> Ceiling (R/3)</div>
                                <div className="collateral-table--row--right"><CurrencyIcon currency={quoteCurrency} />{(r || new BigNumber(0)).div(3).toFormat(2)}</div>
                            </div> */}
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--b"><RowBullet /> Value Bonded (B)</div>
                                <div className="collateral-table--row--right">{bRen.toFormat(0)} REN {b ? <span className="collateral-chart--bow--small">(<CurrencyIcon currency={quoteCurrency} />{b.toFormat(2)})</span> : null}</div>
                            </div>
                        </div>
                    </div>
                </Stat>
            </Stats>
            <Stats>
                <Stat className="collateral-stat stat--extra-big" message="Mint Fee" icon={<IconMintFee />} big>
                    0.1%
                </Stat>
                <Stat className="collateral-stat stat--extra-big" message="Burn Fee" icon={<IconBurnFee />} big>
                    0.1%
                </Stat>
            </Stats>
        </div>
    );
};
