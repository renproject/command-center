import { createContainer } from "unstated-next";
import { Web3Container } from "./web3Container";
import { CustomNotificationObject } from "bnc-notify";
import { useEffect, useState } from "react";
import { List } from "immutable";

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
        setNotifications((current) =>
            current.push({
                type: "success",
                message,
                autoDismiss,
            }),
        );

    const showError = (message: string, autoDismiss?: number) =>
        setNotifications((current) =>
            current.push({
                type: "error",
                message,
                autoDismiss,
            }),
        );

    const showHint = (message: string, autoDismiss?: number) =>
        setNotifications((current) =>
            current.push({
                type: "hint",
                message,
                autoDismiss,
            }),
        );

    const showPending = (message: string, autoDismiss?: number) =>
        setNotifications((current) =>
            current.push({
                type: "pending",
                message,
                autoDismiss,
            }),
        );

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
