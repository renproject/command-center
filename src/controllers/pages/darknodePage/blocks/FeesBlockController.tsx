import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    darknodeIDBase58ToRenVmID,
    darknodeIDHexToBase58,
} from "../../../../lib/darknode/darknodeID";
import { claimFees } from "../../../../lib/darknode/jsonrpc";
import { getNodeFeesCollection } from "../../../../lib/darknode/utils/feesUtils";

import {
    DarknodeFeeStatus,
    RegistrationStatus,
} from "../../../../lib/ethereum/contractReads";
import { TokenString } from "../../../../lib/ethereum/tokens";
import { TokenAmount } from "../../../../lib/graphQL/queries/queries";
import { classNames } from "../../../../lib/react/className";
import { claimFeesDigest } from "../../../../lib/web3/signatures";
import { GraphContainer } from "../../../../store/graphContainer";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { PopupContainer } from "../../../../store/popupContainer";
import { UIContainer } from "../../../../store/uiContainer";
import { Web3Container } from "../../../../store/web3Container";
import { FeesBlock } from "../../../../views/darknodeBlocks/FeesBlock";
import { NotClaimed } from "../../../../views/popups/NotClaimed";
import { Popup } from "../../../common/popups/Popup";
import { PopupError } from "../../../common/popups/PopupController";
import { updatePrices } from "../../../common/tokenBalanceUtils";

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
}

export const mergeFees = (
    left: OrderedMap<TokenString, TokenAmount | null>,
    right: OrderedMap<TokenString, TokenAmount | null>,
) => {
    let newFees = OrderedMap<TokenString, TokenAmount | null>();

    for (const token of left
        .keySeq()
        .concat(right.keySeq())
        .toSet()
        .toArray()) {
        const leftFee = left.get(token, null);
        const rightFee = right.get(token, null);
        const newFee: TokenAmount | null =
            leftFee || rightFee
                ? {
                      symbol:
                          (leftFee && leftFee.symbol) ||
                          (rightFee && rightFee.symbol) ||
                          "",
                      asset: (leftFee && leftFee.asset) ||
                          (rightFee && rightFee.asset) || { decimals: 0 },
                      amount: new BigNumber(0)
                          .plus(leftFee ? leftFee.amount : new BigNumber(0))
                          .plus(rightFee ? rightFee.amount : new BigNumber(0)),
                      amountInEth: new BigNumber(0)
                          .plus(
                              leftFee ? leftFee.amountInEth : new BigNumber(0),
                          )
                          .plus(
                              rightFee
                                  ? rightFee.amountInEth
                                  : new BigNumber(0),
                          ),
                      amountInUsd: new BigNumber(0)
                          .plus(
                              leftFee ? leftFee.amountInUsd : new BigNumber(0),
                          )
                          .plus(
                              rightFee
                                  ? rightFee.amountInUsd
                                  : new BigNumber(0),
                          ),
                  }
                : null;
        newFees = newFees.set(token, newFee);
    }
    return newFees;
};

export const FeesBlockController: React.FC<Props> = ({
    isOperator,
    darknodeDetails,
}) => {
    const { quoteCurrency, pendingRewards } = NetworkContainer.useContainer();
    const { renVM, subgraphOutOfSync } = GraphContainer.useContainer();
    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { currentCycle, previousCycle, timeSinceLastEpoch } = renVM || {};
    const {
        claimWarningShown,
        setClaimWarningShown,
    } = UIContainer.useContainer();

    const [disableClaim, setDisableClaim] = useState(false);

    const [currentCycleStatus, setCurrentCycleStatus] = useState<string | null>(
        null,
    );

    const cycleStatus: string | null = useMemo(
        () => darknodeDetails && darknodeDetails.cycleStatus.keySeq().first(),
        [darknodeDetails],
    );

    useEffect(() => {
        setCurrentCycleStatus(cycleStatus);
        if (disableClaim && cycleStatus !== currentCycleStatus) {
            setDisableClaim(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycleStatus]);

    const showPreviousPending =
        previousCycle &&
        darknodeDetails &&
        darknodeDetails.cycleStatus.get(previousCycle) ===
            DarknodeFeeStatus.NOT_CLAIMED &&
        !subgraphOutOfSync;
    const showCurrentPending =
        currentCycle &&
        darknodeDetails &&
        darknodeDetails.cycleStatus.get(currentCycle) ===
            DarknodeFeeStatus.NOT_CLAIMED;

    const earningFees: boolean =
        !!darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Registered;

    const canWithdraw: boolean =
        !!darknodeDetails &&
        (darknodeDetails.registrationStatus === RegistrationStatus.Registered ||
            darknodeDetails.registrationStatus ===
                RegistrationStatus.DeregistrationPending);

    useEffect(() => {
        // If the darknode hasn't claimed within 1 day of a new epoch, show a
        // warning popup.
        const day = moment.duration(5, "hours").asSeconds();
        if (
            isOperator &&
            !claimWarningShown &&
            showPreviousPending &&
            earningFees &&
            timeSinceLastEpoch &&
            timeSinceLastEpoch.gt(day)
        ) {
            setClaimWarningShown(true);
            setPopup({
                popup: <NotClaimed onCancel={clearPopup} />,
                onCancel: clearPopup,
                dismissible: true,
                overlay: true,
            });
        }
    }, [
        showPreviousPending,
        timeSinceLastEpoch,
        claimWarningShown,
        setClaimWarningShown,
        clearPopup,
        setPopup,
        earningFees,
        isOperator,
    ]);

    let summedPendingRewards = OrderedMap<string, TokenAmount | null>();
    if (previousCycle && showPreviousPending) {
        pendingRewards.get(previousCycle, OrderedMap());
        // summedPendingRewards = OrderedMap();
    }
    if (currentCycle && showCurrentPending) {
        summedPendingRewards = pendingRewards.get(currentCycle, OrderedMap());
    }
    if (
        previousCycle &&
        currentCycle &&
        showPreviousPending &&
        showCurrentPending
    ) {
        summedPendingRewards = mergeFees(
            pendingRewards.get(previousCycle, OrderedMap()),
            pendingRewards.get(currentCycle, OrderedMap()),
        );
    }

    // TODO: fees here are being splitted to withdrawable / pending
    const withdrawable = darknodeDetails ? darknodeDetails.feesEarned : null;
    const pending = summedPendingRewards;

    const {
        withdrawReward,
        updateDarknodeDetails,
    } = NetworkContainer.useContainer();

    const withdrawCallback = useCallback(
        async (tokenSymbol: string, tokenAddress: string) => {
            if (!darknodeDetails) {
                return;
            }
            await withdrawReward(
                [darknodeDetails.ID],
                tokenSymbol,
                tokenAddress,
            );
            await updateDarknodeDetails(darknodeDetails.ID);
        },
        [darknodeDetails, withdrawReward, updateDarknodeDetails],
    );

    return (
        <FeesBlock
            quoteCurrency={quoteCurrency}
            isOperator={isOperator}
            earningFees={earningFees}
            canWithdraw={canWithdraw}
            withdrawable={withdrawable}
            pending={pending}
            withdrawCallback={withdrawCallback}
        />
    );
};

export const RenVmFeesBlockController: React.FC<Props> = ({
    isOperator,
    darknodeDetails,
}) => {
    const { address, web3, renNetwork } = Web3Container.useContainer();
    const {
        blockState,
        quoteCurrency,
        tokenPrices,
    } = NetworkContainer.useContainer();

    const { setOverlay } = PopupContainer.useContainer();

    const renVmNodeId = darknodeIDBase58ToRenVmID(
        darknodeIDHexToBase58(darknodeDetails?.ID || ""),
    );

    const withdrawable = updatePrices(
        getNodeFeesCollection(renVmNodeId, blockState, "claimable"),
        tokenPrices,
    );
    // console.log("withdrawable", withdrawable?.toJS());
    const pending = updatePrices(
        getNodeFeesCollection(renVmNodeId, blockState, "pending"),
        tokenPrices,
    );
    // console.log("pending", pending?.toJS());

    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const tokenAmount = withdrawable.find((entry) => entry.symbol === token);
    const amount = Math.floor(tokenAmount?.amount.toNumber() || 0);
    const handleOpen = useCallback(() => {
        setOverlay(true);
        setOpen(true);
    }, [setOverlay]);
    const handleClose = useCallback(() => {
        setOpen(false);
        setOverlay(false);
    }, [setOverlay]);
    const withdrawCallback = useCallback(
        async (tokenSymbol: string) => {
            // console.log("withdraw", tokenSymbol);
            if (!open) {
                handleOpen();
                setToken(tokenSymbol);
            }
        },
        [open, handleOpen],
    );
    (window as any).web33 = web3;
    const handleConfirm = useCallback(async () => {
        // console.log("confirming");
        const nonce = 1; // get from node data
        if (!darknodeDetails?.ID || !address) {
            return;
        }
        const hash = claimFeesDigest(renVmNodeId, amount, address, nonce);
        const message = { node: renVmNodeId, amount, address, nonce };
        const signature = await web3.eth.personal.sign(
            JSON.stringify(message),
            address,
            "",
        );

        // const msgParams = [
        //     {
        //         type: "string",
        //         name: "Message",
        //         value: "Hi, Alice!",
        //     },
        //     {
        //         type: "uint32",
        //         name: "A number",
        //         value: "1337",
        //     },
        // ];

        // web3.currentProvider.send({
        //     "eth_signTypedData",
        //     [msgParams, address],
        // address,
        // }, function (err, result) {
        //     if (err) return console.dir(err)
        // });

        console.info("signature", signature);
        try {
            const response = await claimFees(
                renNetwork,
                token,
                renVmNodeId,
                amount,
                nonce,
                address,
                signature,
            );
            console.log("rrr", response);
        } catch (e) {
            setError("Error claiming, check console");
            console.error(e);
        }
        handleClose();
    }, [web3, address, amount, renVmNodeId, renNetwork, token]);

    const canWithdraw =
        darknodeDetails?.registrationStatus === RegistrationStatus.Registered ||
        darknodeDetails?.registrationStatus ===
            RegistrationStatus.DeregistrationPending;

    const earningFees =
        darknodeDetails?.registrationStatus === RegistrationStatus.Registered;

    const amountBN = new BigNumber(tokenAmount?.amount || 0).div(
        new BigNumber(Math.pow(10, tokenAmount?.asset?.decimals || 0)),
    );
    return (
        <>
            <FeesBlock
                quoteCurrency={quoteCurrency}
                isOperator={isOperator}
                earningFees={earningFees}
                canWithdraw={canWithdraw}
                withdrawable={withdrawable}
                pending={pending}
                withdrawCallback={withdrawCallback}
                isRenVMFee={true}
            />
            {open && (
                <div>
                    <Popup onCancel={handleClose}>
                        <div className="popup--description">
                            <h3>Withdraw fees for {token}</h3>
                            <h4>
                                Please confirm you want to withdraw{" "}
                                {amountBN.toNumber()} {token} to address{" "}
                                {address}
                            </h4>
                            {Boolean(error) && <PopupError>{error}</PopupError>}
                        </div>
                        <div className="popup--buttons">
                            <button className="button" onClick={handleConfirm}>
                                Confirm
                            </button>
                            <button
                                className="button button--white"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </Popup>
                </div>
            )}
        </>
    );
};

type FeesSource = "eth" | "renvm";

export const FeesSwitcherController: React.FC<Props> = ({
    isOperator,
    darknodeDetails,
}) => {
    const [source, setSource] = useState<FeesSource>("eth");
    return (
        <div className="fees-switcher">
            <div className="fees-switcher--control">
                {["eth", "renvm"].map((symbol) => (
                    <span key={symbol}>
                        <span
                            className={classNames(
                                "fees-switcher--button",
                                source === symbol
                                    ? "fees-switcher--button--active"
                                    : "",
                            )}
                            onClick={() => {
                                setSource(symbol as FeesSource);
                            }}
                        >
                            {symbol === "eth" ? "Ethereum" : "RenVM"}
                        </span>
                        {symbol === "eth" && " | "}
                    </span>
                ))}
            </div>
            {source === "eth" && (
                <FeesBlockController
                    isOperator={isOperator}
                    darknodeDetails={darknodeDetails}
                />
            )}
            {source === "renvm" && (
                <RenVmFeesBlockController
                    isOperator={isOperator}
                    darknodeDetails={darknodeDetails}
                />
            )}
        </div>
    );
};
