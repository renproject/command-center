import { renMainnet } from "@renproject/contracts";
import { Currency, sleep } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React, { useState } from "react";
import { FeesBlock } from "./darknodeBlocks/FeesBlock";
import { GasBlock } from "./darknodeBlocks/GasBlock";
import { isDefined } from "../lib/general/isDefined";
import { classNames } from "../lib/react/className";
import { GraphContainer } from "../store/graphContainer";
import { NetworkContainer } from "../store/networkContainer";
import { Change } from "./Change";
import { DarknodeID } from "./DarknodeID";
import { EpochProgress } from "./EpochProgress";
import { InfoLabel } from "./infoLabel/InfoLabel";
import { Stat, Stats } from "./Stat";
import { StatusDot, StatusDotColor } from "./StatusDot";
import { Tabs } from "./Tabs";
import { TitledSection } from "./TitledSection";
import { TokenIcon } from "./tokenIcon/TokenIcon";
import { Web3Container } from "../store/web3Container";
import { SECONDS } from "../controllers/common/BackgroundTasks";
import { DarknodeName } from "./darknodeBlocks/DarknodeName";

const CatalogItem: React.FC<
    {
        title?: string;
    } & React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >
> = ({ title, children, className, ...props }) => {
    return (
        <div className={classNames("catalog--item", className)} {...props}>
            {title ? <h3>{title}</h3> : null}
            {children}
        </div>
    );
};

const Flex: React.FC<{}> = ({ children }) => (
    <div className="catalog--flex">{children}</div>
);

const defaultCallback = async () => {
    await sleep(2 * SECONDS);
};

const defaultDarknodeID = "0x8C5c25072716d79f7045eEB9E347F6C73Bc33A3b";

const oneEth = new BigNumber(10).exponentiatedBy(18);

export const Catalog = () => {
    const { address, balance } = Web3Container.useContainer();
    const { quoteCurrency, pendingRewards } = NetworkContainer.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { currentCycle, previousCycle } = renVM || {};
    const withdrawableRewards = isDefined(previousCycle)
        ? pendingRewards.get(previousCycle, null)
        : null;
    const claimableRewards = isDefined(currentCycle)
        ? pendingRewards.get(currentCycle, null)
        : null;

    const [tab, setTab] = useState("left");

    const [name, setName] = useState("Darknode name");
    const [renaming, setRenaming] = useState(false);

    return (
        <div className="container catalog">
            {/* InfoLabel */}
            <CatalogItem title="InfoLabel">
                <Flex>
                    Info <InfoLabel>Info</InfoLabel>
                </Flex>
            </CatalogItem>

            {/* TokenIcon */}
            <CatalogItem title="TokenIcon">
                <Flex>
                    <TokenIcon token={"BTC"} />
                    <TokenIcon token={"ZEC"} />
                    <TokenIcon token={"BCH"} />
                    <TokenIcon token={"DAI"} />
                    <TokenIcon token={"ETH"} />
                    <TokenIcon token={"REN"} />
                </Flex>
                <hr />
                <h4>White</h4>
                <Flex>
                    <TokenIcon token={"BTC"} white={true} />
                    <TokenIcon token={"ZEC"} white={true} />
                    <TokenIcon token={"BCH"} white={true} />
                    <TokenIcon token={"DAI"} white={true} />
                    <TokenIcon token={"ETH"} white={true} />
                    <TokenIcon token={"REN"} white={true} />
                    <TokenIcon token={"LUNA"} white={true} />
                    <TokenIcon token={"FIL"} white={true} />
                    <TokenIcon token={"DGB"} white={true} />
                    <TokenIcon token={"DOGE"} white={true} />
                </Flex>
            </CatalogItem>

            {/* DarknodeID */}
            <CatalogItem title="DarknodeID">
                <DarknodeID
                    darknodeID={"0x8C5c25072716d79f7045eEB9E347F6C73Bc33A3b"}
                />
            </CatalogItem>

            {/* Change */}
            <CatalogItem title="Change">
                <p>
                    Positive: <Change change={4} />
                </p>
                <p>
                    Neutral: <Change change={0} />
                </p>
                <p>
                    Negative: <Change change={-3} />
                </p>
            </CatalogItem>

            {/* EpochProgress */}
            <CatalogItem title="EpochProgress">
                <h4>Big</h4>
                <EpochProgress
                    timeSinceLastEpoch={new BigNumber(5)}
                    timeUntilNextEpoch={new BigNumber(10)}
                    minimumEpochInterval={new BigNumber(15)}
                />
                <hr />
                <h4>Small</h4>
                <EpochProgress
                    timeSinceLastEpoch={new BigNumber(5)}
                    timeUntilNextEpoch={new BigNumber(10)}
                    minimumEpochInterval={new BigNumber(15)}
                    small={true}
                />
            </CatalogItem>

            {/* Stats */}
            <CatalogItem title="Stats">
                <Stats>
                    <Stat message="Volume" big>
                        $10
                    </Stat>
                    <Stat message="Locked" big>
                        $100
                    </Stat>
                    <Stat message="Something else" big>
                        $8
                    </Stat>
                </Stats>
                <Stats>
                    <Stat message="Lower volume" big>
                        $10
                    </Stat>
                    <Stat message="Lower locked" big>
                        $100
                    </Stat>
                </Stats>
            </CatalogItem>

            {/* StatusDot */}
            <CatalogItem title="StatusDot">
                <Flex>
                    Blue:{" "}
                    <StatusDot
                        style={{ marginLeft: 10 }}
                        color={StatusDotColor.Blue}
                        size={16}
                    />
                </Flex>
                <Flex>
                    Yellow:{" "}
                    <StatusDot
                        style={{ marginLeft: 10 }}
                        color={StatusDotColor.Yellow}
                        size={16}
                    />
                </Flex>
                <Flex>
                    Green:{" "}
                    <StatusDot
                        style={{ marginLeft: 10 }}
                        color={StatusDotColor.Green}
                        size={16}
                    />
                </Flex>
            </CatalogItem>

            {/* Tabs */}
            <CatalogItem title="Tabs">
                <Tabs
                    selected={tab}
                    onTab={setTab}
                    tabs={{
                        left: <>Left selected</>,
                        right: <>Right selected</>,
                    }}
                />
            </CatalogItem>

            {/* TitledSection */}
            <CatalogItem title="TitledSection">
                <TitledSection top={<h1>Title of titled section</h1>}>
                    Body of titled section
                </TitledSection>
            </CatalogItem>

            {/* FeesBlock */}
            <CatalogItem title="FeesBlock">
                <h4>Standard</h4>
                <FeesBlock
                    quoteCurrency={quoteCurrency}
                    isOperator={true}
                    earningFees={true}
                    withdrawable={withdrawableRewards}
                    pending={claimableRewards}
                    withdrawCallback={async () => {}}
                />
                <hr />
                <h4>Combined page</h4>
                <FeesBlock
                    className="withdraw-all"
                    quoteCurrency={quoteCurrency}
                    isOperator={true}
                    earningFees={true}
                    withdrawable={withdrawableRewards}
                    pending={claimableRewards}
                    withdrawCallback={async () => {}}
                />
            </CatalogItem>

            {/* GasBlock */}
            <CatalogItem title="GasBlock">
                <GasBlock
                    darknodeBalance={oneEth.times(0.123)}
                    loggedIn={isDefined(address)}
                    userBalance={balance}
                    topUpCallBack={defaultCallback}
                />
            </CatalogItem>

            {/* DarknodeName */}
            <CatalogItem title="DarknodeName">
                <DarknodeName
                    renaming={renaming}
                    setRenaming={setRenaming}
                    darknodeID={defaultDarknodeID}
                    name={name}
                    isOperator={true}
                    storeDarknodeName={(_, name) => setName(name)}
                />
            </CatalogItem>
        </div>
    );
};
