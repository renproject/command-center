import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import moment from "moment";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { fetchDiscourseRIPs, RIP } from "../../../lib/discourse/discourse";
import { classNames } from "../../../lib/react/className";
import { ExternalLink } from "../../../views/ExternalLink";

export const LiveRIPs: React.FC = () => {
    const [RIPs, setDiscourseRIPs] = useState<RIP[]>([]);

    useEffect(() => {
        fetchDiscourseRIPs()
            .then((rips) => {
                console.log(rips)
                rips = rips.filter(function(element) {
                return element["content"].includes('Status: LIVE');
                });
                console.log(rips)
                setDiscourseRIPs(rips);

            })
            .catch(console.error);
    }, []);

    const generateLink = (rip: RIP): JSX.Element => {
        return (
            <div key={rip["isoDate"]} className="news--slider--slide">
                <div className="news--slider--slide--content">
                    <ExternalLink href={rip.link} className="live">
                        <span className={classNames("live-blue", "is-live")}>
                            {rip.title} &rarr;
                        </span>
                    </ExternalLink>
                </div>
            </div>
            );
        }

    return (
        <div
            className={classNames(
                "news--slider--container",
                1 ? "loaded" : "",
            )}
        >
            <Slider
                autoplay
                autoplaySpeed={5000}
                pauseOnFocus
                arrows={false}
                dots={false}
            >
            {RIPs.map(generateLink)}
            </Slider>
        </div>
    );
};
