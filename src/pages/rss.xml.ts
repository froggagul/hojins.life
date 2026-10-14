import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWriting, postDescription } from '../lib/content';

export async function GET({ site }: APIContext) {
  const posts = await getWriting();
  return rss({
    title: 'Hojin Jung — Blog',
    description: 'Research notes, personal essays, and everyday life, in Korean and English.',
    site: site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: new Date(`${post.data.date}T00:00:00Z`),
      link: post.data.url,
      description: postDescription(post),
      categories: [...post.data.tags, ...(post.data.series ? [post.data.series] : [])],
    })),
  });
}
