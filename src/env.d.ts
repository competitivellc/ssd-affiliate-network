/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types/2023-07-01" />

import type { TenantConfig } from "@config/tenants";

declare namespace App {
  interface Locals {
    tenant: TenantConfig;
    countryCode: string;
    hostname: string;
    DB: import("@cloudflare/workers-types").D1Database;
    PRICE_CACHE: import("@cloudflare/workers-types").KVNamespace;
    runtime: {
      env: {
        DB: import("@cloudflare/workers-types").D1Database;
        PRICE_CACHE: import("@cloudflare/workers-types").KVNamespace;
        AMAZON_API_KEY?: string;
        BHPHOTO_API_KEY?: string;
        NEWEGG_API_KEY?: string;
        AMAZON_ASSOCIATE_TAG_US: string;
        AMAZON_ASSOCIATE_TAG_UK: string;
        AMAZON_ASSOCIATE_TAG_DE: string;
        AMAZON_ASSOCIATE_TAG_CA: string;
        AMAZON_ASSOCIATE_TAG_DEFAULT: string;
      };
      caches: import("@cloudflare/workers-types").CacheStorage;
      ctx: {
        waitUntil: (promise: Promise<unknown>) => void;
      };
    };
  }
}
