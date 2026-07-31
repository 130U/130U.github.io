export type PersonalPost = {
  number: string;
  slug: string;
  path: string;
  headingId: string;
  kicker: string;
  title: string;
  description: string;
  publishedDate: string;
  publishedDateDisplay: string;
  readingTime: string;
  socialImage: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

export const personalPosts = [
  {
    number: "001",
    slug: "from-vision-and-instructions-to-robot-actions",
    path: "/personal-posts/from-vision-and-instructions-to-robot-actions/",
    headingId: "posts-heading",
    kicker: "RESEARCH NOTE",
    title: "From Vision and Instructions to Robot Actions: Two Emerging Paths",
    description:
      "A practical taxonomy for VLM-to-VLA and video/world-model-to-action systems, organized by training targets, internal representations, and inference-time computation.",
    publishedDate: "2026-07-29",
    publishedDateDisplay: "July 29, 2026",
    readingTime: "12 min read",
    socialImage: {
      url: "/assets/posts/wam-vla-two-paths-en.png",
      width: 2880,
      height: 1620,
      alt: "Diagram comparing a VLM-to-VLA route with video and world-model routes to robot action",
    },
  },
] as const satisfies readonly PersonalPost[];

export type PersonalPostSlug = (typeof personalPosts)[number]["slug"];

const postSlugs = new Set<string>();
const postHeadingIds = new Set<string>();
for (const post of personalPosts) {
  if (postSlugs.has(post.slug)) {
    throw new Error(`Duplicate personal post slug: ${post.slug}`);
  }
  if (post.path !== `/personal-posts/${post.slug}/`) {
    throw new Error(`Personal post path does not match its slug: ${post.slug}`);
  }
  if (postHeadingIds.has(post.headingId)) {
    throw new Error(`Duplicate personal post heading ID: ${post.headingId}`);
  }
  postSlugs.add(post.slug);
  postHeadingIds.add(post.headingId);
}

export function getPersonalPost(slug: string) {
  return personalPosts.find((post) => post.slug === slug);
}
