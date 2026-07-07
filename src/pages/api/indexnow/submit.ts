import type { APIRoute } from "astro";
import { submitBatch } from "@lib/indexnow";

export const POST: APIRoute = async ({ request, locals }) => {
  const adminToken = locals.runtime?.env?.INDEXNOW_ADMIN_TOKEN;
  const authHeader = request.headers.get("Authorization");

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key: string | undefined = locals.runtime?.env?.INDEXNOW_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "INDEXNOW_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { host?: string; urls?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.host) {
    body.host = locals.hostname;
  }

  if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
    return new Response(JSON.stringify({ error: "urls array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await submitBatch(key, body.host, body.urls);

  return new Response(JSON.stringify(result), {
    status: result.failed === 0 ? 200 : 207,
    headers: { "Content-Type": "application/json" },
  });
};
