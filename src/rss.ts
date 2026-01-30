import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export const fetchFeed = async (feedURL: string) => {
  const rssFeed: RSSFeed & { [k: string]: unknown } = new XMLParser().parse(await (await fetch(feedURL, {
    headers: { 'user-agent': 'gator' },
  })).text()).rss;
  if (!rssFeed.channel) throw Error("no channel");
  for (const key of ['title', 'link', 'description'] as const)
    if (!rssFeed.channel[key] || typeof rssFeed.channel[key] !== 'string') throw Error(`no ${key}`);
  const { title, link, description, item } = rssFeed.channel;
  const feed: RSSFeed = {
    channel: { title, link, description, item: [] },
  };
  const items: RSSItem[] = item ? Array.isArray(item) ? item : [item] : [];
  for (const it of items) {
    if ((['title', 'link', 'description', 'pubDate'] as const).some(key => !it[key] || typeof it[key] !== 'string'))
      continue;
    feed.channel.item.push(it);
  }
  return feed;
};
