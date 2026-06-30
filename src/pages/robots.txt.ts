import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { hostname } = locals;
  const body = `User-agent: *
Allow: /
Sitemap: https://${hostname}/sitemap.xml
`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
