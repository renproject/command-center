import { RenNetworkDetails } from "@renproject/contracts";
import { CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useMemo } from "react";

import { Token } from "../../../lib/ethereum/tokens";
import { Integrator } from "../../../lib/graphQL/queries";
import { classNames } from "../../../lib/react/className";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { ExternalLink } from "../../../views/ExternalLink";
import { TitledSection } from "../../../views/TitledSection";
import { tokenToQuote, tokenToReadable } from "../../common/TokenBalance";
import Integrators from "./integrators.json";

const DefaultLogo = require("../../../styles/images/integrators/default.png");

const resolveIntegrator = (
    networkDetails: RenNetworkDetails,
    id: string,
    address: string,
): { name: string; logo: string; urlHref: string; url: string } => {
    const details =
        (Integrators[networkDetails.name] &&
            Integrators[networkDetails.name][id]) ||
        {};

    return {
        name: details.name || address,
        logo: details.logo || DefaultLogo,
        urlHref:
            details.urlHref || `${networkDetails.etherscan}/address/${address}`,
        url: details.url || "Etherscan",
    };
};

interface Props {
    index: number;
    integrator: { now: Integrator; day: Integrator | null };
    isActive: boolean;
    setActiveIntegrator: (id: string | null) => void;
}

export const IntegratorRow: React.FC<Props> = ({
    index,
    integrator,
    isActive,
    setActiveIntegrator,
}) => {
    const { renNetwork } = Web3Container.useContainer();
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();

    const { name, logo, url, urlHref } = resolveIntegrator(
        renNetwork,
        integrator.now.id,
        integrator.now.contractAddress,
    );
    const toggleExpanded = useCallback(() => {
        isActive
            ? setActiveIntegrator(null)
            : setActiveIntegrator(integrator.now.id);
    }, [isActive, setActiveIntegrator, integrator.now.id]);

    // Day volume in token quantity

    const dayVolumeBTCRaw = new BigNumber(integrator.now.volumeBTC).minus(
        integrator.day ? integrator.day.volumeBTC : new BigNumber(0),
    );
    const dayVolumeZECRaw = new BigNumber(integrator.now.volumeZEC).minus(
        integrator.day ? integrator.day.volumeZEC : new BigNumber(0),
    );
    const dayVolumeBCHRaw = new BigNumber(integrator.now.volumeBCH).minus(
        integrator.day ? integrator.day.volumeBCH : new BigNumber(0),
    );

    const dayVolumeBTCReadable = useMemo(
        () =>
            tokenToReadable(
                dayVolumeBTCRaw ? dayVolumeBTCRaw : new BigNumber(0),
                Token.BTC,
            ),
        [dayVolumeBTCRaw],
    );
    const dayVolumeZECReadable = useMemo(
        () =>
            tokenToReadable(
                dayVolumeZECRaw ? dayVolumeZECRaw : new BigNumber(0),
                Token.ZEC,
            ),
        [dayVolumeZECRaw],
    );
    const dayVolumeBCHReadable = useMemo(
        () =>
            tokenToReadable(
                dayVolumeBCHRaw ? dayVolumeBCHRaw : new BigNumber(0),
                Token.BCH,
            ),
        [dayVolumeBCHRaw],
    );

    // Day volume in quote currency

    const dayVolumeBTCQuote = useMemo(
        () =>
            dayVolumeBTCRaw && tokenPrices
                ? tokenToQuote(
                      dayVolumeBTCRaw,
                      Token.BTC,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [dayVolumeBTCRaw, tokenPrices, quoteCurrency],
    );

    const dayVolumeZECQuote = useMemo(
        () =>
            dayVolumeZECRaw && tokenPrices
                ? tokenToQuote(
                      dayVolumeZECRaw,
                      Token.ZEC,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [dayVolumeZECRaw, tokenPrices, quoteCurrency],
    );

    const dayVolumeBCHQuote = useMemo(
        () =>
            dayVolumeBCHRaw && tokenPrices
                ? tokenToQuote(
                      dayVolumeBCHRaw,
                      Token.BCH,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [dayVolumeBCHRaw, tokenPrices, quoteCurrency],
    );

    // Day volume total

    const dayVolumeQuote = useMemo(
        () =>
            dayVolumeBTCQuote
                .plus(dayVolumeZECQuote)
                .plus(dayVolumeBCHQuote)
                .toFormat(),
        [dayVolumeBCHQuote, dayVolumeBTCQuote, dayVolumeZECQuote],
    );

    // All-time volume in token quantity

    const allVolumeBTCReadable = useMemo(
        () => tokenToReadable(integrator.now.volumeBTC, Token.BTC),
        [integrator.now.volumeBTC],
    );
    const allVolumeZECReadable = useMemo(
        () => tokenToReadable(integrator.now.volumeZEC, Token.ZEC),
        [integrator.now.volumeZEC],
    );
    const allVolumeBCHReadable = useMemo(
        () => tokenToReadable(integrator.now.volumeBCH, Token.BCH),
        [integrator.now.volumeBCH],
    );

    // All-time volume in quote currency

    const allVolumeBTC = useMemo(
        () =>
            tokenPrices
                ? tokenToQuote(
                      integrator.now.volumeBTC,
                      Token.BTC,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [tokenPrices, quoteCurrency, integrator.now.volumeBTC],
    );

    const allVolumeZEC = useMemo(
        () =>
            tokenPrices
                ? tokenToQuote(
                      integrator.now.volumeZEC,
                      Token.ZEC,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [tokenPrices, quoteCurrency, integrator.now.volumeZEC],
    );

    const allVolumeBCH = useMemo(
        () =>
            tokenPrices
                ? tokenToQuote(
                      integrator.now.volumeBCH,
                      Token.BCH,
                      quoteCurrency,
                      tokenPrices,
                  )
                : new BigNumber(0),
        [tokenPrices, quoteCurrency, integrator.now.volumeBCH],
    );

    // All-time volume total

    const allVolume = useMemo(
        () => allVolumeBTC.plus(allVolumeZEC).plus(allVolumeBCH).toFormat(),
        [allVolumeBTC, allVolumeZEC, allVolumeBCH],
    );
    const stopPropagation = useCallback((e) => e.stopPropagation(), []);

    return (
        <>
            <tr className="integrator" onClick={toggleExpanded}>
                <td className="col-0">{index}</td>
                <td className="col-1">
                    <div className="img-wrapper">
                        <img role="presentation" alt="" src={logo} />
                    </div>
                </td>
                <td className="col-2">
                    <div className="integrator-name">
                        <span>{name}</span>
                        <p>
                            <ExternalLink
                                href={urlHref}
                                onClick={stopPropagation}
                            >
                                {url}
                            </ExternalLink>
                        </p>
                    </div>
                </td>
                <td className="col-3">
                    <CurrencyIcon currency={quoteCurrency} />
                    {dayVolumeQuote} {quoteCurrency.toUpperCase()}
                </td>
                <td className="col-4">
                    <CurrencyIcon currency={quoteCurrency} />
                    {allVolume} {quoteCurrency.toUpperCase()}
                </td>
            </tr>
            <tr
                className={classNames(
                    `integrator-extra`,
                    isActive
                        ? "integrator-extra-open"
                        : "integrator-extra-closed",
                )}
            >
                <td colSpan={5}>
                    <div className="integrators-extra--stats">
                        <TitledSection top={<h2>{name} - details</h2>}>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Contract address</td>
                                        <td className="monospace">
                                            <ExternalLink
                                                href={`${renNetwork.etherscan}/address/${integrator.now.contractAddress}`}
                                            >
                                                {integrator.now.contractAddress}
                                            </ExternalLink>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>24 HR Volume</td>
                                        <td>
                                            <CurrencyIcon
                                                currency={quoteCurrency}
                                            />
                                            {dayVolumeQuote}{" "}
                                            {quoteCurrency.toUpperCase()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>All Time Volume</td>
                                        <td>
                                            <CurrencyIcon
                                                currency={quoteCurrency}
                                            />
                                            {allVolume}{" "}
                                            {quoteCurrency.toUpperCase()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>BTC Transaction count</td>
                                        <td>{integrator.now.txCountBTC}</td>
                                    </tr>
                                    <tr>
                                        <td>ZEC Transaction count</td>
                                        <td>{integrator.now.txCountZEC}</td>
                                    </tr>
                                    <tr>
                                        <td>BCH Transaction count</td>
                                        <td>{integrator.now.txCountBCH}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </TitledSection>
                        <div className="integrators-extra--stats">
                            <TitledSection top={<h2>24 HR Volume Details</h2>}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Daily BTC Volume</td>
                                            <td>
                                                {dayVolumeBTCReadable.toFormat()}{" "}
                                                BTC
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {dayVolumeBTCQuote.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Daily ZEC Volume</td>
                                            <td>
                                                {dayVolumeZECReadable.toFormat()}{" "}
                                                ZEC
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {dayVolumeZECQuote.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Daily BCH Volume</td>
                                            <td>
                                                {dayVolumeBCHReadable.toFormat()}{" "}
                                                BCH
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {dayVolumeBCHQuote.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </TitledSection>
                            <TitledSection
                                top={<h2>All Time Volume Details</h2>}
                            >
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>All Time BTC Volume</td>
                                            <td>
                                                {allVolumeBTCReadable.toFormat()}{" "}
                                                BTC
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {allVolumeBTC.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>All Time ZEC Volume</td>
                                            <td>
                                                {allVolumeZECReadable.toFormat()}{" "}
                                                ZEC
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {allVolumeZEC.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>All Time BCH Volume</td>
                                            <td>
                                                {allVolumeBCHReadable.toFormat()}{" "}
                                                BCH
                                                {" - "}
                                                <CurrencyIcon
                                                    currency={quoteCurrency}
                                                />
                                                {allVolumeBCH.toFormat()}{" "}
                                                {quoteCurrency.toUpperCase()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </TitledSection>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
};
