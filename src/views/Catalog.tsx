import BigNumber from "bignumber.js";
import { Map } from "immutable";
import React, { useCallback, useMemo, useState } from "react";
import { Point } from "react-simple-maps";

import { sleep } from "@renproject/react-components";

import { SECONDS } from "../controllers/common/BackgroundTasks";
import { DarknodeAction } from "../controllers/pages/darknodePage/DarknodePage";
import { NodeStatistics } from "../lib/darknode/jsonrpc";
import { RegistrationStatus } from "../lib/ethereum/contractReads";
import { isDefined } from "../lib/general/isDefined";
import { classNames } from "../lib/react/className";
import { GraphContainer } from "../store/graphContainer";
import { NetworkContainer } from "../store/networkContainer";
import { Web3Container } from "../store/web3Container";
import { Change } from "./Change";
import { DarknodeName } from "./darknodeBlocks/DarknodeName";
import { EpochBlock } from "./darknodeBlocks/EpochBlock";
import { FeesBlock } from "./darknodeBlocks/FeesBlock";
import { GasBlock } from "./darknodeBlocks/GasBlock";
import { NetworkBlock } from "./darknodeBlocks/NetworkBlock";
import { ResourcesBlock } from "./darknodeBlocks/ResourcesBlock";
import {
    DarknodeConnectionStatus,
    VersionBlock,
} from "./darknodeBlocks/VersionBlock";
import { DarknodeCard } from "./darknodeCards/DarknodeCard";
import { EmptyDarknodeCard } from "./darknodeCards/EmptyDarknodeCard";
import { DarknodeID } from "./DarknodeID";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { EpochProgress } from "./EpochProgress";
import { InfoLabel } from "./infoLabel/InfoLabel";
import { Registration } from "./Registration";
import { Stat, Stats } from "./Stat";
import { StatusDot, StatusDotColor } from "./StatusDot";
import { Tabs } from "./Tabs";
import { TitledSection } from "./TitledSection";
import { TokenIcon } from "./tokenIcon/TokenIcon";

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

const defaultDarknodeID = "0x0000000000000000000000000000000000000000";

const oneEth = new BigNumber(10).exponentiatedBy(18);

const defaultNodeStatistics = new NodeStatistics({
    version: "1.0.11-release/0.2.25-dffac04",
    multiAddress:
        "/ip4/165.22.193.227/tcp/18514/ren/8MJWSxiNmY3ghCYYo14yB1VPq7Su5h",
    memory: 1033392128,
    memoryUsed: 273891328,
    memoryFree: 657330176,
    disk: 25832407040,
    diskUsed: 4701102080,
    diskFree: 21114527744,
    systemUptime: 33462611,
    serviceUptime: 259088,
    cores: 1,
});

const defaultDarknodeLocations = Map<
    string,
    { darknodeID: string; point: Point }
>()
    .set("8MGMnxzVuTESp8nMQGtXVjqLX7c54e", {
        darknodeID: "8MGMnxzVuTESp8nMQGtXVjqLX7c54e",
        point: [2.165068287374475, 48.697668287374476],
    })
    .set("8MGWsPMRNhgbCePqGU6Rk8SpUWrwLt", {
        darknodeID: "8MGWsPMRNhgbCePqGU6Rk8SpUWrwLt",
        point: [5.677960365237794, 53.09076036523779],
    })
    .set("8MGvowp18gG3qZsvDNEWBaPgSkMB8g", {
        darknodeID: "8MGvowp18gG3qZsvDNEWBaPgSkMB8g",
        point: [-73.25160764809007, 45.83269235190993],
    });

export const Catalog = () => {
    const { address, balance, promptLogin, web3BrowserName } =
        Web3Container.useContainer();
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
    const updateName = useCallback(
        (_darknodeID, newName) => setName(newName),
        [setName],
    );

    const loginCallback = useMemo(
        () => async () => {
            await promptLogin({ manual: true });
        },
        [promptLogin],
    );

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
                    <TokenIcon token={"ArbETH"} white={true} />
                    <TokenIcon token={"AVAX"} white={true} />
                    <TokenIcon token={"BADGER"} white={true} />
                    <TokenIcon token={"BCH"} white={true} />
                    <TokenIcon token={"BNB"} white={true} />
                    <TokenIcon token={"BTC"} white={true} />
                    <TokenIcon token={"BUSD"} white={true} />
                    <TokenIcon token={"CRV"} white={true} />
                    <TokenIcon token={"DAI"} white={true} />
                    <TokenIcon token={"DGB"} white={true} />
                    <TokenIcon token={"DOGE"} white={true} />
                    <TokenIcon token={"ETH"} white={true} />
                    <TokenIcon token={"EURT"} white={true} />
                    <TokenIcon token={"FIL"} white={true} />
                    <TokenIcon token={"FTM"} white={true} />
                    <TokenIcon token={"FTT"} white={true} />
                    <TokenIcon token={"gETH"} white={true} />
                    <TokenIcon token={"KNC"} white={true} />
                    <TokenIcon token={"LINK"} white={true} />
                    <TokenIcon token={"LUNA"} white={true} />
                    <TokenIcon token={"MATIC"} white={true} />
                    <TokenIcon token={"MIM"} white={true} />
                    <TokenIcon token={"REN"} white={true} />
                    <TokenIcon token={"ROOK"} white={true} />
                    <TokenIcon token={"SUSHI"} white={true} />
                    <TokenIcon token={"UNI"} white={true} />
                    <TokenIcon token={"USDC"} white={true} />
                    <TokenIcon token={"USDT"} white={true} />
                    <TokenIcon token={"ZEC"} white={true} />
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

            {/* EpochBlock */}
            <CatalogItem title="EpochBlock">
                <EpochBlock
                    timeSinceLastEpoch={new BigNumber(5)}
                    timeUntilNextEpoch={new BigNumber(10)}
                    minimumEpochInterval={new BigNumber(15)}
                />
            </CatalogItem>

            {/* Registration */}
            <CatalogItem title="Registration">
                <h4>Loading</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Unknown}
                    operator={null}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>No operator</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Unregistered}
                    operator={null}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Register</h4>
                <Registration
                    action={DarknodeAction.Register}
                    address={address}
                    registrationStatus={RegistrationStatus.Unregistered}
                    operator={null}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Registration Pending</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.RegistrationPending}
                    operator={address}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.RegistrationPending}
                    operator={"0x408e41876cccdc0f92210600ef50372656052a38"}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Registered</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Registered}
                    operator={address}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Registered}
                    operator={"0x408e41876cccdc0f92210600ef50372656052a38"}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Registration Pending</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={
                        RegistrationStatus.DeregistrationPending
                    }
                    operator={address}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={
                        RegistrationStatus.DeregistrationPending
                    }
                    operator={"0x408e41876cccdc0f92210600ef50372656052a38"}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Awaiting refund</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Deregistered}
                    operator={address}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Deregistered}
                    operator={"0x408e41876cccdc0f92210600ef50372656052a38"}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <hr />
                <h4>Refundable</h4>
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Refundable}
                    operator={address}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
                />
                <Registration
                    action={DarknodeAction.View}
                    address={address}
                    registrationStatus={RegistrationStatus.Refundable}
                    operator={"0x408e41876cccdc0f92210600ef50372656052a38"}
                    web3BrowserName={web3BrowserName}
                    loginCallback={loginCallback}
                    registerCallback={defaultCallback}
                    deregisterCallback={defaultCallback}
                    refundCallback={defaultCallback}
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
                    canWithdraw={true}
                    withdrawable={withdrawableRewards}
                    pending={claimableRewards}
                    withdrawCallback={defaultCallback}
                />
                <hr />
                <h4>Combined page</h4>
                <FeesBlock
                    className="withdraw-all"
                    quoteCurrency={quoteCurrency}
                    isOperator={true}
                    earningFees={true}
                    canWithdraw={true}
                    withdrawable={withdrawableRewards}
                    pending={claimableRewards}
                    withdrawCallback={defaultCallback}
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
                    storeDarknodeName={updateName}
                />
            </CatalogItem>

            {/* EmptyDarknodeCard */}
            <CatalogItem title="EmptyDarknodeCard">
                <EmptyDarknodeCard />
            </CatalogItem>

            {/* DarknodeCard */}
            <CatalogItem title="DarknodeCard">
                <h4>Registered</h4>
                <DarknodeCard
                    darknodeID={defaultDarknodeID}
                    name={name}
                    registrationStatus={RegistrationStatus.Registered}
                    feesEarnedInUsd={new BigNumber(10)}
                    ethBalance={oneEth.times(0.1)}
                    quoteCurrency={quoteCurrency}
                    removeDarknode={defaultCallback}
                />
                <hr />
                <h4>Loading</h4>
                <DarknodeCard
                    darknodeID={defaultDarknodeID}
                    name={name}
                    registrationStatus={null}
                    feesEarnedInUsd={null}
                    ethBalance={null}
                    quoteCurrency={quoteCurrency}
                    removeDarknode={defaultCallback}
                />
            </CatalogItem>

            {/* VersionBlock */}
            <CatalogItem title="VersionBlock">
                <h4>Up to date</h4>
                <VersionBlock
                    status={DarknodeConnectionStatus.Connected}
                    darknodeVersion={"1.0.0"}
                    latestVersion={"1.0.0"}
                    latestVersionDaysAgo={"10 days ago"}
                />
                <hr />
                <h4>Out of date</h4>
                <VersionBlock
                    status={DarknodeConnectionStatus.Connected}
                    darknodeVersion={"1.0.0"}
                    latestVersion={"1.0.1"}
                    latestVersionDaysAgo={"3 days ago"}
                />
                <hr />
                <h4>Bootstrapping</h4>
                <VersionBlock
                    status={DarknodeConnectionStatus.Bootstrapping}
                    darknodeVersion={"1.0.0"}
                    latestVersion={"1.0.0"}
                    latestVersionDaysAgo={"3 days ago"}
                />
                <hr />
                <h4>Connecting</h4>
                <VersionBlock
                    status={DarknodeConnectionStatus.Connecting}
                    darknodeVersion={null}
                    latestVersion={null}
                    latestVersionDaysAgo={null}
                />
                <hr />
                <h4>Unable to connect</h4>
                <VersionBlock
                    status={DarknodeConnectionStatus.NotConnected}
                    darknodeVersion={null}
                    latestVersion={"1.0.0"}
                    latestVersionDaysAgo={"3 days ago"}
                />
            </CatalogItem>

            {/* NetworkBlock */}
            <CatalogItem title="NetworkBlock">
                <NetworkBlock
                    darknodeID={defaultDarknodeID}
                    nodeStatistics={defaultNodeStatistics}
                />
            </CatalogItem>

            {/* ResourcesBlock */}
            <CatalogItem title="ResourcesBlock">
                <ResourcesBlock nodeStatistics={defaultNodeStatistics} />
            </CatalogItem>

            {/* DarknodeMap */}
            <CatalogItem title="DarknodeMap">
                <DarknodeMap darknodes={defaultDarknodeLocations} />
            </CatalogItem>
        </div>
    );
};
