import BigNumber from "bignumber.js";
import { List, OrderedMap, OrderedSet } from "immutable";
import Web3 from "web3";
import { sha3, toChecksumAddress } from "web3-utils";

import { ApolloClient } from "@apollo/react-hooks";
import { RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";

import { updatePrices } from "../../controllers/common/tokenBalanceUtils";
import { getLightnode } from "../../store/mapContainer";
import { DarknodesState } from "../../store/networkContainer";
import { darknodeIDHexToBase58 } from "../darknode/darknodeID";
import { queryStat } from "../darknode/jsonrpc";
import { isDefined } from "../general/isDefined";
import { safePromiseAllList } from "../general/promiseAll";
import { Darknode, queryDarknode } from "../graphQL/queries/darknode";
import { TokenAmount } from "../graphQL/queries/queries";
import { RenVM } from "../graphQL/queries/renVM";
import { catchBackgroundException } from "../react/errors";
import { retryNTimes } from "../retryNTimes";
import { getDarknodePayment, getDarknodeRegistry, getGatewayRegistry, getRenAsset } from "./contract";
import { getDarknodeStatus, isRegisteredInEpoch } from "./darknodeStatus";
import { Token, TokenPrices, TokenString } from "./tokens";
import { getReadOnlyWeb3 } from "./getWeb3";

export const NULL = "0x0000000000000000000000000000000000000000";

/**
 * Remove "0x" prefix from a hex string if there is one.
 *
 * @example
 * strip0x("0x1234") // "1234"
 * strip0x("1234")   // "1234"
 *
 * @param hex The string to remove "0x" from.
 */
const strip0x = (hex: string): string =>
    hex.substring(0, 2) === "0x" ? hex.slice(2) : hex;

/**
 * Add a "0x" prefix to a hex value, converting to a string if required.
 *
 * @example
 * Ox("1234")               // 0x1234
 * Ox("0x1234")             // 0x1234
 * Ox(Buffer([0x12, 0x34])) // 0x1234
 *
 * @param hex The string or Buffer to add "0x" to.
 */
export const Ox = (hex: string | Buffer | number | BigNumber): string => {
    const hexString =
        typeof hex === "string"
            ? hex
            : Buffer.isBuffer(hex)
            ? hex.toString("hex")
            : new BigNumber(hex).toString(16);
    return hexString.substring(0, 2) === "0x" ? hexString : `0x${hexString}`;
};

// ////////////////////////////////////////////////////////////////////////// //
// Darknode Registry contract /////////////////////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////// //

export enum RegistrationStatus {
    Unknown = "",
    Unregistered = "unregistered",
    RegistrationPending = "registration pending",
    Registered = "registered",
    DeregistrationPending = "deregistration pending",
    Deregistered = "awaiting refund period",
    Refundable = "refundable",
}

/**
 * Find the darknodes by reading the logs of the Darknode Registry.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param fromBlock The starting block to look at logs for.
 * @returns An immutable set of darknode IDs (as hex strings).
 */
const retrieveDarknodesInLogs = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    fromBlock: string | number,
    operatorAddress: string,
): Promise<
    OrderedSet<{ darknodeID: string; operator: string | undefined }>
> => {
    let darknodes = OrderedSet<{
        darknodeID: string;
        operator: string | undefined;
    }>();

    /**
     * Sample log:
     * ```json
     * {
     *     address: "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5",
     *     blockHash: "0xfab9c0e4d7ccca3e56d6961fbe17917923898828b3f929093e6b976b8727db39",
     *     blockNumber: 9740948,
     *     data: "0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d92000000000000000000000000000000000000\
     *     00000000152d02c7e14af6800000",
     *     id: "log_98d2346b",
     *     logIndex: 2,
     *     removed: false,
     *     topics: ["0xd2819ba4c736158371edf0be38fd8d1fc435609832e392f118c4c79160e5bd7b"],
     *     transactionHash: "0x8ed0e53dffda6c356e25cb1ac3ebe7a69bcab8ebf668a7b2e770480bdb47598b",
     *     transactionIndex: 2,
     *     transactionLogIndex: "0x2",
     *     type: "mined",
     * }
     * ```
     */

    let recentRegistrationEvents = await web3.eth.getPastLogs({
        address: renNetwork.addresses.ren.DarknodeRegistry.address,
        fromBlock,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        topics: [sha3("LogDarknodeRegistered(address,uint256)")],
    });
    const recentRegistrationEvents2 = await web3.eth.getPastLogs({
        address: renNetwork.addresses.ren.DarknodeRegistry.address,
        fromBlock,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        topics: [
            sha3("LogDarknodeRegistered(address,address,uint256)"),
            "0x000000000000000000000000" + strip0x(operatorAddress),
        ],
    });
    recentRegistrationEvents = recentRegistrationEvents.concat(
        recentRegistrationEvents2,
    );
    for (const event of recentRegistrationEvents) {
        // The log data returns back like this:
        // 0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d9200000000000000000000000000000000000000000000152d02c7e14af6800000
        // and we want to extract this: 0x945458e071eca54bb534d8ac7c8cd1a3eb318d92 (20 bytes, 40 characters long)
        const prefixLength = 2;
        const dataLength = 64;
        const addressLength = 40;
        const start = dataLength + prefixLength - addressLength; // 26

        let darknodeID;
        let operator;
        if (event.topics.length === 3) {
            darknodeID = toChecksumAddress(
                `0x${(event.topics[2] as string).substr(start, addressLength)}`,
            );
            operator = toChecksumAddress(
                `0x${(event.topics[1] as string).substr(start, addressLength)}`,
            );
        } else {
            darknodeID = toChecksumAddress(
                `0x${event.data.substr(start, addressLength)}`,
            );
        }
        darknodes = darknodes.add({ darknodeID, operator });
    }

    // Note: Deregistration events are not included because we are unable to retrieve the operator
    // const recentDeregistrationEvents = await web3.eth.getPastLogs({
    //     address: contracts.DarknodeRegistry.address,
    //     fromBlock: renNetwork.addresses.ren.DarknodeRegistry.block || "0x600000",
    //     toBlock: "latest",
    //     topics: [sha3("LogDarknodeDeregistered(address)"), null],
    // });
    // for (const event of recentDeregistrationEvents) {
    //     const darknodeID = toChecksumAddress("0x" + event.data.substr(26, 40));
    //     darknodes.push(darknodeID);
    // }

    return darknodes;
};

/**
 * Find the darknodes for an operator.
 *
 * Currently, the LogDarknodeRegistered logs don't include the registrar, so
 * instead we loop through every darknode and get it's owner first.
 * This would be a lot faster if the logs indexed the operator! 🤦
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param operatorAddress The address of the operator to look up darknodes for.
 * @param onDarknode An optional callback to retrieve darknodes as they are
 * found, instead of waiting for all of them to be returned together.
 * @returns An immutable set of darknode IDs (as hex strings).
 */
export const getOperatorDarknodes = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    operatorAddress: string,
    reportProgress?: (progress: number, total: number) => void,
    onDarknode?: (darknodeID: string) => void,
): Promise<OrderedSet<string>> => {
    let darknodes = OrderedSet<{
        darknodeID: string;
        operator: string | undefined;
    }>();

    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    operatorAddress = toChecksumAddress(operatorAddress);

    const fromBlock = renNetwork.addresses.ren.DarknodeRegistry.block || "0x00";

    darknodes = darknodes.concat(
        await retrieveDarknodesInLogs(
            web3,
            renNetwork,
            fromBlock,
            operatorAddress,
        ),
    );

    const operatorPromises = darknodes
        .map(async ({ operator, darknodeID }) => {
            if (operator) {
                return [darknodeID, operator];
            } else {
                // For backwards compatibility.
                return [
                    darknodeID,
                    await retryNTimes(
                        async () =>
                            await darknodeRegistry.methods
                                .getDarknodeOperator(darknodeID)
                                .call(/**/),
                        2,
                    ),
                ] as [string, string];
            }
        })
        .toArray();

    let operatorDarknodes = OrderedSet<string>();

    for (let i = 0; i < operatorPromises.length; i++) {
        if (reportProgress) {
            reportProgress(i, operatorPromises.length);
        }
        const [darknodeID, operator] = await operatorPromises[i];
        if (
            operator.toLowerCase() === operatorAddress.toLowerCase() &&
            !operatorDarknodes.contains(operatorAddress)
        ) {
            operatorDarknodes = operatorDarknodes.add(darknodeID);
            if (onDarknode) {
                onDarknode(darknodeID);
            }
        }
    }

    if (reportProgress) {
        reportProgress(operatorPromises.length, operatorPromises.length);
    }

    return operatorDarknodes;
};

// ////////////////////////////////////////////////////////////////////////// //
// Darknode Payment contract //////////////////////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////// //

/**
 * Retrieves the balances from the DarknodePayment contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @returns Returns a promise to an immutable map from token codes to balances
 * as BigNumbers.
 */
const getBalances = (
    darknode: Darknode | null,
): OrderedMap<TokenString, TokenAmount | null> => {
    let balances = OrderedMap<string, TokenAmount | null>();
    if (isDefined(darknode)) {
        balances = darknode.balances
            .filter((asset) => asset.asset !== null)
            .reduce((map, asset, token) => map.set(token, asset), balances);
    }

    return balances;
};

const getBalancesWithInfura = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    renVM: RenVM,
    tokenPrices: TokenPrices | null,
): Promise<OrderedMap<TokenString, TokenAmount | null>> => {
    const darknodePayment = getDarknodePayment(web3, renNetwork);

    let feesEarned = OrderedMap<TokenString, TokenAmount | null>();

    // const address = (await web3.eth.getAccounts())[0];

    const balances = await safePromiseAllList(
        List(
            renVM.assets
                .map(async (asset) => {
                    const { symbol, tokenAddress, decimals } = asset;
                    const token = symbol
                        .replace(/^ren/, "")
                        .replace(/^test/, "")
                        .replace(/^dev/, "");
                    let tokenBalance;
                    try {
                        const balance1Call = await retryNTimes(
                            async () =>
                                await darknodePayment.methods
                                    .darknodeBalances(darknodeID, tokenAddress)
                                    .call(/**/),
                            2,
                        );
                        tokenBalance = new BigNumber(
                            (balance1Call || "0").toString(),
                        );
                    } catch (error) {
                        catchBackgroundException(
                            error,
                            "Error in contractReads > darknodeBalances",
                        );
                        tokenBalance = new BigNumber(0);
                    }

                    let amountInEth: BigNumber | undefined;
                    let amountInUsd: BigNumber | undefined;

                    if (tokenPrices) {
                        const price = tokenPrices.get(
                            token as Token,
                            undefined,
                        );
                        amountInEth = tokenBalance
                            .div(Math.pow(10, decimals))
                            .multipliedBy(
                                price ? price.get(Currency.ETH, 0) : 0,
                            );
                        amountInUsd = tokenBalance
                            .div(Math.pow(10, decimals))
                            .multipliedBy(
                                price ? price.get(Currency.USD, 0) : 0,
                            );
                    }

                    const balance = {
                        symbol: token,
                        amount: tokenBalance,
                        amountInEth: amountInEth || new BigNumber(0),
                        amountInUsd: amountInUsd || new BigNumber(0),
                        asset,
                    };

                    return {
                        balance, // .plus(balance2),
                        token,
                    };
                })
                .values(),
        ),
        null,
    );

    for (const balance of balances.toArray()) {
        if (balance && balance.token && balance.balance.amount.gt(1)) {
            feesEarned = feesEarned.set(balance.token, balance.balance);
        }
    }

    return feesEarned;
};

export enum DarknodeFeeStatus {
    BLACKLISTED = "BLACKLISTED",
    CLAIMED = "CLAIMED",
    NOT_CLAIMED = "NOT_CLAIMED",
    NOT_WHITELISTED = "NOT_WHITELISTED",
}

const getDarknodeCycleRewards = (
    renVM: RenVM,
    darknode: Darknode | null,
    registrationStatus: RegistrationStatus,
) => {
    // Cycle status ///////////////////////////////////////////////////////// //

    let previousStatus;
    const isRegisteredInPreviousEpoch =
        darknode && isRegisteredInEpoch(darknode, renVM.previousEpoch);
    const currentStatus =
        registrationStatus === RegistrationStatus.Registered
            ? DarknodeFeeStatus.NOT_CLAIMED
            : DarknodeFeeStatus.NOT_WHITELISTED;
    if (!isRegisteredInPreviousEpoch) {
        previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
    } else {
        const claimed =
            darknode &&
            (renVM.previousCycle === darknode.lastClaimedEpoch ||
                renVM.previousCycle === darknode.previousLastClaimedEpoch);
        if (claimed) {
            previousStatus = DarknodeFeeStatus.CLAIMED;
        } else {
            previousStatus = DarknodeFeeStatus.NOT_CLAIMED;
        }
    }

    let cycleStatus = OrderedMap<string, DarknodeFeeStatus>();
    if (isDefined(renVM.currentCycle)) {
        cycleStatus = cycleStatus.set(
            renVM.currentCycle.toString(),
            currentStatus,
        );
    }
    if (isDefined(renVM.previousCycle)) {
        cycleStatus = cycleStatus.set(
            renVM.previousCycle.toString(),
            previousStatus,
        );
    }

    return cycleStatus;
};

/**
 * Fetches various pieces of information about a darknode, including:
 * 1. balances and fees
 * 2. its status
 * 3. its gas usage information
 * 4. its network information (NOTE: not implemented yet)
 *
 * @param client GraphQL client connected to RenVM subgraph.
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @param tokenPrices
 * @returns A promise to the darknode state record.
 */
export const fetchDarknodeDetails = async (
    client: ApolloClient<object>,
    renVM: RenVM,
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
    useInfura: boolean,
): Promise<DarknodesState> => {
    darknodeID = toChecksumAddress(darknodeID.toLowerCase());

    const darknode = await queryDarknode(client, darknodeID);

    // Get registration status
    const registrationStatus = darknode
        ? getDarknodeStatus(darknode, renVM)
        : RegistrationStatus.Unregistered;

    // Get eth Balance
    const πEthBalance = web3.eth
        .getBalance(darknodeID)
        .then((ethBalanceBN) =>
            ethBalanceBN
                ? new BigNumber(ethBalanceBN.toString())
                : new BigNumber(0),
        )
        .catch(() => null);

    // Call queryStats
    const πNodeStatistics = queryStat(
        getLightnode(renNetwork),
        darknodeIDHexToBase58(darknodeID),
    ).catch((_error) => /* ignore */ null);

    const cycleStatus = getDarknodeCycleRewards(
        renVM,
        darknode,
        registrationStatus,
    );

    // Get earned fees TODO: fees darknode fees are here
    let feesEarned = !useInfura
        ? getBalances(darknode)
        : await getBalancesWithInfura(
              web3,
              renNetwork,
              darknodeID,
              renVM,
              tokenPrices,
          );
    feesEarned = updatePrices(feesEarned, tokenPrices);

    let feesEarnedInEth: BigNumber | null = null;
    if (tokenPrices) {
        feesEarnedInEth = feesEarned
            .map((fee) => (fee ? fee.amountInEth : new BigNumber(0)))
            .reduce((acc, fee) => acc.plus(fee), new BigNumber(0));
    }

    let feesEarnedInUsd: BigNumber | null = null;
    if (tokenPrices) {
        feesEarnedInUsd = feesEarned
            .map((fee) => (fee ? fee.amountInUsd : new BigNumber(0)))
            .reduce((acc, fee) => acc.plus(fee), new BigNumber(0));
    }

    return new DarknodesState({
        ID: darknodeID,
        multiAddress: "" as string,
        ethBalance: await πEthBalance,
        feesEarned,
        feesEarnedInEth,
        feesEarnedInUsd,

        cycleStatus,
        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,
        peers: 0,
        registrationStatus,
        operator: darknode ? darknode.operator : undefined,

        nodeStatistics: await πNodeStatistics,
    });
};

const registries = {
    "Arbitrum": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Avalanche": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "BinanceSmartChain": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Catalog": "0x44c2CdaE368F90544A01522C413376fC72ebd4F2",
    "Ethereum": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Fantom": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Kava": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Moonbeam": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Optimism": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Polygon": "0xf36666C230Fa12333579b9Bd6196CB634D6BC506",
    "Solana": "REGrPFKQhRneFFdUV3e9UDdzqUJyS6SKj88GdXFCRd2"
}

const getRegistry = (chain: string) => {
    if(registries[chain]){
        return registries[chain]
    }
    return "";
}
/* eslint-disable */
export const rpcUrls = {
    "Ethereum": [
        "https://cloudflare-eth.com",
        "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
        "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
        "https://api.mycryptoapi.com/eth"
    ],
    "BinanceSmartChain": [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://bsc-dataseed4.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed2.defibit.io",
        "https://bsc-dataseed3.defibit.io",
        "https://bsc-dataseed4.defibit.io",
        "https://bsc-dataseed1.ninicoin.io",
        "https://bsc-dataseed2.ninicoin.io",
        "https://bsc-dataseed3.ninicoin.io",
        "https://bsc-dataseed4.ninicoin.io",
        "wss://bsc-ws-node.nariox.org",
        "https://bsc-dataseed.binance.org",
        "https://rpc.ankr.com/bsc",
        "https://bscrpc.com",
        "https://bsc.mytokenpocket.vip",
        "https://binance.nodereal.io",
        "https://rpc-bsc.bnb48.club"
    ],
    "Polygon": [
        "https://polygon-rpc.com",
        "https://rpc-mainnet.matic.network",
        "https://matic-mainnet.chainstacklabs.com",
        "https://rpc-mainnet.maticvigil.com",
        "https://rpc-mainnet.matic.quiknode.pro",
        "https://matic-mainnet-full-rpc.bwarelabs.com",
        "https://matic-mainnet-archive-rpc.bwarelabs.com",
        "https://poly-rpc.gateway.pokt.network",
        "https://rpc.ankr.com/polygon",
        "https://polygon-mainnet.public.blastapi.io",
        "https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}",
        "wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
    ],
    "Avalanche": [
        "https://api.avax.network/ext/bc/C/rpc",
        "https://rpc.ankr.com/avalanche",
        "https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc"
    ],
    "Arbitrum": [
        "https://arb1.arbitrum.io/rpc",
        "https://rpc.ankr.com/arbitrum",
        "https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
    ],
    "Fantom": [
        "https://rpc.ftm.tools",
        "https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac",
        "https://rpc.ankr.com/fantom",
        "https://rpc.fantom.network",
        "https://rpc2.fantom.network",
        "https://rpc3.fantom.network",
        "https://rpcapi.fantom.network",
        "https://fantom-mainnet.public.blastapi.io"
    ],
    "Kava": [
        "https://evm.kava.io",
        "https://evm2.kava.io",
        "wss://wevm.kava.io",
        "wss://wevm2.kava.io"
    ],
    "Moonbeam": [
        "https://rpc.api.moonbeam.network",
        "wss://wss.api.moonbeam.network"
    ],
    "Optimism": [
        "https://mainnet.optimism.io/",
        "https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}",
        "wss://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
    ]
}

export const getRpcUrl  = (chain: string) => {
    if(rpcUrls[chain]){
        return rpcUrls[chain][0];
    }
    return "";
}

const solanaBalances = {
    BTC: 2900000000
}

export const fetchTokenTotalSupply = async (chain: string, tokenSymbol: string) => {
    if (chain === "Solana"){
        return new BigNumber(solanaBalances[tokenSymbol])
    }
    const registryAddress = getRegistry(chain);
    const rpcUrl = getRpcUrl(chain);
    const web3 = getReadOnlyWeb3(rpcUrl);
    const registry = getGatewayRegistry(web3, registryAddress);
    console.log("r:fetchTokenTotalSupply", chain, registryAddress, registry);
    (window as any).registry = registry;
    const tokenAddress = await registry.methods.getTokenBySymbol(tokenSymbol).call();
    console.log("r:token", tokenAddress);
    const token = await getRenAsset(web3, tokenAddress);
    const supply = await token.methods.totalSupply().call();
    console.log("r:supply", supply);
    return supply;
}
