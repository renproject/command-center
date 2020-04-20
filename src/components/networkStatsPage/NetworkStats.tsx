import { RenVMType } from "@renproject/interfaces";
import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";

import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { ReactComponent as IconValueLocked } from "../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../styles/images/icon-volume.svg";
import { Stat, Stats } from "../common/Stat";
import { Block, RenVMContainer } from "../renvmPage/renvmContainer";
import { Collateral } from "./Collateral";
import { Period, PeriodSelector } from "./PeriodSelector";
import { RewardChart } from "./RewardChart";
import { StatTabs } from "./StatTabs";
import { VolumeChart } from "./VolumeChart";

export const NetworkStats = () => {

    const { quoteCurrency, currentDarknodeCount, tokenPrices } = NetworkStateContainer.useContainer();

    const container = RenVMContainer.useContainer();

    React.useEffect(() => {
        container.updateBlocks().catch(console.error);
        const interval = setInterval(() => {
            container.updateBlocks().catch(console.error);
        }, 1000 * 7.5);
        return () => clearInterval(interval);
    }, []); // 7.5 seconds

    const firstBlock = container.blocks ? container.blocks.first<Block | null>(null) : null;

    // For each locked token, create a <Stat> element
    // tslint:disable-next-line: no-any
    let lockedBalances: OrderedMap<Token, BigNumber> = OrderedMap();
    let total = new BigNumber(0);
    if (firstBlock && firstBlock.prevState && firstBlock.prevState.map) {
        firstBlock.prevState
            // .map(state => { const { name, ...restOfA } = state; return { ...restOfA, name: state.name.replace("UTXOs", "").toUpperCase() as Token }; })
            .map((state) => {
                if (state.type === RenVMType.ExtTypeBtcCompatUTXOs && state.name.match(/.*UTXOs/)) {
                    const token = state.name.replace("UTXOs", "").toUpperCase() as Token;
                    if (tokenPrices === null) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return;
                    }

                    const tokenPriceMap = tokenPrices.get(token, undefined);
                    if (!tokenPriceMap) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return;
                    }

                    const price = tokenPriceMap.get(quoteCurrency, undefined);
                    if (!price) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return;
                    }

                    const tokenDetails = AllTokenDetails.get(token, undefined);
                    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;

                    const amount = new BigNumber(state && state.value ? state.value.reduce((sum, utxo) => sum.plus(utxo.amount || "0"), new BigNumber(0)).toFixed() : 0)
                        .div(new BigNumber(Math.pow(10, decimals)));

                    lockedBalances = lockedBalances.set(token, amount.times(price));
                    total = total.plus(lockedBalances.get(token, new BigNumber(0)));
                    return;
                }
            });
    }

    lockedBalances = lockedBalances.sortBy((_value, key) => Object.keys(Token).indexOf(key));

    let renPrice = 0;
    const renTokenPriceMap = tokenPrices && tokenPrices.get(OldToken.REN, undefined);
    renPrice = (renTokenPriceMap && renTokenPriceMap.get(quoteCurrency, undefined)) || 0;

    const r = new BigNumber(currentDarknodeCount || 0).times(100000).times(renPrice);

    const [volumePeriod, setVolumePeriod] = React.useState<Period>(Period.Day);
    const [lockedPeriod, setLockedPeriod] = React.useState<Period>(Period.Day);

    const [volumeTab, setVolumeTab] = React.useState<string>("Volume");
    const [lockedTab, setLockedTab] = React.useState<string>("Volume");

    return (
        <div className="network-stats container">
            <div className="col-xl-8">
                <Stats>
                    <div className="stat-with-period">
                        <PeriodSelector selected={volumePeriod} onChange={setVolumePeriod} />
                        <Stat message="Volume" icon={<IconVolume />} big className="stat--extra-big">
                            {true as boolean ? <><CurrencyIcon currency={quoteCurrency} />{new BigNumber(0).toFormat(2)}{/*<TokenBalance
                            token={Token.ETH}
                            convertTo={quoteCurrency}
                            amount={previousSummed}
                        />*/}</> : <Loading alt />}
                            <div className="overview--bottom">
                                <StatTabs selected={volumeTab} onChange={setVolumeTab} volumePeriod={volumePeriod} assetsPeriod={volumePeriod} />
                                <VolumeChart />
                            </div>
                        </Stat>
                    </div>
                    <div className="stat-with-period">
                        <PeriodSelector selected={lockedPeriod} onChange={setLockedPeriod} />
                        <Stat message="Value locked" icon={<IconValueLocked />} big className="stat--extra-big">
                            {total ? <>
                                <CurrencyIcon currency={quoteCurrency} />
                                {total.toFormat(2)}{/*<TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={currentSummed}
                            />*/}</> : <Loading alt />}
                            <div className="overview--bottom">
                                <StatTabs selected={lockedTab} onChange={setLockedTab} volumePeriod={lockedPeriod} assetsPeriod={null} />
                                <RewardChart values={lockedBalances} quoteCurrency={quoteCurrency} />
                            </div>
                        </Stat>
                    </div>
                </Stats>
            </div>
            <div className="col-xl-4">
                <Collateral l={total} r={r} rRen={new BigNumber(currentDarknodeCount || 0).times(100000)} />
            </div>
        </div>
    );
};
