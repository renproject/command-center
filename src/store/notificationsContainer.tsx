import { CustomNotificationObject, UpdateNotification } from "bnc-notify";
import { List } from "immutable";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { Web3Container } from "./web3Container";

const useNotificationsContainer = () => {
    const { notify } = Web3Container.useContainer();

    const [notifications, setNotifications] = useState(
        List<CustomNotificationObject>(),
    );

    // Process notification queue.
    useEffect(() => {
        if (!notify) {
            return;
        }

        setNotifications(List());

        notifications.forEach((notification) =>
            notify.notification(notification),
        );
    }, [notify, notifications]);

    const showSuccess = (message: string, autoDismiss?: number) =>
        notify?.notification({
            type: "success",
            message,
            autoDismiss,
        }) || {
            dismiss: () => {},
            update: ((..._: any[]) => {}) as UpdateNotification,
        };

    const showError = (message: string, autoDismiss?: number) =>
        notify?.notification({
            type: "error",
            message,
            autoDismiss,
        }) || {
            dismiss: () => {},
            update: ((..._: any[]) => {}) as UpdateNotification,
        };

    const showHint = (message: string, autoDismiss?: number) =>
        notify?.notification({
            type: "hint",
            message,
            autoDismiss,
        }) || {
            dismiss: () => {},
            update: ((..._: any[]) => {}) as UpdateNotification,
        };

    const showPending = (message: string, autoDismiss?: number) =>
        notify?.notification({
            type: "pending",
            message,
            autoDismiss,
        }) || {
            dismiss: () => {},
            update: ((..._: any[]) => {}) as UpdateNotification,
        };

    return {
        showSuccess,
        showError,
        showHint,
        showPending,
    };
};

export const NotificationsContainer = createContainer(
    useNotificationsContainer,
);
