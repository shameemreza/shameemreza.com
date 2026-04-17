import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  const blogPosts = posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((post) => ({
      type: 'post' as const,
      title: post.data.title,
      description: post.data.description,
      href: `/${post.id}/`,
      category: post.data.category,
    }));

  return new Response(JSON.stringify(blogPosts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
