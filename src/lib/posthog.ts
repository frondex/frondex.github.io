import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_EnMFULqgEJG0b6gFs63xM01gbG6gxVqxirdZ18muTZM', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    // Capture pageviews and clicks automatically
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export default posthog;