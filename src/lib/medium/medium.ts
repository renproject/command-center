import axios from "axios";

const MEDIUM_FEED_URL = "https://medium-article-feed.herokuapp.com";

export interface MediumPost {
    title: string[];
    link: string[];
    guid: unknown[];
    category: string[];
    "dc:creator": string[];
    pubDate: string[];
    "atom:updated": string[];
    "content:encoded": string[];
}

export const fetchMediumPosts = async (
    mediumName: string,
): Promise<MediumPost[]> => {
    const feedurl = `${MEDIUM_FEED_URL}/${mediumName}`;
    const resp = await axios.get(feedurl);
    return resp.data.response as MediumPost[];
};
