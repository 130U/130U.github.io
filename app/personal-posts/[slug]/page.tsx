import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import RobotActionPathsPost from "../_articles/RobotActionPathsPost";
import {
  getPersonalPost,
  personalPosts,
  type PersonalPostSlug,
} from "../../lib/content/posts";
import { createPageMetadata, SITE_NAME, absoluteUrl } from "../../lib/content/site";

export const dynamicParams = false;

const postComponents = {
  "from-vision-and-instructions-to-robot-actions": RobotActionPathsPost,
} satisfies Record<PersonalPostSlug, ComponentType>;

export function generateStaticParams() {
  return personalPosts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPersonalPost(slug);
  if (!post) notFound();

  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: post.path,
    type: "article",
    publishedTime: post.publishedDate,
    image: post.socialImage,
  });
}

export default async function PersonalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPersonalPost(slug);
  if (!post) notFound();
  const Post = postComponents[post.slug];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    image: absoluteUrl(post.socialImage.url),
    mainEntityOfPage: absoluteUrl(post.path),
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replaceAll("<", "\\u003c"),
        }}
      />
      <Post />
    </>
  );
}
