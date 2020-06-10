/// @notice Returns whether a darknode is scheduled to become registered
/// at next epoch.

import { Darknode } from "../graphQL/queries/darknode";
import { Epoch, RenVM } from "../graphQL/queries/renVM";
import { RegistrationStatus } from "./contractReads";

/// @param _darknodeID The ID of the darknode to return.
const isPendingRegistration = (darknode: Darknode, renVM: RenVM): boolean => {
    const registeredAt = darknode.registeredAt;
    return !registeredAt.isZero() && registeredAt.gt(renVM.currentEpoch.timestamp);
};

/// @notice Returns if a darknode is in the pending deregistered state. In
/// this state a darknode is still considered registered.
const isPendingDeregistration = (darknode: Darknode, renVM: RenVM): boolean => {
    const deregisteredAt = darknode.deregisteredAt;
    return !deregisteredAt.isZero() && deregisteredAt.gt(renVM.currentEpoch.timestamp);
};

/// @notice Returns if a darknode is in the deregistered state.
const isDeregistered = (darknode: Darknode, renVM: RenVM): boolean => {
    const deregisteredAt = darknode.deregisteredAt;
    return !deregisteredAt.isZero() && deregisteredAt.lte(renVM.currentEpoch.timestamp);
};

/// @notice Returns if a darknode was in the registered state for a given
/// epoch.
/// @param _darknodeID The ID of the darknode.
/// @param _epoch One of currentEpoch, previousEpoch.
export const isRegisteredInEpoch = (darknode: Darknode, epoch: Epoch): boolean => {
    const registeredAt = darknode.registeredAt;
    const deregisteredAt = darknode.deregisteredAt;
    const registered = !registeredAt.isZero() && registeredAt.lte(epoch.timestamp);
    const notDeregistered = deregisteredAt.isZero() ||
        deregisteredAt.gt(epoch.timestamp);
    // The Darknode has been registered and has not yet been deregistered,
    // although it might be pending deregistration
    return registered && notDeregistered;
};

/// @notice Returns if a darknode can be deregistered. This is true if the
/// darknodes is in the registered state and has not attempted to
/// deregister yet.
const isDeregisterable = (darknode: Darknode, renVM: RenVM): boolean => {
    const deregisteredAt = darknode.deregisteredAt;
    // The Darknode is currently in the registered state and has not been
    // transitioned to the pending deregistration, or deregistered, state
    return isRegisteredInEpoch(darknode, renVM.currentEpoch) && deregisteredAt.isZero();
};

/// @notice Returns if a darknode is in the refunded state. This is true
/// for darknodes that have never been registered, or darknodes that have
/// been deregistered and refunded.
const isRefunded = (darknode: Darknode): boolean => {
    const registeredAt = darknode.registeredAt;
    const deregisteredAt = darknode.deregisteredAt;
    return registeredAt.isZero() && deregisteredAt.isZero();
};

/// @notice Returns if a darknode is refundable. This is true for darknodes
/// that have been in the deregistered state for one full epoch.
const isRefundable = (darknode: Darknode, renVM: RenVM): boolean => {
    return isDeregistered(darknode, renVM) && darknode.deregisteredAt.lte((renVM.previousEpoch.timestamp.minus(renVM.deregistrationInterval)));
};


/**
 * Retrieves the registration status of a darknode.
 *
 * It can be one of Unregistered, RegistrationPending, Registered,
 * DeregistrationPending, Deregistered or Refundable.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @returns A promise to the registration status.
 */
export const getDarknodeStatus = (darknode: Darknode, renVM: RenVM): RegistrationStatus => {
    const pendingRegistration = isPendingRegistration(darknode, renVM);
    const pendingDeregistration = isPendingDeregistration(darknode, renVM);
    const deregisterable = isDeregisterable(darknode, renVM);
    const refunded = isRefunded(darknode);
    const refundable = isRefundable(darknode, renVM);

    if (refunded) {
        return RegistrationStatus.Unregistered;
    } else if (pendingRegistration) {
        return RegistrationStatus.RegistrationPending;
    } else if (deregisterable) {
        return RegistrationStatus.Registered;
    } else if (pendingDeregistration) {
        return RegistrationStatus.DeregistrationPending;
    } else if (refundable) {
        return RegistrationStatus.Refundable;
    } else {
        return RegistrationStatus.Deregistered;
    }
};
