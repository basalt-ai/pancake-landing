"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const POSTHOG_KEY = "phc_zPxWVjFcxYkbR7VnfdFkxvWdaGNChzVa2Yjmwe5PSrey";
const POSTHOG_HOST = "https://e.getpancake.ai";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "li_fat_id",
  "msclkid",
  "rdt_cid",
  "ttclid",
] as const;

let initialized = false;

export function PostHogAttribution() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: POSTHOG_UI_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
      cross_subdomain_cookie: true,
    });

    const attribution = readAttribution();
    const context = readContext();
    const initialAttribution = prefixKeys("pancake_initial_", {
      ...attribution,
      ...context,
    });
    const latestAttribution = prefixKeys("pancake_latest_", {
      ...attribution,
      ...context,
    });

    posthog.register_once(initialAttribution);
    posthog.register(latestAttribution);
    posthog.setPersonProperties(latestAttribution, initialAttribution);

    posthog.capture("$pageview", {
      ...attribution,
      ...context,
    });

    if (Object.keys(attribution).length > 0 || document.referrer) {
      posthog.capture("marketing_landing_viewed", {
        ...attribution,
        ...context,
      });
    }
  }, []);

  return null;
}

function readAttribution() {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 500);
  }
  return attribution;
}

function readContext() {
  const context: Record<string, string> = {
    landing_url: cleanLandingUrl(window.location.href),
  };
  if (document.referrer) context.referrer = document.referrer.slice(0, 1000);
  return context;
}

function prefixKeys(prefix: string, values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [`${prefix}${key}`, value]),
  );
}

function cleanLandingUrl(value: string) {
  try {
    const url = new URL(value);
    url.searchParams.forEach((_, key) => {
      if (!attributionKeys.includes(key as (typeof attributionKeys)[number])) {
        url.searchParams.delete(key);
      }
    });
    url.hash = "";
    return url.toString();
  } catch {
    return value.slice(0, 1000);
  }
}
