import { RenNetworkDetails } from "@renproject/contracts";
import { CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";

import { Token } from "../../lib/ethereum/tokens";
import { Integrator } from "../../lib/graphQL/queries";
import { getCurrent24HourPeriod } from "../../lib/graphQL/volumes";
import { classNames } from "../../lib/react/className";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { Web3Container } from "../../store/web3Store";
import { ExternalLink } from "../common/ExternalLink";
import { TitledSection } from "../common/TitledSection";
import { tokenToQuote, tokenToReadable } from "../common/TokenBalance";
import Integrators from "./integrators.json";

const DefaultLogo = require("../../styles/images/integrators/default.png");

const resolveIntegrator = (networkDetails: RenNetworkDetails, id: string, address: string): { name: string, logo: string, urlHref: string, url: string } => {
    const details = (Integrators[networkDetails.name] && Integrators[networkDetails.name][id]) || {};

    return {
        name: details.name || address,
        logo: details.logo || DefaultLogo,
        urlHref: details.urlHref || `${networkDetails.etherscan}/address/${address}`,
        url: details.url || "Etherscan"
    };
};

interface Props {
    index: number;
    integrator: Integrator;
    isActive: boolean;
    setActiveIntegrator: (id: string | null) => void;
}

export const IntegratorRow: React.FC<Props> = ({ index, integrator, isActive, setActiveIntegrator }) => {
    const { renNetwork } = Web3Container.useContainer();
    const { quoteCurrency, tokenPrices } = NetworkStateContainer.useContainer();
    const currentTime = useMemo(() => getCurrent24HourPeriod(), []);

    const { name, logo, url, urlHref } = resolveIntegrator(renNetwork, integrator.id, integrator.contractAddress);
    const toggleExpanded = React.useCallback(() => { isActive ? setActiveIntegrator(null) : setActiveIntegrator(integrator.id); }, [isActive, setActiveIntegrator, integrator.id]);

    // Day volume in token quantity

    const dayVolumeBTCReadable = React.useMemo(() => tokenToReadable(integrator.integrator24H.date === currentTime ?
        integrator.integrator24H.volumeBTC : new BigNumber(0), Token.BTC), [integrator.integrator24H.volumeBTC, integrator.integrator24H.date, currentTime]);
    const dayVolumeBCHReadable = React.useMemo(() => tokenToReadable(integrator.integrator24H.date === currentTime ?
        integrator.integrator24H.volumeBCH : new BigNumber(0), Token.BCH), [integrator.integrator24H.volumeBCH, integrator.integrator24H.date, currentTime]);
    const dayVolumeZECReadable = React.useMemo(() => tokenToReadable(integrator.integrator24H.date === currentTime ?
        integrator.integrator24H.volumeZEC : new BigNumber(0), Token.ZEC), [integrator.integrator24H.volumeZEC, integrator.integrator24H.date, currentTime]);

    // Day volume in quote currency

    const dayVolumeBTC = React.useMemo(() => integrator.integrator24H.date === currentTime && tokenPrices ?
        tokenToQuote(integrator.integrator24H.volumeBTC, Token.BTC, quoteCurrency, tokenPrices) :
        new BigNumber(0), [integrator.integrator24H.date, currentTime, tokenPrices, quoteCurrency, integrator.integrator24H.volumeBTC]);

    const dayVolumeZEC = React.useMemo(() => integrator.integrator24H.date === currentTime && tokenPrices ?
        tokenToQuote(integrator.integrator24H.volumeZEC, Token.ZEC, quoteCurrency, tokenPrices) :
        new BigNumber(0), [integrator.integrator24H.date, currentTime, tokenPrices, quoteCurrency, integrator.integrator24H.volumeZEC]);

    const dayVolumeBCH = React.useMemo(() => integrator.integrator24H.date === currentTime && tokenPrices ?
        tokenToQuote(integrator.integrator24H.volumeBCH, Token.BCH, quoteCurrency, tokenPrices) :
        new BigNumber(0), [integrator.integrator24H.date, currentTime, tokenPrices, quoteCurrency, integrator.integrator24H.volumeBCH]);

    // Day volume total

    const dayVolume = React.useMemo(() => integrator.integrator24H.date === currentTime && tokenPrices ?
        dayVolumeBTC.plus(dayVolumeZEC).plus(dayVolumeBCH).toFixed() :
        "0", [integrator.integrator24H.date, currentTime, tokenPrices, dayVolumeBCH, dayVolumeBTC, dayVolumeZEC]);

    // All-time volume in token quantity

    const allVolumeBTCReadable = React.useMemo(() => tokenToReadable(integrator.volumeBTC, Token.BTC), [integrator.volumeBTC]);
    const allVolumeBCHReadable = React.useMemo(() => tokenToReadable(integrator.volumeBCH, Token.BCH), [integrator.volumeBCH]);
    const allVolumeZECReadable = React.useMemo(() => tokenToReadable(integrator.volumeZEC, Token.ZEC), [integrator.volumeZEC]);

    // All-time volume in quote currency

    const allVolumeBTC = React.useMemo(() => tokenPrices ?
        tokenToQuote(integrator.volumeBTC, Token.BTC, quoteCurrency, tokenPrices) :
        new BigNumber(0), [tokenPrices, quoteCurrency, integrator.volumeBTC]);

    const allVolumeZEC = React.useMemo(() => tokenPrices ?
        tokenToQuote(integrator.volumeZEC, Token.ZEC, quoteCurrency, tokenPrices) :
        new BigNumber(0), [tokenPrices, quoteCurrency, integrator.volumeZEC]);

    const allVolumeBCH = React.useMemo(() => tokenPrices ?
        tokenToQuote(integrator.volumeBCH, Token.BCH, quoteCurrency, tokenPrices) :
        new BigNumber(0), [tokenPrices, quoteCurrency, integrator.volumeBCH]);

    // All-time volume total

    const allVolume = React.useMemo(() => allVolumeBTC.plus(allVolumeZEC).plus(allVolumeBCH).toFixed(), [allVolumeBTC, allVolumeZEC, allVolumeBCH]);
    const stopPropagation = React.useCallback((e) => e.stopPropagation(), []);

    return <>
        <tr className="integrator" onClick={toggleExpanded}>
            <td className="col-0">{index}</td>
            <td className="col-1">
                <object role="presentation" data={logo} type="image/png">
                    <img role="presentation" alt="" src={DefaultLogo} />
                </object>
            </td>
            <td className="col-2"><div className="integrator-name">
                <span>{name}</span>
                <p><ExternalLink href={urlHref} onClick={stopPropagation}>{url}</ExternalLink></p>
            </div></td>
            <td className="col-3">
                <CurrencyIcon currency={quoteCurrency} />{dayVolume} {quoteCurrency.toUpperCase()}
            </td>
            <td className="col-4">
                <CurrencyIcon currency={quoteCurrency} />{allVolume} {quoteCurrency.toUpperCase()}
            </td>
        </tr>
        <tr className={classNames(`integrator-extra`, isActive ? "integrator-extra-open" : "integrator-extra-closed")}>
            <td colSpan={5}>
                <div>
                    <TitledSection top={<h1>{name}</h1>} onClose={toggleExpanded}>
                        <table>
                            <tr>
                                <td>Contract address</td>
                                <td className="monospace"><ExternalLink href={`${renNetwork.etherscan}/address/${integrator.contractAddress}`}>{integrator.contractAddress}</ExternalLink></td>
                            </tr>
                            <tr>
                                <td>Daily BTC Volume</td>
                                <td>
                                    {dayVolumeBTCReadable.toFixed()} BTC
                                (<CurrencyIcon currency={quoteCurrency} />{dayVolumeBTC.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                            <tr>
                                <td>Daily ZEC Volume</td>
                                <td>
                                    {dayVolumeZECReadable.toFixed()} ZEC
                                (<CurrencyIcon currency={quoteCurrency} />{dayVolumeZEC.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                            <tr>
                                <td>Daily BCH Volume</td>
                                <td>
                                    {dayVolumeBCHReadable.toFixed()} BCH
                                (<CurrencyIcon currency={quoteCurrency} />{dayVolumeBCH.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                            <tr>
                                <td>All time BTC Volume</td>
                                <td>
                                    {allVolumeBTCReadable.toFixed()} BTC
                                (<CurrencyIcon currency={quoteCurrency} />{allVolumeBTC.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                            <tr>
                                <td>All time ZEC Volume</td>
                                <td>
                                    {allVolumeZECReadable.toFixed()} ZEC
                                (<CurrencyIcon currency={quoteCurrency} />{allVolumeZEC.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                            <tr>
                                <td>All time BCH Volume</td>
                                <td>
                                    {allVolumeBCHReadable.toFixed()} BCH
                                (<CurrencyIcon currency={quoteCurrency} />{allVolumeBCH.toFixed()} {quoteCurrency.toUpperCase()})
                            </td>
                            </tr>
                        </table>
                    </TitledSection>
                </div>
            </td>
        </tr>
    </>;
};
