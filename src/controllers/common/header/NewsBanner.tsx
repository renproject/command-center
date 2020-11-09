import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import moment from "moment";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { fetchMediumPosts, MediumPost } from "../../../lib/medium/medium";
import { classNames } from "../../../lib/react/className";
import { ExternalLink } from "../../../views/ExternalLink";

export const NewsBanner: React.FC = () => {
  const freshness = 3; // days
  const take = 4;
  const [mediumPosts, setMediumPosts] = useState<MediumPost[]>([]);

  useEffect(() => {
    fetchMediumPosts("renproject")
      .then((posts) => {
        setMediumPosts(posts.slice(0, take));
      })
      .catch(console.error);
  }, []);

  const isNew = (timestamp: number): boolean => {
    // If freshness is undefined or <= zero, then don't show "new" label
    if (!freshness || freshness <= 0) {
      return false;
    }
    // Timestamps can be in the future (due to timezones)
    const now = Date.now();
    if (now <= timestamp) {
      return true;
    }
    // Otherwise check the number of days in between
    const daysBetween = (now - timestamp) / 1000 / 60 / 60 / 24;
    return daysBetween < freshness;
  };

  const generateLink = (post: MediumPost): JSX.Element => {
    const unixDate = moment(post["atom:updated"][0]).unix() * 1000;
    const isNewPost = isNew(unixDate);
    return (
      <div key={unixDate} className="news--slider--slide">
        <div className="news--slider--slide--content">
          <ExternalLink href={post.link[0]} className="new">
            <span className={classNames("new-blue", isNewPost ? "is-new" : "")}>
              {post.title[0]} &rarr;
            </span>
          </ExternalLink>
        </div>
      </div>
    );
  };

  return (
    <div
      className={classNames(
        "news--slider--container",
        mediumPosts.length ? "loaded" : "",
      )}
    >
      <Slider
        autoplay
        autoplaySpeed={5000}
        pauseOnFocus
        arrows={false}
        dots={false}
      >
        {mediumPosts.map(generateLink)}
      </Slider>
    </div>
  );
};
