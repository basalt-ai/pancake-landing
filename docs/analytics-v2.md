# Pancake v2 analytics and advertising runbook

## Purpose and current status

This is the operational source of truth for tracking on the Pancake v2 landing page. The current funnel has only two outcomes:

- Join the waitlist.
- Book a call.

A new waitlist record is the only primary conversion that can be measured today. A booked meeting will become a primary conversion only after a signed Zcal webhook proves that the booking genuinely exists. Opening the scheduler, loading it, clicking its fallback link, or reaching a URL such as `/booked` is not a booked conversion.

As of this document:

- The implementation is on branch `codex/ads-tracking-v2`, rebased from the current landing-page repository.
- The Google Tag Manager changes are a draft and are **not published**.
- The code is **not deployed to production** by this runbook.
- Meta Lead tracking must remain paused until the browser pixel and server credentials are confirmed to belong to the same Pancake dataset.
- Reddit and Google Ads conversions must remain absent until the external account blockers below are resolved.

No access token, webhook secret, API key, or local environment value belongs in this document.

## Measurement principles

1. The website emits vendor-neutral product events. GTM maps those events to GA4 and advertising platforms.
2. A click or modal open is never counted as a primary conversion.
3. A waitlist conversion is emitted only after Airtable creates a genuinely new row.
4. Durable conversions use a stable server-issued event ID so browser and server copies can be deduplicated.
5. URLs sent to analytics exclude arbitrary query strings and form values. `page_path` is always query-free; `page_location` preserves only the exact allow-listed campaign and click identifiers needed for attribution.
6. Preview and local traffic must not pollute production advertising datasets.
7. No tracking change is automatically published to GTM or promoted to production.

## Exact v2 event taxonomy

Every acquisition event has `schema_version=1` and includes:

- `event_id`
- `event_timestamp_ms`
- query-free `page_path`
- `page_location` containing only origin, path, and approved campaign/click parameters
- `page_title`
- `funnel_stage`
- `conversion_tier`
- `attribution_id` when the attribution cookie contains a valid ID

### Supporting page-view event

| Event | When it fires | Important fields | Conversion status |
| --- | --- | --- | --- |
| `page_view` | Once on the initial render and once for each Next.js App Router navigation | `page_view_kind=initial\|virtual`, `source=next_app_router` | Supporting event only |

### Waitlist events

All waitlist events use `form_id=landing_waitlist` and `lead_type=waitlist`.

| Event | Tier | Exact firing rule | Event-specific fields |
| --- | --- | --- | --- |
| `lead_form_viewed` | Micro | The waitlist modal opens from an approved CTA | `open_method=cta`, `cta_id` |
| `lead_form_started` | Micro | The visitor first interacts with the waitlist form | `cta_id` |
| `lead_submit_failed` | Diagnostic | Client validation, network, or server submission failure | `failure_type=validation\|network\|server`; optional HTTP `status_code` from 400 to 599 |
| `lead_submitted` | **Primary** | Airtable's atomic email upsert confirms that it created a new row | `cta_id`, `handoff_count`; event ID must match `lead.<64 lowercase hex characters>` |

Duplicate emails and honeypot submissions may show the success UI, but the API returns `newly_created=false` and no conversion event ID. They must not emit `lead_submitted` or any paid-media conversion.

Approved waitlist CTA IDs are:

- `waitlist_nav`
- `waitlist_hero`
- `waitlist_lead_finding`
- `waitlist_pricing_card`
- `waitlist_final`
- `waitlist_pricing_page`

### Scheduler events

All scheduler events use `scheduler_id=ZEHl48rv`.

| Event | Tier | Exact firing rule | Event-specific fields |
| --- | --- | --- | --- |
| `scheduler_opened` | Micro | The embedded scheduler modal opens | `presentation=embed`, `cta_id` |
| `scheduler_loaded` | Micro | The Zcal iframe reports that it loaded | `presentation=embed`, `cta_id` |
| `scheduler_fallback_clicked` | Micro | The visitor clicks the fallback link to Zcal | `cta_id` |
| `meeting_booked` | **Future primary** | A verified and replay-safe signed Zcal webhook proves a completed booking | Contract to be finalized from the real webhook payload; never emitted by the browser alone |

Approved scheduler CTA IDs are:

- `call_hero`
- `call_final`
- `call_pricing_page`

The old `trial_click`, `meeting_click`, onboarding, Slack, and subscription events are not part of the v2 funnel and must not be configured as v2 primary conversions.

## Attribution and privacy behavior

The first-party attribution cookie keeps an opaque attribution ID and an allow-listed, bounded history. Supported campaign identifiers include UTM parameters plus `fbclid`, `gclid`, `gbraid`, `wbraid`, `li_fat_id`, `msclkid`, `rdt_cid`, `ttclid`, and `twclid`.

PostHog receives manual page views and the allow-listed acquisition events. On the landing integration, autocapture, page-leave capture, heatmaps, performance capture, and session recording are disabled. Referrers are reduced to their origin, and arbitrary URL parameters are removed.

The waitlist API normalizes email for duplicate lookup, performs an email-keyed Airtable upsert, and returns a stable opaque `lead.<64 lowercase hex characters>` conversion ID only when Airtable reports a newly created row. The digest hides Airtable's internal record ID. Slack notification is best-effort and happens only for a new row. No email address or free-form field is placed in the browser data layer.

## Vendor ownership and known identifiers

| Vendor or surface | Owner | Known identifiers and intended behavior |
| --- | --- | --- |
| GTM web container | GTM | Account `6360623272`; container `255346716`; public ID `GTM-P3Z79WKD`; current draft workspace `6` |
| GTM server container | GTM / existing server endpoint | Container `255385456`; public ID `GTM-PRNN2DZS`; workspace `7`; GA transport endpoint `https://gtm.getpancake.ai` |
| Google Analytics 4 | GTM | Measurement ID `G-6KWBYRZSDX`; receives the explicit page view and all v2 acquisition events |
| PostHog | Website code | EU Cloud project `Pancake-v1`, project ID `170554`; direct sanitized capture through `e.getpancake.ai` |
| Meta | Base pixel in website code; browser Lead mapping in GTM; server Lead delivery inside the verified waitlist API | Browser pixel `1668160384441545`; Pancake ad account `538746742816593`; direct initial `PageView` remains; browser and CAPI `Lead` must share the same opaque `event_id` |
| LinkedIn | GTM only | Ad account `545060035`; company page `104917696`; partner ID `9238938`; event-specific waitlist conversion `29569610` named `v2_waitlist_lead_submitted` |
| X Ads | GTM only | Ads account `18ce55v07al`; profile `@getpancake_ai`; website source `rehvg`; Lead event `rehvk`, full event ID `tw-rehvg-rehvk` |
| Reddit | None until Pancake has its own managed account | Existing pixel `a2_hvwir7k3hfy1` belongs to BasaltAI Main Ad Account and must not be used for Pancake |
| Google Ads | None until a usable Pancake account exists | Only `[old] Pancake`, customer `904-799-9500`, is currently accessible and appears deprecated; the observed `AW-17671023924` ownership is not reconciled and must not be guessed |
| Zcal | Embedded UI now; signed server webhook later | Scheduler `ZEHl48rv`; scheduler interactions are micro events only |

Steady-state ownership is deliberate:

- GTM and Meta base code remain in the root layout.
- Direct LinkedIn and Reddit code are removed from the new website code so they cannot double-fire with GTM.
- GA4 has no separate direct `gtag` installation.
- PostHog remains direct because it is product analytics, not a GTM advertising tag.

## Exact unpublished GTM draft

The web-container workspace is a draft. Do not describe these changes as live until a named version is manually published.

### Data Layer Variables

The draft contains these version-2 variables:

- `DLV - event_id`
- `DLV - schema_version`
- `DLV - page_path`
- `DLV - page_location`
- `DLV - page_title`
- `DLV - page_view_kind`
- `DLV - funnel_stage`
- `DLV - conversion_tier`
- `DLV - cta_id`
- `DLV - form_id`
- `DLV - lead_type`
- `DLV - handoff_count`
- `DLV - failure_type`
- `DLV - status_code`
- `DLV - scheduler_id`
- `DLV - presentation`
- `DLV - attribution_id`

### Triggers

- `Production page load`, page-view trigger limited to `getpancake.ai` and `www.getpancake.ai`.

- `v2 acquisition events`, custom-event regex:

  `^(lead_form_viewed|lead_form_started|scheduler_opened|scheduler_loaded|scheduler_fallback_clicked|lead_submit_failed|lead_submitted)$`

- `v2 waitlist lead submitted`, exact custom event:

  `lead_submitted`

  It also requires the exact production hostname `getpancake.ai` or `www.getpancake.ai`.

- The legacy `Custom events` trigger remains attached to the GA event-forwarding tag and currently matches:

  `^(trial_click|meeting_click|meeting_booked|page_view|user_signed_up|slack_connected|onboarding_done|subscription_started)$`

  In v2, this trigger is needed for explicit `page_view`; the other names are legacy compatibility only and are not v2 conversions. Retire or isolate them after confirming that no other route still needs them.

### GA4 tags

- `Google Tag G-6KWBYRZSDX`
  - Fires on Initialization / All Pages.
  - Sets `server_container_url=https://gtm.getpancake.ai`.
  - Sets `send_page_view=false`.
- `Forward events to GA4`
  - Sends event name `{{Event}}` to `G-6KWBYRZSDX`.
  - Uses both the legacy `Custom events` trigger and `v2 acquisition events`.
  - Maps these event parameters: `event_id`, `schema_version`, `page_path`, `page_location`, `page_title`, `page_view_kind`, `funnel_stage`, `conversion_tier`, `cta_id`, `form_id`, `lead_type`, `handoff_count`, `failure_type`, `status_code`, `scheduler_id`, `presentation`, and `attribution_id`.

### Advertising tags

- Existing `LinkedIn - Page Visit`, partner ID `9238938`, fires on production page loads.
- `LinkedIn - v2 Waitlist Lead - 29569610` fires only on `v2 waitlist lead submitted`.
- `X - Base Pixel - rehvg` loads the Pancake X website source on production page loads.
- `X - Waitlist Lead Submitted - rehvk` fires `tw-rehvg-rehvk` only on `v2 waitlist lead submitted`, carrying the stable event ID as the conversion ID.
- Existing `Reddit - Page Visit` for Basalt pixel `a2_hvwir7k3hfy1` is paused and must stay paused.
- `Meta - v2 Waitlist Lead - Browser` is present but **paused** until all Meta gates below pass. When enabled, it sends the browser `Lead` with the server-issued event ID. The website's server-only CAPI module independently sends the matching server copy after the waitlist API verifies a newly created Airtable row; GTM never calls a public CAPI relay.

### Host gating already present in the draft and code

Paid-media base and conversion tags require an exact production hostname: `getpancake.ai` or `www.getpancake.ai`. They do not fire on localhost, Vercel preview domains, or unrelated subdomains. The LinkedIn and X base tags use `Production page load`; the LinkedIn, X, and paused Meta Lead tags use the hostname-constrained `v2 waitlist lead submitted` trigger.

Website code independently limits direct Meta and PostHog to a Vercel production deployment and checks the exact runtime hostname. The React funnel is unusable without JavaScript, so unguardable GTM and Meta `noscript` fallbacks are intentionally omitted rather than letting a generated production Vercel hostname create vendor requests.

Setting `PANCAKE_ANALYTICS_DEBUG=1` on a non-production deployment enables GTM for Tag Assistant; it does not enable direct Meta or PostHog. Server CAPI can additionally send to Meta **Test Events only** when a test-event code, the explicit CAPI feature flag, matching pixel credentials, and the other Meta gates are all separately present. Because the paid browser tags are hostname-gated in GTM, preview validation cannot send LinkedIn, X, Reddit, or Meta production browser events.

Do not remove either layer of gating. The deployment-environment check and the runtime/container hostname checks protect different failure modes.

## GA4 page-view design

There is one source of GA page-view truth:

1. The website emits one `page_view` on initial render and one on each App Router navigation.
2. The GTM Google Tag uses `send_page_view=false`, so it does not generate a competing automatic initial page view.
3. `Forward events to GA4` forwards the website event.
4. There is no direct `gtag` page-view sender in the website.

In the GA4 web stream, open Enhanced Measurement, then Page views, and disable or verify disabled the advanced option that sends events for browser-history changes. If that setting remains enabled, Next.js navigation can be counted twice even though GTM uses `send_page_view=false`.

Once GA access exists:

- Confirm one initial and one virtual event in DebugView and Realtime.
- Mark `lead_submitted` as the only current v2 key event.
- Register useful low-cardinality event dimensions such as `cta_id`, `funnel_stage`, `conversion_tier`, `form_id`, `lead_type`, `scheduler_id`, `failure_type`, and `page_view_kind`.
- Do not register `event_id` as a reporting dimension because it is intentionally unique and would create high cardinality.
- Verify that requests reach the server endpoint successfully and that the server container does not add duplicate GA events.

## Meta Lead and CAPI activation gates

Keep the Meta waitlist tag paused until every item below is true:

1. The current user has access to the canonical Pancake dataset represented by browser pixel `1668160384441545`, or an explicitly approved replacement dataset has been selected everywhere.
2. Production `META_PIXEL_ID` is explicitly configured to the same ID used by the browser bootstrap.
3. A valid production Conversions API access token exists for that same dataset and `META_CAPI_LEAD_MATCHING_ENABLED=true` is intentionally set.
4. Meta Test Events shows one browser `Lead` and one server `Lead` with the same stable `lead.<64 lowercase hex characters>` event ID.
5. Events Manager reports the pair as deduplicated into one conversion.
6. The trigger is limited to a genuinely new `lead_submitted` on a production hostname.
7. The business has approved the advertising-data basis for sending hashed email and attribution identifiers, given the explicit decision not to install a CMP in this release.

There is no public browser-to-CAPI endpoint. After an origin-checked, rate-limited waitlist request produces a genuinely new Airtable row, the waitlist API calls a server-only Meta module. That module sends only `Lead`, sanitizes the source URL, hashes normalized email and the optional attribution ID, and refuses delivery unless the server pixel exactly matches the browser pixel. Live delivery additionally requires both a Vercel production deployment and an exact request hostname of `getpancake.ai` or `www.getpancake.ai`; any noncanonical host is allowed only into Meta Test Events with all explicit test gates enabled. Do not unpause the browser tag while CAPI is knowingly mismatched, because that would silently create browser-only conversions.

## Validation matrix

Use GTM Preview / Tag Assistant against a non-production deployment first. Production advertising tags must remain blocked by hostname while preview behavior is inspected.

| Test | Data layer and backend expectation | Analytics expectation | Advertising expectation |
| --- | --- | --- | --- |
| Initial `/` load | Exactly one `page_view` with `page_view_kind=initial`; query-free path and a location containing only approved attribution parameters | One GA DebugView event and one PostHog `$pageview` | On production only: one Meta `PageView`, one LinkedIn base visit, one X base load; no Reddit request |
| Navigate to `/pricing` | Exactly one `page_view` with `page_view_kind=virtual` | One GA event and one PostHog `$pageview` | No primary conversion |
| Open waitlist | One `lead_form_viewed` with the clicked CTA ID | GA and PostHog receive the micro event | No paid conversion |
| Begin waitlist form | At most one `lead_form_started` for the interaction | GA and PostHog receive the micro event | No paid conversion |
| Invalid email | One diagnostic `lead_submit_failed` with `failure_type=validation` | GA and PostHog receive the diagnostic event | No paid conversion |
| Server or network failure | One diagnostic failure with the correct type and safe status when available | GA and PostHog receive the diagnostic event | No paid conversion |
| Duplicate email | API returns `newly_created=false`; no durable event ID and no `lead_submitted` | No primary key event | No paid conversion |
| Honeypot submission | Pretend-success response with `newly_created=false` | No primary key event | No paid conversion |
| New unique email | One Airtable row, one stable opaque `lead.<64 lowercase hex characters>` ID, one Slack notification attempt, and one `lead_submitted` | Exactly one GA key event and one PostHog event | Exactly one LinkedIn conversion and one X conversion; once Meta is enabled, one deduplicated Meta Lead; no Reddit or Google Ads conversion yet |
| Open scheduler | One `scheduler_opened` | GA and PostHog micro event | No paid conversion |
| Zcal loads | One `scheduler_loaded` | GA and PostHog micro event | No paid conversion |
| Click Zcal fallback | One `scheduler_fallback_clicked` | GA and PostHog micro event | No paid conversion |
| Complete a booking today | No browser-created primary conversion | No `meeting_booked` key event yet | No booked-call conversion yet |
| Complete a booking after webhook launch | One signature-verified, idempotent `meeting_booked` | One key event | Exactly one conversion in each explicitly enabled vendor |
| Privacy inspection | No email, free text, secret, arbitrary query, or full external referrer in event payloads | Sanitized URLs only | Only approved fields and attribution identifiers |

A controlled new-lead test writes a real Airtable row and can notify Slack. Agree on the test address and record-handling plan before running it.

## External blockers

### Meta

The current login does not expose confirmed ownership of the canonical dataset, and the server configuration cannot be trusted until it is verified against the browser pixel. Resolve access and complete the activation gates above.

### Reddit

The current Reddit business is not managed and exposes only the BasaltAI Main Ad Account. Reddit must either make the business managed so a dedicated Pancake ad account can be created, or Pancake must use a separate Reddit login and business. Do not reuse the Basalt pixel.

### Google Ads

Only the apparently deprecated `[old] Pancake` account is accessible, and identity verification is blocked. Creating a new Pancake Google Ads account requires Tristan's explicit approval because it introduces billing, identity, and verification work. After that, create a waitlist conversion, link GA4 if desired, and add a booked-meeting conversion only after Zcal verification exists.

### Google Analytics

The current Google login does not show the property for `G-6KWBYRZSDX`. Editor access is required to verify DebugView, Enhanced Measurement, custom definitions, key events, retention, filters, and any Google Ads link.

The website and GTM design is intentionally manual for Next.js SPA page views. Per Google's SPA guidance, the GA4 web stream's Enhanced Measurement option for page changes based on browser-history events must be disabled to prevent duplicate virtual page views. This setting cannot be certified until the property is accessible.

### Zcal

Zcal login is still required. The booking endpoint must verify the official signature, enforce timestamp and replay protection, and store an idempotency key before emitting `meeting_booked`. The real webhook payload must also be inspected to design an opaque way to correlate the booking with the originating attribution/session without placing personal data in the browser event layer.

### Airtable delivery durability

The atomic email upsert now prevents concurrent requests from creating two conversion events. One rare failure mode remains: Airtable can commit a new row immediately before the website's five-second request timeout. In that ambiguous case, the browser sees an error; a retry finds the existing row and correctly avoids a second conversion, but the original Slack, CAPI, and browser conversion deliveries may never happen.

Closing this gap requires a durable delivery/outbox state tied to the Airtable record (or an equivalent durable queue) and a retry worker that reuses the same opaque event ID. Adding those fields changes the Airtable schema and operating workflow, so it requires explicit authorization and should be implemented as a separate, tested data migration rather than guessed in this release.

## Deployment procedure

### Before production

1. Finish code review, type checking, linting, and a production build.
2. Verify the existing production/preview host gating in both website code and the GTM draft.
3. Create a Vercel preview with `PANCAKE_ANALYTICS_DEBUG=1`; do not promote it automatically. By itself, this flag enables GTM only, while direct Meta and PostHog remain disabled. Meta CAPI test delivery also requires its separate test code, feature flag, and matching credentials.
4. Connect GTM Preview to the preview and execute the validation matrix. Confirm explicitly that every production-host paid tag remains blocked.
5. Keep Meta paused and keep Reddit and Google Ads absent while blocked.
6. Record the exact commit and GTM workspace state that passed testing.

### Coordinated production release

1. Tristan manually promotes the verified code to production.
2. Confirm that the new production page loads and emits one `schema_version=1` initial `page_view`.
3. Immediately publish the matching GTM web-container draft as a clearly named version.
4. Do not publish GTM before the code. Draft-first would suppress initial GA page views until the new code arrives. Code-first can produce a very short interval with two GA initial page views because the previous GTM version still auto-sends one; keep that interval as short as possible.
5. Run production smoke checks for page view, modal micro events, scheduler micro events, and one agreed unique waitlist lead.
6. Check GA DebugView/Realtime and PostHog promptly. Advertising platforms can report with delay, so recheck their diagnostics later without firing duplicate test submissions.
7. Record the production Vercel deployment and GTM version together as one release pair.

## Rollback

The code deployment and GTM version form a pair. Do not roll back only one and leave the mismatch in place.

### A single vendor is wrong

Pause only the affected vendor conversion tag, publish a small named GTM hotfix, and leave the shared event contract and GA page-view design intact. Meta is already paused until its gates pass.

### The GTM release is broadly wrong

1. Revert the web container to the previously published GTM version.
2. Immediately roll the Vercel production deployment back to its matching previous code version.
3. Expect a brief return of the previous tracking behavior during the coordinated rollback; verify GA page views and ensure no new conversion tag continues firing.

### The website release is broadly wrong

1. Pause or revert new conversion tags first so they cannot consume malformed events.
2. Roll Vercel back to the previous deployment.
3. Restore the matching previous GTM version immediately afterward.

Never delete a GTM container, tag history, or vendor dataset during rollback. Published versions and Vercel deployments provide the recovery path.

## Accepted no-CMP limitation

Tristan explicitly chose not to add a visible consent banner or CMP. This runbook therefore does not implement a full consent-management flow or claim that the resulting setup is compliant for EU, UK, or Swiss traffic.

That decision can affect both legal exposure and measurement quality. It must remain documented as an accepted limitation. A later legal or policy review may require a CMP and Google Consent Mode v2; if the decision changes, consent behavior must be designed and tested as a separate release rather than silently added inside this migration.

## Known follow-up improvements

These are not reasons to invent conversions, but they prevent the setup from being described as fully complete:

- Persist approved first-touch/latest-touch fields and `attribution_id` into the CRM if Airtable fields are added and authorized.
- Add durable outbox/delivery state so an ambiguous Airtable timeout cannot permanently lose Slack, CAPI, or browser conversion delivery; the atomic email upsert already handles concurrent duplicate creation.
- Decide whether pricing-page retargeting needs explicit Meta, LinkedIn, or X virtual page-view events; current primary-conversion accuracy does not depend on them.
- Retire legacy GTM event names after confirming no remaining route consumes them.
- Add automated tests for the analytics event contract, duplicate suppression, safe URL behavior, and vendor activation gates.
- Update project-level analytics documentation after this migration ships so a future agent does not restore the removed direct LinkedIn or Reddit integrations.
