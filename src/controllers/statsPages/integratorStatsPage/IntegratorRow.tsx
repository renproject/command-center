import { RenNetworkDetails } from "@renproject/contracts";
import { Currency, CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback } from "react";
import { isDefined } from "../../../lib/general/isDefined";

import { Integrator, TokenAmount } from "../../../lib/graphQL/queries";
import { classNames } from "../../../lib/react/className";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import DefaultLogo from "../../../styles/images/default-integrator.png";
import { ExternalLink } from "../../../views/ExternalLink";
import { TokenSection } from "../../../views/TitledSection";
import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";
import { AnyTokenBalance, ConvertCurrency } from "../../common/TokenBalance";
import Integrators from "./integrators.json";

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
    integrator: { now: Integrator; day: Integrator };
    isActive: boolean;
    setActiveIntegrator: (id: string | null) => void;
}

const IntegratorTokenValue = ({
    symbol,
    volume,
    title,
    txCount,
    quoteCurrency,
}: {
    symbol: string;
    title: string;
    volume: TokenAmount | undefined;
    txCount: number | undefined;
    quoteCurrency: Currency;
}) => {
    return (
        <div>
            <span className="lighter">{title}: </span>
            {volume ? (
                <AnyTokenBalance
                    amount={volume.amount}
                    decimals={volume.asset!.decimals}
                />
            ) : (
                "..."
            )}{" "}
            {symbol}
            <span className="lighter">{" - "}</span>
            <CurrencyIcon currency={quoteCurrency} />
            {volume && quoteCurrency === Currency.BTC && symbol === "BTC" ? (
                <AnyTokenBalance
                    amount={volume.amount}
                    decimals={volume.asset!.decimals}
                />
            ) : volume ? (
                <ConvertCurrency
                    from={Currency.USD}
                    to={quoteCurrency}
                    amount={volume.amountInUsd}
                />
            ) : (
                "..."
            )}
            {isDefined(txCount) ? (
                <span className="lighter"> ({txCount} txs)</span>
            ) : (
                <></>
            )}
        </div>
    );
};

export const IntegratorRow: React.FC<Props> = ({
    index,
    integrator,
    isActive,
    setActiveIntegrator,
}) => {
    const { renNetwork } = Web3Container.useContainer();
    const { quoteCurrency } = NetworkContainer.useContainer();

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

    // Day volume total

    const dayVolumeInUsd = integrator.day.volume.reduce(
        (acc, value) => acc.plus(value.amountInUsd),
        new BigNumber(0),
    );
    const allVolumeInUsd = integrator.now.volume.reduce(
        (acc, value) => acc.plus(value.amountInUsd),
        new BigNumber(0),
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
                    <ConvertCurrency
                        amount={dayVolumeInUsd}
                        from={Currency.USD}
                        to={quoteCurrency}
                    />
                    {quoteCurrency.toUpperCase()}
                </td>
                <td className="col-4">
                    <CurrencyIcon currency={quoteCurrency} />
                    <ConvertCurrency
                        amount={allVolumeInUsd}
                        from={Currency.USD}
                        to={quoteCurrency}
                    />
                    {quoteCurrency.toUpperCase()}
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
                        <div>
                            {integrator.now.volume
                                .sortBy((value) => value.amountInUsd.toNumber())
                                .reverse()
                                .filter((value) => value.asset)
                                .keySeq()
                                .map((symbol) => {
                                    const nowTxCount = integrator.now.txCount.get(
                                        symbol,
                                    );
                                    const nowVolume = integrator.now.volume.get(
                                        symbol,
                                    );
                                    const dayTxCount = integrator.day.txCount.get(
                                        symbol,
                                    );
                                    const dayVolume = integrator.day.volume.get(
                                        symbol,
                                    );

                                    return (
                                        <TokenSection
                                            icon={<TokenIcon token={symbol} />}
                                        >
                                            <IntegratorTokenValue
                                                symbol={symbol}
                                                volume={nowVolume}
                                                title={"All time"}
                                                txCount={nowTxCount}
                                                quoteCurrency={quoteCurrency}
                                            />
                                            <IntegratorTokenValue
                                                symbol={symbol}
                                                volume={dayVolume}
                                                title={"24 hour"}
                                                txCount={dayTxCount}
                                                quoteCurrency={quoteCurrency}
                                            />
                                        </TokenSection>
                                    );
                                })
                                .toArray()}
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
};
