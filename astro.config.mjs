import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "compile",
    routes: {
      strategy: "include",
      include: ["/*"],
      exclude: ["/_astro/*", "/favicon-external.svg", "/favicon-portable.svg"],
    },
  }),
  integrations: [tailwind()],
});
