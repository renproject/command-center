import React from "react";
import BigNumber from "bignumber.js";

import { ReactComponent as IconBurnFee } from "../../styles/images/icon-burn-fee.svg";
import { ReactComponent as IconCheckCircle } from "../../styles/images/icon-check-circle.svg";
import {
    ReactComponent as IconCollateralization,
} from "../../styles/images/icon-collateralization.svg";
import { ReactComponent as IconMintFee } from "../../styles/images/icon-mint-fee.svg";
import { Stat, Stats } from "../common/Stat";

interface Props {
    l: BigNumber;
    r: BigNumber;
    rRen: BigNumber;
}

const RowBullet = () => <div className="collateral-table--bullet"><div className="collateral-table--bullet--inner" /></div>;

export const Collateral = ({ l, r, rRen }: Props) => {

    const lDivR = r.isEqualTo(0) ? 0 : l.div(r).multipliedBy(100).toNumber();
    const r3 = Math.max(0, 33 - lDivR);

    return (
        <div className="collateral">
            <Stats className="collateral-stats--top">
                <Stat className="collateral-stat" message="Collateralization" icon={<IconCollateralization />} big>
                    <div className="collateral-status-outer">
                        <div className="collateral-pre-status">RenVM is currently</div>
                        <div className="collateral-status collateral-status--over">over-collateralized. <IconCheckCircle /></div>
                    </div>

                    <div className="collateral-chart-section">
                        <div className="collateral-chart">
                            <div className="collateral-chart--bar">
                                <div style={{ width: `${lDivR}%` }} className="collateral-chart--l"><span className="collateral-chart--label">L</span></div>
                                <div style={{ width: `${r3}%` }} className="collateral-chart--r3"><span className="collateral-chart--label">R/3</span></div>
                                <div style={{ width: `${100 - lDivR - r3}%` }} className="collateral-chart--r"><span className="collateral-chart--label">R</span></div>
                            </div>
                        </div>
                        <div className="collateral-table">
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--l"><RowBullet /> Value Locked (L)</div>
                                <div className="collateral-table--row--right">${l.toFormat(2)}</div>
                            </div>
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--r3"><RowBullet /> Ceiling (R/3)</div>
                                <div className="collateral-table--row--right">${r.div(3).toFormat(2)}</div>
                            </div>
                            <div className="collateral-table--row">
                                <div className="collateral-table--row--left row--r"><RowBullet /> Ren Bonded (R)</div>
                                <div className="collateral-table--row--right">{rRen.toFormat(0)} REN <span className="collateral-chart--row--small">(${r.toFormat(2)})</span></div>
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
