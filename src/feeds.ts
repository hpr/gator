import { XMLParser } from "fast-xml-parser";
import { Feed, User } from "./lib/db/schema";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createPost } from "./lib/db/queries/posts";

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
    feed.channel.item.push({ title: it.title, link: it.link, description: it.description, pubDate: it.pubDate });
  }
  return feed;
};

export const printFeed = (feed: Feed, user: User) => {
  console.log(`Feed for ${user.name}: ${feed.name} (${feed.url})`);
};

export const scrapeFeeds = async () => {
  const next = await getNextFeedToFetch();
  await markFeedFetched(next.id);
  const feed = await fetchFeed(next.url);
  console.log(`From "${feed.channel.title}":`);
  for (const it of feed.channel.item) {
    await createPost(next.id, it.title, it.link, it.description, new Date(it.pubDate));
    console.log(`* ${it.title}`);
  }
};
