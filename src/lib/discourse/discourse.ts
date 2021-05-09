import Parser from 'rss-parser';

const DISCOURSE_FEED_URL = "https://cors-anywhere.herokuapp.com/https://forum.renproject.io/c/rip/10.rss";

export interface RIP {
    categories: string[];
    content: string;
    contentSnippet: string;
    creator: string;
    guid: string;
    isoDate: string;
    link: string;
    pubDate: string;
    title: string;
}

export const fetchDiscourseRIPs = async (
): Promise<RIP[]> => {
    const feedurl = `${DISCOURSE_FEED_URL}`;
    const parser = new Parser();
    const resp = await parser.parseURL(feedurl);
    return resp.items as RIP[];
};
