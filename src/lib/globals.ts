import { OrderStatus } from "renex-sdk-ts";

export enum OrderType {
    MIDPOINT = 0,
    LIMIT = 1, // FIXME: unsupported
}


// // Order statuses - when OrderStatus is updated, OrderStatusDisplay should be
// // updated as well
// export enum OrderStatus {
//     Unknown = "",
//     Open = "Open",
//     Confirmed = "Executing",
//     Executed = "Executed",
//     Canceled = "Canceled",
//     Expired = "Expired",
//     Failed = "Failed",

//     // A migrating status represents an order which was confirmed in a previous
//     // deployment of the Orderbook contract. If the settlement details can be found,
//     // the order will be updated to be Executed, otherwise it will be set to
//     // Expired.
//     Migrating = "Pending",
// }

// // How order statuses should be shown to the user
// export const OrderStatusDisplay = {
//     [OrderStatus.Unknown]: "-",
//     [OrderStatus.Open]: "Open",
//     [OrderStatus.Confirmed]: "Executing",
//     [OrderStatus.Executed]: "Executed",
//     [OrderStatus.Canceled]: "Canceled",
//     [OrderStatus.Expired]: "Expired",
//     [OrderStatus.Failed]: "Failed",
//     [OrderStatus.Migrating]: "Pending",
// };

export const HiddenOrderStatusDisplay = {
    [OrderStatus.NOT_SUBMITTED]: "-",
    [OrderStatus.OPEN]: "Open",
    [OrderStatus.CONFIRMED]: "Matched",
    [OrderStatus.CANCELED]: "Canceled",
    [OrderStatus.SETTLED]: "Settled",
};

export const StatusPriority = {
    STATUS_UNKNOWN: 0,
    STATUS_OPEN: 1,
    STATUS_EXPIRED: 2,
    STATUS_CONFIRMED: 3,
    STATUS_EXECUTED: 4,
    STATUS_CANCELED: 5,
};

// Local storage
export const LOCAL_STORAGE = "republicprotocol";
