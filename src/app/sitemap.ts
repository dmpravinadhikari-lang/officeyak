import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/blog";
import { destinationSlugs } from "@/modules/study/destinations";
import { softwareSlugs } from "@/modules/software/pages";
import { SCHOLARSHIPS } from "@/modules/finder/scholarships";
import { BRAND } from "@/lib/brand";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || `https://${BRAND.domain}`;

/**
 * Built from the content itself, so a new guide adds its own URL and nothing
 * has to be remembered. Only public pages belong here, everything under /app
 * is behind a login and must never be listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allPosts().map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedOn),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // The free tools are the main way students arrive, so they belong here too.
  const tools = [
    "/tools", "/tools/eligibility", "/tools/cost", "/tools/loan",
    "/tools/checklist", "/tools/document-checklist", "/tools/universities",
    "/tools/scholarships", "/tools/compare", "/tools/cv-maker",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "/tools" ? 0.9 : 0.8,
  }));

  // Each scholarship has its own page, with its own title and canonical,
  // separate from the finder that lists them. Built from the same data the
  // finder reads, so a new scholarship's page is never missing from here.
  const scholarships = SCHOLARSHIPS.map((s) => ({
    url: `${SITE}/tools/scholarships/${s.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // A destination page answers "study in the UK" and "cost of a UK student
  // visa", which are the two highest intent searches a student makes.
  const destinations = destinationSlugs().map((slug) => ({
    url: `${SITE}/study/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // The software pages are what an owner searches for, and they are the pages
  // that actually sell, so they carry the same priority as a destination.
  const software = softwareSlugs().map((slug) => ({
    url: `${SITE}/software/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/software`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...software,
    ...destinations,
    { url: `${SITE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...tools,
    ...scholarships,
    ...posts,
  ];
}
