import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";

const date = z.preprocess(value => value instanceof Date ? value.toISOString().slice(0, 10) : value, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}, 'Use a valid YYYY-MM-DD date'));
const postUrl = z.string().regex(/^\/posts\/(?:[^/?#%\\]+\/)+$/).refine(
  value => value.split('/').every(part => part !== '.' && part !== '..'),
  'Use an unencoded absolute post path with a trailing slash',
);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    date,
    updated: date.optional(),
    series: z.string().trim().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    url: postUrl,
    language: z.enum(["ko", "en"]).optional(),
    draft: z.boolean().default(false),
  }).refine(data => Boolean(data.series) === (data.order !== undefined), 'Series and order must be provided together'),
});

const publications = defineCollection({
  loader: file("src/data/publications.json"),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    year: z.number().int(),
    status: z.enum(["published", "accepted", "preprint"]),
    selected: z.boolean().default(false),
    thumbnail: z.object({
      src: z.string().startsWith('/'),
      poster: z.string().startsWith('/'),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      clips: z.array(z.object({
        url: z.url(),
        start: z.number().nonnegative(),
        end: z.number().positive(),
      }).refine(clip => clip.end > clip.start, 'Clip end must follow its start')).min(1),
    }).optional(),
    links: z.array(z.object({ label: z.string(), url: z.url() })),
    relatedPost: postUrl.optional(),
  }),
});

const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    year: z.number().int(),
    status: z.string().min(1),
    selected: z.boolean().default(false),
    description: z.string().min(1),
    overview: z.array(z.string().min(1)).min(1),
  }),
});

export const collections = { blog, publications, projects };
