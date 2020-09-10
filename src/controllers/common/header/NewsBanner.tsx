import moment from "moment";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { fetchMediumPosts, MediumPost } from "../../../lib/medium/medium";
import { ExternalLink } from "../../../views/ExternalLink";

export const NewsBanner: React.FC = () => {
  const freshness = 3;
  const [loading, setLoading] = useState(true);
  const [mediumPosts, setMediumPosts] = useState<MediumPost[]>([]);

  useEffect(() => {
    fetchMediumPosts("renproject").then((posts) => {
      setMediumPosts(posts);
    });
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
    return (
      <div className="medium-banner--link content--links" key={unixDate}>
        <ExternalLink href={post.link[0]}>
          <span className={isNew(unixDate) ? "new" : ""}>
            {post.title[0]} &rarr;
          </span>
        </ExternalLink>
      </div>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <Slider autoplay autoplaySpeed={5000} pauseOnFocus>
      {mediumPosts.map(generateLink)}
    </Slider>
  );
};
