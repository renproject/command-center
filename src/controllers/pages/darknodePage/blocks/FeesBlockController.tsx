import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    darknodeIDBase58ToRenVmID,
    darknodeIDHexToBase58,
} from "../../../../lib/darknode/darknodeID";
import { claimFees } from "../../../../lib/darknode/jsonrpc";
import {
    BlockState,
    toNativeTokenSymbol,
} from "../../../../lib/darknode/utils/blockStateUtils";
import {
    getNodeFeesCollection,
    getNodeLastNonceClaimed,
} from "../../../../lib/darknode/utils/feesUtils";

import {
    DarknodeFeeStatus,
    RegistrationStatus,
} from "../../../../lib/ethereum/contractReads";
import { TokenString } from "../../../../lib/ethereum/tokens";
import {
    base64StringToHexString,
    hexStringToBase64String,
} from "../../../../lib/general/encodingUtils";
import { TokenAmount } from "../../../../lib/graphQL/queries/queries";
import { classNames } from "../../../../lib/react/className";
import { claimFeesDigest } from "../../../../lib/web3/signatures";
import { GraphContainer } from "../../../../store/graphContainer";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { NotificationsContainer } from "../../../../store/notificationsContainer";
import { PopupContainer } from "../../../../store/popupContainer";
import { Web3Container } from "../../../../store/web3Container";
import { ReactComponent as IconCheckCircle } from "../../../../styles/images/icon-check-circle.svg";
import { FeesBlock } from "../../../../views/darknodeBlocks/FeesBlock";
import { Popup } from "../../../common/popups/Popup";
import { updatePrices } from "../../../common/tokenBalanceUtils";
import * as Chains from "@renproject/chains";

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
    // const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { currentCycle, previousCycle } = renVM || {};
    // const {
    //     claimWarningShown,
    //     setClaimWarningShown,
    // } = UIContainer.useContainer();

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

    // useEffect(() => {
    //     // If the darknode hasn't claimed within 1 day of a new epoch, show a
    //     // warning popup.
    //     const day = moment.duration(5, "hours").asSeconds();
    //     if (
    //         isOperator &&
    //         !claimWarningShown &&
    //         showPreviousPending &&
    //         earningFees &&
    //         timeSinceLastEpoch &&
    //         timeSinceLastEpoch.gt(day)
    //     ) {
    //         setClaimWarningShown(true);
    //         setPopup({
    //             popup: <NotClaimed onCancel={clearPopup} />,
    //             onCancel: clearPopup,
    //             dismissible: true,
    //             overlay: true,
    //         });
    //     }
    // }, [
    //     showPreviousPending,
    //     timeSinceLastEpoch,
    //     claimWarningShown,
    //     setClaimWarningShown,
    //     clearPopup,
    //     setPopup,
    //     earningFees,
    //     isOperator,
    // ]);

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

const convertToNativeAmount = (value: string | number, decimals: number) => {
    const newAmount = Number(value);
    return new BigNumber(newAmount || 0)
        .multipliedBy(new BigNumber(Math.pow(10, decimals || 0)))
        .toNumber();
};

const convertToAmount = (value: string | number, decimals: number) => {
    const newAmount = Number(value);
    return new BigNumber(newAmount || 0)
        .div(new BigNumber(Math.pow(10, decimals || 0)))
        .toNumber();
};

type FeeWithdrawalStage = "configuration" | "confirmation" | "processing";

export const RenVmFeesBlockController: React.FC<Props> = ({
    isOperator,
    darknodeDetails,
}) => {
    const {
        address: signingAddress,
        web3,
        renNetwork,
    } = Web3Container.useContainer();
    const { showSuccess } = NotificationsContainer.useContainer();

    const network = renNetwork.name;
    const {
        blockState,
        quoteCurrency,
        tokenPrices,
        fetchBlockState,
    } = NetworkContainer.useContainer();

    const { setOverlay } = PopupContainer.useContainer();

    const renVmDarknodeId = darknodeIDBase58ToRenVmID(
        darknodeIDHexToBase58(darknodeDetails?.ID || ""),
    );

    const withdrawableFees =
        darknodeDetails?.renVmFeesEarned ||
        updatePrices(
            getNodeFeesCollection(renVmDarknodeId, blockState, "claimable"),
            tokenPrices,
        );

    const pendingFees =
        darknodeDetails?.renVmFeesPending ||
        updatePrices(
            getNodeFeesCollection(renVmDarknodeId, blockState, "pending"),
            tokenPrices,
        );
    // console.log("pending", pending?.toJS());

    const [token, setToken] = useState("");
    const nativeTokenSymbol = toNativeTokenSymbol(token);
    const nonce =
        blockState !== null
            ? getNodeLastNonceClaimed(
                  renVmDarknodeId,
                  nativeTokenSymbol,
                  blockState,
              )
            : null;
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState(0);
    const [inputAmount, setInputAmount] = useState(0);
    const [amountError, setAmountError] = useState("");
    const [address, setAddress] = useState("");
    const [addressError, setAddressError] = useState("");
    // const [pending, setPending] = useState(false);
    const tokenAmount = withdrawableFees.find(
        (entry) => entry?.symbol === token,
    );
    const maxAmount = Math.floor(tokenAmount?.amount.toNumber() || 0);
    useEffect(() => {
        setAmount(maxAmount);
        setInputAmount(
            convertToAmount(maxAmount, tokenAmount?.asset?.decimals || 0),
        );
    }, [maxAmount, tokenAmount?.asset?.decimals]);

    const addressValidator = useMemo(() => {}, [nativeTokenSymbol]);
    // useEffect(() => {
    //
    // }, [address]);

    const handleOpen = useCallback(() => {
        setOverlay(true);
        setOpen(true);
    }, [setOverlay]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setOverlay(false);
        // setPending(false);
        setError("");
        setAmount(0);
        setAddress("");
        setAmountError("");
        setAddressError("");
        setToken("");
        setStage("configuration");
    }, [setOverlay]);

    const handleAddressChange = useCallback((event) => {
        const value = event.target.value;
        setAddress(value);
        if (!value) {
            setAddressError("please enter suitable address");
        } else {
            setAddressError("");
        }
    }, []);
    const destinationAddress = address;

    const handleAmountChange = useCallback(
        (event) => {
            const value = event.target.value;
            setInputAmount(value);
            console.log(value);
            const newAmount = Number(value);
            const newNativeAmount = convertToNativeAmount(
                newAmount,
                tokenAmount?.asset?.decimals || 0,
            );
            setAmount(newNativeAmount);

            if (isNaN(newAmount) || newAmount < 0) {
                setAmountError("not a valid amount");
            } else if (newNativeAmount > maxAmount) {
                setAmountError("amount exceeds claimable fee");
            } else if (newNativeAmount === 0) {
                setAmountError("please enter amount");
            } else if (newNativeAmount % 1 !== 0) {
                setAmountError("forbidden decimals in native amount");
            } else {
                setAmountError("");
            }
        },
        [maxAmount, tokenAmount?.asset?.decimals],
    );

    const withdrawCallback = useCallback(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (tokenSymbol: string) => {
            // console.log("withdraw", tokenSymbol);
            if (!open) {
                setToken(tokenSymbol);
                handleOpen();
            }
        },
        [open, handleOpen],
    );
    (window as any).web33 = web3;

    const [stage, setStage] = useState<FeeWithdrawalStage>("configuration");

    const handleContinue = useCallback(async () => {
        // console.log("confirming");
        // setPending(true);
        if (stage === "configuration") {
            if (!amountError && !addressError) {
                setStage("confirmation");
            }
        } else if (stage === "confirmation") {
            if (!darknodeDetails?.ID || !signingAddress || nonce === null) {
                return;
            }
            const base64Digest = claimFeesDigest(
                nativeTokenSymbol,
                network,
                renVmDarknodeId,
                amount,
                destinationAddress,
                nonce,
            );
            const hexDigest = base64StringToHexString(base64Digest);
            console.log("fees hash", hexDigest);

            const hexSignature = await web3.eth.personal.sign(
                hexDigest,
                signingAddress,
                "",
            );
            const signature = hexStringToBase64String(hexSignature);
            console.info("hex signature", hexSignature);
            console.info("base64 signature", signature);
            try {
                console.log(
                    "claiming fees",
                    network,
                    token,
                    renVmDarknodeId,
                    amount,
                    destinationAddress,
                    nonce,
                    signature,
                );
                const response = await claimFees(
                    renNetwork,
                    token,
                    renVmDarknodeId,
                    amount,
                    destinationAddress,
                    nonce,
                    signature,
                );
                console.log("rrr", response);
                if (response.status === 200) {
                    showSuccess("Fees successfully claimed!");
                    setStage("processing");
                    await fetchBlockState();
                }
            } catch (err) {
                console.error("Claiming error:", err, err?.response);
                console.error(err?.data?.error?.message);

                setStage("configuration");
                setError("Claiming failed");
                if (
                    (err?.response?.data?.error?.message || "").includes(
                        "bad to",
                    )
                ) {
                    setAddressError("incorrect address");
                }
            }
        }
    }, [
        amount,
        web3,
        network,
        signingAddress,
        destinationAddress,
        renVmDarknodeId,
        token,
        darknodeDetails?.ID,
        renNetwork,
        stage,
        addressError,
        amountError,
        nativeTokenSymbol,
        nonce,
        showSuccess,
        fetchBlockState,
    ]);

    const handlePrev = useCallback(() => {
        if (stage === "confirmation") {
            setStage("configuration");
        }
    }, [stage]);

    const canWithdraw =
        darknodeDetails?.registrationStatus === RegistrationStatus.Registered ||
        darknodeDetails?.registrationStatus ===
            RegistrationStatus.DeregistrationPending;

    const earningFees =
        darknodeDetails?.registrationStatus === RegistrationStatus.Registered;

    const amountBN = new BigNumber(amount || 0).div(
        new BigNumber(Math.pow(10, tokenAmount?.asset?.decimals || 0)),
    );
    return (
        <>
            <FeesBlock
                quoteCurrency={quoteCurrency}
                isOperator={isOperator}
                earningFees={earningFees}
                canWithdraw={canWithdraw}
                withdrawable={withdrawableFees}
                pending={pendingFees}
                withdrawCallback={withdrawCallback}
                isRenVMFee={true}
                blockState={blockState as BlockState}
            />
            {open && (
                <div className="popup--container">
                    <div className="popup-backdrop--blur" />
                    <Popup
                        onCancel={handleClose}
                        className="popup--padded-medium popup--size-medium popup--align-left"
                    >
                        <div>
                            <h1>Withdraw earnings</h1>
                            <h2>for {token}</h2>
                        </div>
                        <div className="popup--content">
                            {stage === "configuration" && (
                                <>
                                    <div className="field-wrapper">
                                        <label className="field-label">
                                            Amount
                                        </label>
                                        <input
                                            type="text"
                                            className="field-input field-input--full-width"
                                            onChange={handleAmountChange}
                                            value={inputAmount}
                                        />

                                        <div className="field-info field-info--supplemental field-info--flex">
                                            <span>Native amount:</span>
                                            <span>{amount}</span>
                                        </div>
                                        <div className="field-info">
                                            This is the amount you will withdraw
                                        </div>
                                        {Boolean(amountError) && (
                                            <div className="field-error">
                                                {amountError}
                                            </div>
                                        )}
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">
                                            Wallet address
                                        </label>
                                        <input
                                            type="text"
                                            className="field-input field-input--full-width"
                                            placeholder="Enter address here"
                                            onChange={handleAddressChange}
                                            value={address}
                                        />
                                        <div className="field-info">
                                            This address is where you will
                                            receive your rewards
                                        </div>
                                        {Boolean(addressError) && (
                                            <div className="field-error">
                                                {addressError}
                                            </div>
                                        )}
                                    </div>
                                    {Boolean(error) && (
                                        <div className="form-error-wrapper">
                                            <h2 className="form-error-header">
                                                Error
                                            </h2>
                                            <p className="form-error-text">
                                                {error}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                            {stage === "confirmation" && (
                                <>
                                    <div className="field-wrapper">
                                        <p>You are about to send</p>
                                        <p className="fee-confirmation-data">
                                            {amountBN.toNumber()}{" "}
                                            {nativeTokenSymbol}
                                        </p>
                                    </div>
                                    <div className="field-wrapper">
                                        <p>To the following address:</p>
                                        <p className="fee-confirmation-data">
                                            {address}
                                        </p>
                                    </div>
                                    <div className="field-wrapper">
                                        <p className="field-info--supplemental">
                                            Please double check that the wallet
                                            you are sending to is compatible
                                            with the tokens that are being sent.{" "}
                                            <br />
                                            Sending tokens to an incompatible
                                            wallet or wrong address will result
                                            in irretrievably lost funds.
                                        </p>
                                    </div>
                                </>
                            )}
                            {stage === "processing" && (
                                <>
                                    <div className="fee-withdrawal-status">
                                        <IconCheckCircle
                                            className="fee-withdrawal-icon"
                                            width={60}
                                            height={60}
                                        />
                                        <span className="collateral-status--over">
                                            Withdraw in progress
                                        </span>
                                    </div>
                                    <div className="field-wrapper">
                                        <p className="field-info--supplemental">
                                            The transaction has been initiated.
                                            <br />
                                            Depending on the network you are
                                            using it might take considerable
                                            amount of time to complete the
                                            transaction.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="popup--buttons">
                            {stage === "configuration" && (
                                <button
                                    className="button button--white"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                            )}
                            {stage === "confirmation" && (
                                <button
                                    className="button button--white"
                                    onClick={handlePrev}
                                >
                                    Back
                                </button>
                            )}
                            {stage === "configuration" && (
                                <button
                                    className="button"
                                    onClick={handleContinue}
                                    disabled={
                                        !Boolean(amount) ||
                                        Boolean(amountError) ||
                                        !Boolean(address) ||
                                        Boolean(addressError)
                                    }
                                >
                                    Continue
                                </button>
                            )}
                            {stage === "confirmation" && (
                                <button
                                    className="button"
                                    onClick={handleContinue}
                                >
                                    Confirm & Send
                                </button>
                            )}
                            {stage === "processing" && (
                                <button
                                    className="button"
                                    onClick={handleClose}
                                >
                                    Done
                                </button>
                            )}
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
    const [source, setSource] = useState<FeesSource>("renvm");
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
