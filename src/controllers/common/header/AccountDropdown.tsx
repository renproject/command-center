import { Blocky } from "@renproject/react-components";
import React, { useRef, useState } from "react";

import { copyToClipboard } from "../../../lib/copyToClipboard";
import { classNames } from "../../../lib/react/className";
import { Web3Container } from "../../../store/web3Container";

export const AccountDropdown: React.FC = () => {
    const [shown, setShown] = useState(false);
    const [copied, setCopied] = useState(false);

    const { address, web3BrowserName, promptLogin, logout } =
        Web3Container.useContainer();

    const ref = useRef(null as HTMLDivElement | null);

    const handleLogin = async (): Promise<void> => {
        setShown(false);
        if (!address) {
            await promptLogin({ manual: true });
        }
    };

    const handleLogout = () => {
        setShown(false);
        logout();
    };

    const onClickCopy = (e: React.MouseEvent<HTMLElement>): void => {
        const el = e.currentTarget.childNodes[0] as Element;
        copyToClipboard(el);
        setCopied(true);
    };

    const clickAway = (event: MouseEvent) => {
        if (ref) {
            const current = ref.current;
            if (current && !current.contains(event.target as Node)) {
                setShown(false);
            }
        }
        document.removeEventListener("mousedown", clickAway);
    };

    const toggle = () => {
        const newShown = !shown;
        setShown(newShown);

        if (newShown) {
            document.addEventListener("mousedown", clickAway);
        } else {
            document.removeEventListener("mousedown", clickAway);
        }
    };

    return (
        <div className="header--group header--group--account" ref={ref}>
            <div
                className={classNames(
                    "header--account",
                    "header--selected",
                    address
                        ? "header--account--logged-in"
                        : "header--account--logged-out",
                )}
                role="menuitem"
                onClick={address ? toggle : handleLogin}
            >
                {address ? (
                    <>
                        <Blocky address={address} />
                        <div className="header--account--right header--account--connected">
                            <div className="header--account--type">
                                {web3BrowserName}{" "}
                            </div>
                            <div className="header--account--address">
                                {address.substring(0, 8)}...{address.slice(-5)}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="wallet-icon">
                            <div className="wallet-icon--inner" />
                        </div>
                        <div className="header--account--right header--account--disconnected">
                            <div className="header--account--type">
                                Connect {web3BrowserName}
                            </div>
                            <div className="header--account--address">
                                Manage your Darknode
                            </div>
                        </div>
                    </>
                )}
            </div>

            {address && shown ? (
                <div className="header--dropdown--spacing header--dropdown--options header--dropdown--accounts">
                    <ul
                        className={classNames(
                            "header--dropdown",
                            !address ? "header--dropdown--login" : "",
                        )}
                    >
                        <li
                            role="button"
                            onClick={onClickCopy}
                            className="header--dropdown--option"
                        >
                            <span data-addr={address}>
                                {copied ? (
                                    <span>Copied</span>
                                ) : (
                                    <span>Copy to clipboard</span>
                                )}
                            </span>
                        </li>
                        <li
                            role="button"
                            onClick={handleLogout}
                            className="header--dropdown--option"
                        >
                            Log out
                        </li>
                    </ul>
                </div>
            ) : null}
        </div>
    );
};
