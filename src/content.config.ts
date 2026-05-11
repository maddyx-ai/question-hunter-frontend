import { defineCollection } from "astro/content/config";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/data/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      pubDate: z.coerce.date(),
      meta_description: z.string().max(160).optional(),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog };
