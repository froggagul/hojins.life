import { getCollection, type CollectionEntry } from "astro:content";
import { z } from "astro/zod";
import rawProfile from "../data/profile.json";

const experience = z.object({
  organization: z.string(),
  role: z.string(),
  period: z.string(),
  detail: z.string(),
});
export const profile = z
  .object({
    name: z.string(),
    koreanName: z.string(),
    email: z.email(),
    github: z.url(),
    cv: z.string(),
    source: z.url(),
    verifiedOn: z.string(),
    cvNote: z.string().optional(),
    interests: z.array(z.string()),
    introduction: z.array(
      z.array(z.union([
        z.string(),
        z.object({ text: z.string(), url: z.url() }),
      ])),
    ),
    education: z.array(experience),
    experience: z.array(experience),
  })
  .parse(rawProfile);

export async function getWriting() {
  const all = await getCollection("blog");
  const urls = new Set<string>();
  const episodes = new Set<string>();
  for (const { data } of all) {
    const path = data.url.normalize('NFC');
    if (urls.has(path)) throw new Error(`Duplicate post URL: ${path}`);
    urls.add(path);
    if (data.series) {
      const key = JSON.stringify([data.series, data.order]);
      if (episodes.has(key)) throw new Error(`Duplicate episode: ${key}`);
      episodes.add(key);
    }
  }
  return all.filter(({ data }) => !data.draft).sort(
    (a, b) =>
      b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id),
  );
}
export const seriesUrl = (name: string) => `/series/${encodeURIComponent(name)}/`;
export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;

export function getSeries(posts: CollectionEntry<'blog'>[], name: string) {
  return posts.filter(({ data }) => data.series === name)
    .sort((a, b) => a.data.order! - b.data.order!);
}

export function postDescription(post: CollectionEntry<'blog'>) {
  if (post.data.description) return post.data.description;
  // Plain-text excerpt for metadata; never use the source template description.
  return (post.body ?? '').replace(/```[\s\S]*?```|\$\$[\s\S]*?\$\$/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>|[#*`>_~]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160) || post.data.title;
}
export async function getPublications() {
  return (await getCollection("publications")).sort(
    (a, b) => b.data.year - a.data.year,
  );
}
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export async function getProjects() {
  return (await getCollection("projects")).sort(
    (a, b) => b.data.year - a.data.year || a.id.localeCompare(b.id),
  );
}
export const projectUrl = (id: string) => `/projects/${id}/`;
