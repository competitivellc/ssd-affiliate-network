import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  const key = params.key;
  const storedKey: string | undefined = locals.runtime?.env?.INDEXNOW_KEY;
  const keyLocation = `https://${locals.hostname}/${key}.txt`;

  if (!storedKey || key !== storedKey) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(storedKey, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Robots-Tag": "noindex, nofollow",
      "Link": `<${keyLocation}>; rel="indexnow"`,
    },
  });
};
