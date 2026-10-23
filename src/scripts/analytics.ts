// Analytics (PostHog, EU cloud), shared with the Horwell site under one
// Stapleton Enterprises project and told apart by the `site` property.
// Cookieless, so there's no consent banner. Only runs on the live domain, so
// localhost stays out of the numbers; add ?posthog-debug to the URL to send
// events from anywhere. The /horwell/ and /place/ previews don't load this.

import posthog from 'posthog-js';

const POSTHOG_TOKEN = 'phc_wYpiMzEnLCExHtkFTWXCAnJW9emzeqKzuStPu5B4S7vQ';
const LIVE_HOSTS = ['edwardstapleton.co.uk', 'www.edwardstapleton.co.uk'];

/** Where on the page a contact link sits, so header and end-of-timeline clicks can be compared. */
function placement(el: Element) {
  if (el.closest('.tl-header')) return 'header';
  if (el.closest('.caption__contact')) return 'contact';
  return 'other';
}

function contactEvent(href: string) {
  if (href.startsWith('mailto:')) return 'email_clicked';
  if (href.startsWith('tel:')) return 'phone_call_clicked';
  if (href.includes('linkedin.com')) return 'linkedin_clicked';
  return null;
}

export function initAnalytics() {
  const debug = new URLSearchParams(location.search).has('posthog-debug');
  if (!(LIVE_HOSTS.includes(location.hostname) || debug)) return;

  posthog.init(POSTHOG_TOKEN, {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-08-30',
    cookieless_mode: 'always',
    person_profiles: 'identified_only',
    // The timeline rewrites the hash as you move between worlds; count that as
    // chapter_viewed below rather than as extra pageviews.
    capture_pageview: true,
    debug,
  });
  posthog.register({ site: 'edwardstapleton' });

  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element).closest?.('a[href]');
      if (!link) return;
      const event = contactEvent(link.getAttribute('href')!);
      if (event) posthog.capture(event, { placement: placement(link) });
    },
    { capture: true },
  );

  addEventListener('timeline:world', (e) => {
    posthog.capture('chapter_viewed', { chapter: (e as CustomEvent<string>).detail });
  });
}
