"use client";

// PostHog — thin wrapper that mirrors the mobile app's analytics
// surface so `track()` / `identifyUser()` calls feel identical.
// If NEXT_PUBLIC_POSTHOG_KEY is empty, every function silently no-ops
// so local dev + tests don't pollute the production project.

import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const ENABLED = Boolean(KEY);

let initialized = false;

export function initAnalytics() {
  if (!ENABLED || initialized || typeof window === "undefined") return;

  posthog.init(KEY!, {
    api_host: HOST,
    // Explicit track() calls only. No autocapture = cleaner event taxonomy.
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    respect_dnt: true,
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export function identifyUser(userId: string | null, traits?: Record<string, unknown>) {
  if (!ENABLED || typeof window === "undefined") return;
  if (!userId) {
    // Sign-out — clear identity so the next session is anonymous.
    posthog.reset();
    return;
  }
  posthog.identify(userId, traits);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!ENABLED || typeof window === "undefined") return;
  posthog.capture(event, properties);
}

// Canonical funnel-event names. Using constants + a type union means
// typos show up at compile time + the funnel dashboard stays clean.
export const Funnel = {
  // Marketing
  ContactSubmitted: "contact_submitted",
  JoinSignUpStarted: "join_signup_started",
  JoinSignUpFailed: "join_signup_failed",
  JoinSignUpSucceeded: "join_signup_succeeded",
  // Auth
  SignInSubmitted: "sign_in_submitted",
  SignInSucceeded: "sign_in_succeeded",
  SignInFailed: "sign_in_failed",
  // Billing
  PlanSelected: "plan_selected",
  CheckoutRedirected: "checkout_redirected",
  SubscriptionActive: "subscription_active",
  // In-app
  RequestSubmitted: "request_submitted",
  PropertySaved: "property_saved",
} as const;

export type FunnelEvent = (typeof Funnel)[keyof typeof Funnel];

export const isAnalyticsEnabled = ENABLED;
