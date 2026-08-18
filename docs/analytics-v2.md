# Pancake v2 analytics and advertising runbook

## Purpose and current status

This is the operational source of truth for tracking on the Pancake v2 landing page. The current funnel has only two outcomes:

- Join the waitlist.
- Book a call.

A new waitlist record is the only primary conversion that can be measured today. A booked meeting will become a primary conversion only after a signed Zcal webhook proves that the booking genuinely exists. Opening the scheduler, loading it, or clicking its fallback link is not a booked conversion.

As of this document:

- The implementation is on branch `codex/ads-tracking-v2`, rebased from the current landing-page repository.
- The Google Tag Manager changes are a draft and are **not published**.
- The code is **not deployed to production** by this runbook.
- Pancake now owns Meta dataset/pixel `1427782115875153`. Its Traffic Permissions allow `getpancake.ai` and `zcal.co`, including their subdomains. Meta Lead tracking nevertheless remains paused because creating a new dataset-scoped CAPI token is blocked on Business Portfolio admin or developer access.
- In Pancake **TEAM** settings—not personal Account settings—Zcal now shows GA4 `G-6KWBYRZSDX` and Meta Pixel `1427782115875153` connected. The connection state is UI-verified; actual booking-event delivery still requires a controlled booking and GA/Meta realtime validation.
- The five Airtable analytics-delivery fields have been created and verified in Airtable. Deployment still requires a stable `ANALYTICS_EVENT_ID_SECRET`; without it, the waitlist API intentionally returns 503 before writing a lead.
- A dedicated Pancake Reddit account/pixel is still pending. Reddit support has escalated the request for a separate `Pancake Main Ad Account` and pixel to a human; there is no ticket number yet.
- Google Ads work is explicitly on hold until August 18, 2026. A new account has been started under customer ID `339-764-4166`, but it has no campaign, billing setup, or spend.

No access token, webhook secret, API key, or local environment value belongs in this document.

## Measurement principles

1. The website emits vendor-neutral product events. GTM maps those events to GA4 and advertising platforms.
2. A click or modal open is never counted as a primary conversion.
3. A waitlist conversion is emitted only after Airtable creates a genuinely new row, or when the same client submission UUID recovers an ambiguous lost response for that row.
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

Ordinary duplicate emails and honeypot submissions may show the success UI, but they return `newly_created=false` and no conversion event ID. An exact retry chain is the sole exception: when its UUID matches `Analytics Submission ID` on an eligible v2 row, the API returns `recovered_conversion=true` with the already-persisted event ID so the browser can repair an ambiguous lost response. A later submission with a different UUID must not emit `lead_submitted`.

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

For the landing waitlist (`Source=landing-v2`) only, the waitlist API normalizes email for duplicate lookup and performs an email-keyed Airtable upsert. Before the write, it creates a stable opaque `lead.<64 lowercase hex characters>` ID using HMAC-SHA256 over the normalized email and the server-only `ANALYTICS_EVENT_ID_SECRET`. The secret is mandatory, must contain at least 32 characters, and must remain stable across deployments. The browser receives only the opaque digest; no email address, Airtable record ID, secret, or free-form field is placed in the data layer.

Each valid `landing-v2` landing-waitlist browser attempt chain generates one UUID and reuses it after a failed request. The initial upsert atomically persists that UUID, the event ID, and `waitlist-v2`. Only a landing-waitlist row with the expected version/event pair is eligible for advertising-delivery recovery, and only a request with the matching UUID may recover the browser conversion. `gtm-report` email-gate submissions are outside this advertising ledger and must not emit or recover a waitlist ad conversion. Legacy rows have no version and are never backfilled.

The `GTM Waitlist` table contains this exact ledger schema, verified present in the Airtable UI:

| Field | Airtable type | Purpose |
| --- | --- | --- |
| `Analytics Delivery Version` | Single line text | Eligibility marker; current value is `waitlist-v2` |
| `Analytics Event ID` | Single line text | Stable opaque browser/server deduplication ID |
| `Analytics Submission ID` | Single line text | Owner UUID for the original browser retry chain |
| `Slack Delivered At` | Date including time | Written only after a successful Slack response |
| `Meta CAPI Delivered At` | Date including time | Written only after a successful Meta CAPI response |

Delivery timestamps are deliberately omitted from every upsert, so a concurrent/retried form write cannot clear proof of an earlier success. A matching retry reads the ledger and attempts only blank destinations. Meta reuses the stable event ID and the original `Submitted At` time. Slack Incoming Webhooks have no idempotency key, so Slack is at-least-once if the webhook succeeds but the Airtable timestamp update is lost. The ledger materially improves recovery, but it is not a transactional exactly-once queue.

## Vendor ownership and known identifiers

| Vendor or surface | Owner | Known identifiers and intended behavior |
| --- | --- | --- |
| GTM web container | GTM | Account `6360623272`; container `255346716`; public ID `GTM-P3Z79WKD`; current draft workspace `6` |
| GTM server container | GTM / existing server endpoint | Container `255385456`; public ID `GTM-PRNN2DZS`; workspace `7`; GA transport endpoint `https://gtm.getpancake.ai` |
| Google Analytics 4 | GTM | Measurement ID `G-6KWBYRZSDX`; receives the explicit page view and all v2 acquisition events |
| PostHog | Website code | EU Cloud project `Pancake-v1`, project ID `170554`; direct sanitized capture through `e.getpancake.ai` |
| Meta | Base pixel in website code; browser Lead mapping in GTM; server Lead delivery inside the verified waitlist API; Zcal native booking integration | Pancake-owned website dataset/pixel `1427782115875153`; Traffic Permissions allow `getpancake.ai` and `zcal.co` plus subdomains; Pancake ad account `538746742816593`; direct initial `PageView` remains; browser and CAPI waitlist `Lead` must share the same opaque `event_id` |
| LinkedIn | GTM only | Ad account `545060035`; company page `104917696`; partner ID `9238938`; event-specific waitlist conversion `29569610` named `v2_waitlist_lead_submitted` |
| X Ads | GTM only | Ads account `18ce55v07al`; profile `@getpancake_ai`; website source `rehvg`; Lead event `rehvk`, full event ID `tw-rehvg-rehvk` |
| Reddit | None until Pancake has a dedicated account and pixel | Business Manager `Pancake`, Business ID `53c537e5-7d98-4d2d-b641-1375882f0935`, still exposes only `BasaltAI Main Ad Account` and its pixel `a2_hvwir7k3hfy1`; the business website is `getbasalt.ai`; those Basalt assets are not approved for Pancake tracking |
| Google Ads | On hold; no GTM conversion tag yet | Partially started Pancake customer ID `339-764-4166`; work is paused until August 18, 2026; there is no campaign, billing setup, or spend |
| Zcal | Embedded scheduler, completed TEAM-level GA4/Meta native integrations, and preserved existing team webhook | Scheduler `ZEHl48rv`; GA4 `G-6KWBYRZSDX` connected; Meta Pixel `1427782115875153` connected; native verified-booking event is `zcal_invite_schedule_event`; controlled delivery validation remains pending |

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
- The legacy `Reddit - Page Visit` tag points to Basalt pixel `a2_hvwir7k3hfy1`. It is paused, must stay paused, and must not be reused. Do not insert or enable any Reddit ID until the separate Pancake pixel exists and ownership has been verified.
- `Meta - v2 Waitlist Lead - Browser` is present but **paused** until all Meta gates below pass. When enabled, it sends the browser `Lead` with the server-issued event ID. The website's server-only CAPI module independently sends the matching server copy after the waitlist API verifies a new eligible Airtable row, and can retry a missing server delivery for the same persisted submission chain; GTM never calls a public CAPI relay.

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

1. The canonical Pancake Website dataset/pixel `1427782115875153` is selected everywhere.
2. Meta dataset Traffic Permissions continue to allow both `getpancake.ai` and `zcal.co`, including their subdomains, so Pancake landing traffic and the authorized Zcal booking integration are accepted while unrelated domains remain blocked.
3. Business Portfolio admin or developer access has been granted, and a **new** CAPI token has been generated specifically for the owned Pancake dataset. Do not reuse a token from an old or unrelated dataset.
4. Production `META_PIXEL_ID` is explicitly configured to the same ID used by the browser bootstrap, the new token is installed securely, and `META_CAPI_LEAD_MATCHING_ENABLED=true` is intentionally set.
5. Meta Test Events shows one browser `Lead` and one server `Lead` with the same stable `lead.<64 lowercase hex characters>` event ID.
6. Events Manager reports the pair as deduplicated into one conversion.
7. The trigger is limited to a genuinely new `lead_submitted` on a production hostname.
8. The business has approved the advertising-data basis for sending hashed email and attribution identifiers, given the explicit decision not to install a CMP in this release.

There is no public browser-to-CAPI endpoint. After an origin-checked, rate-limited waitlist request produces a new eligible Airtable row—or an exact persisted submission retry finds its server delivery timestamp blank—the waitlist API calls a server-only Meta module. That module sends only `Lead`, preserves the original Airtable submission time on retry, sanitizes the source URL, hashes normalized email and the optional attribution ID, and refuses delivery unless the server pixel exactly matches the browser pixel. Live delivery additionally requires both a Vercel production deployment and an exact request hostname of `getpancake.ai` or `www.getpancake.ai`; any noncanonical host is allowed only into Meta Test Events with all explicit test gates enabled. CAPI is currently blocked because the required Business Portfolio role and new token do not yet exist. Keep both the feature flag disabled and the GTM browser Lead tag paused; enabling only the browser copy would silently create browser-only conversions.

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
| Later duplicate email | A new submission UUID does not match the stored owner; API returns `newly_created=false`, `recovered_conversion=false`, and no event ID | No primary key event | No paid conversion |
| Exact retry after ambiguous timeout | The reused submission UUID matches; API returns `newly_created=false`, `recovered_conversion=true`, and the same opaque event ID; only blank Slack/Meta ledger destinations are retried | The browser emits the canonical `lead_submitted` once for that retry chain | Same Meta `event_id`; no second logical Meta conversion |
| Honeypot submission | Pretend-success response with `newly_created=false` | No primary key event | No paid conversion |
| New unique email | One Airtable row, one HMAC-derived opaque `lead.<64 lowercase hex characters>` ID, one submission UUID, delivery timestamps only after success, and one `lead_submitted` | Exactly one GA key event and one PostHog event | Exactly one LinkedIn conversion and one X conversion; Meta browser Lead and CAPI remain off until their gates pass; no Reddit or Google Ads conversion yet |
| Open scheduler | One `scheduler_opened` | GA and PostHog micro event | No paid conversion |
| Zcal loads | One `scheduler_loaded` | GA and PostHog micro event | No paid conversion |
| Click Zcal fallback | One `scheduler_fallback_clicked` | GA and PostHog micro event | No paid conversion |
| Controlled booking through the connected Zcal invite | No landing-browser `meeting_booked`; Zcal should emit its verified native `zcal_invite_schedule_event` | Confirm that event once in GA4 Realtime/DebugView | Confirm the corresponding booking event once in Meta Events Manager/Test Events; this remains unverified until the controlled booking and realtime access are available |
| Complete a booking after webhook launch | One signature-verified, idempotent `meeting_booked` | One key event | Exactly one conversion in each explicitly enabled vendor |
| Privacy inspection | No email, free text, secret, arbitrary query, or full external referrer in event payloads | Sanitized URLs only | Only approved fields and attribution identifiers |

A controlled new-lead test writes a real Airtable row and can notify Slack. Agree on the test address and record-handling plan before running it.

## External blockers

### Meta

The Pancake Website dataset/pixel `1427782115875153` is owned by Pancake. Its Traffic Permissions now allow `getpancake.ai` and `zcal.co`, including their subdomains; this change was made to support the connected Zcal native Meta integration without opening the dataset to unrelated sites. Browser ownership is no longer the blocker. CAPI remains blocked because generating the required new dataset-scoped token needs Business Portfolio admin or developer access. Keep server delivery disabled and the GTM Meta Lead tag paused until that role exists, a new token has been created, and every activation gate above passes.

### Reddit

Reddit Business Manager `Pancake` has Business ID `53c537e5-7d98-4d2d-b641-1375882f0935`, but it still contains only `BasaltAI Main Ad Account`, using pixel `a2_hvwir7k3hfy1`, and the business website is `getbasalt.ai`. The UI exposes no **Create Ad Account** control, so Codex did not create or repurpose anything.

A support request was sent for a separate `Pancake Main Ad Account` and dedicated Pancake pixel. Reddit's AI support escalated the request to a human at 21:04 PT; the transfer is still pending and no ticket number has been issued. Until a human completes or clarifies the request, no Reddit identifier is approved for this release. The old Basalt pixel remains paused and must not be reused.

### Google Ads

Google Ads is explicitly on hold until August 18, 2026. A new Pancake account has been partially started under customer ID `339-764-4166`, but no campaign has been created, billing has not been configured, and no spend is authorized or occurring. Do not add a GTM conversion tag, campaign, billing method, or budget before work resumes. When it does resume, first verify account ownership and measurement access; create a waitlist conversion only after that, and create a booked-meeting conversion only after the signed Zcal webhook exists.

### Google Analytics

The current Google login does not show the property for `G-6KWBYRZSDX`. Editor access is still required to open DebugView and verify Enhanced Measurement, custom definitions, key events, retention, filters, and any future Google Ads link. The code and GTM architecture can be reviewed without that role, but end-to-end GA4 delivery must not be called verified until DebugView/Realtime have been observed in the property.

The website and GTM design is intentionally manual for Next.js SPA page views. Per Google's SPA guidance, the GA4 web stream's Enhanced Measurement option for page changes based on browser-history events must be disabled to prevent duplicate virtual page views. This setting cannot be certified until the property is accessible.

### Zcal

The Zcal team already has an active webhook at `https://hooks.getpancake.ai/integrations/zcal/webhook`; Zcal showed it as last used four days before this review. It remains preserved: do not replace, disable, or repoint it until its owner, signature validation, payload handling, and downstream behavior have been confirmed.

The native integrations are now completed and UI-verified in Pancake **TEAM** settings, not Account settings: GA4 `G-6KWBYRZSDX` is connected and Meta Pixel `1427782115875153` is connected. Both are configured around the verified booking signal `zcal_invite_schedule_event`. This is a genuine scheduled-booking event, not a scheduler open/load/click, and must stay distinct from the landing micro events.

Connection status is complete, but conversion-event delivery is not yet certified. Run one controlled booking, then observe exactly one `zcal_invite_schedule_event` in GA4 Realtime/DebugView and the corresponding event in Meta Events Manager/Test Events. This validation remains blocked until the controlled booking and the required GA/Meta realtime access are available.

The canonical first-party `meeting_booked` contract still requires confirmation that the preserved webhook verifies the official signature, enforces timestamp and replay protection, and stores an idempotency key. Its real payload must also be inspected to design an opaque way to correlate the booking with the originating attribution/session without placing personal data in the browser event layer.

### Airtable delivery durability

The authorized `landing-v2` delivery ledger closes the normal commit-before-timeout gap for the landing waitlist without a package, cron, or public relay. Its event ID is computed before the upsert, so every landing-waitlist request for the same normalized email and stable secret uses the same opaque ID. A retry from the same browser attempt chain can recover the canonical browser response and retry only Slack/Meta destinations without timestamps. `gtm-report` submissions and legacy rows cannot enter this advertising-delivery path.

Airtable `performUpsert` does not support a conditional create-only owner field. In the extremely narrow case where two first `landing-v2` requests for the same previously unseen email arrive simultaneously with different submission UUIDs, the losing update can overwrite `Analytics Submission ID`. Both requests still use the same event ID and only one Airtable row is created, but exact browser ownership cannot be guaranteed under that race. The route suppresses an immediate browser conversion on the losing upsert response; do not claim transactional exactly-once browser delivery. Meta remains deduplicable by the stable event ID. Slack is at-least-once if its success timestamp cannot be recorded.

## Deployment procedure

### Before production

1. Reconfirm the five already-created Airtable ledger fields above, then configure a stable 32+-character `ANALYTICS_EVENT_ID_SECRET` before deploying the new API contract. If the secret is absent or shorter than 32 characters, a `landing-v2` waitlist request returns 503 and performs no Airtable write; the separate `gtm-report` email gate remains outside the advertising ledger. Keep the same secret across deployments; changing it changes the deterministic event ID and breaks recovery for existing v2 rows.
2. Finish code review, focused delivery-ledger tests, type checking, linting, and a production build.
3. Verify the existing production/preview host gating in both website code and the GTM draft.
4. Create a Vercel preview with `PANCAKE_ANALYTICS_DEBUG=1`; do not promote it automatically. By itself, this flag enables GTM only, while direct Meta and PostHog remain disabled. Meta CAPI test delivery also requires its separate test code, feature flag, and matching credentials.
5. Connect GTM Preview to the preview and execute the validation matrix. Confirm explicitly that every production-host paid tag remains blocked.
6. Keep Meta paused, keep Reddit absent, and keep Google Ads untouched until the explicit August 18, 2026 resume point.
7. Record the exact commit and GTM workspace state that passed testing.

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
- If strict transactional browser exactly-once delivery becomes necessary, move conversion ownership to a datastore with conditional writes or a queue; Airtable cannot provide that guarantee for simultaneous first writers.
- Decide whether pricing-page retargeting needs explicit Meta, LinkedIn, or X virtual page-view events; current primary-conversion accuracy does not depend on them.
- Retire legacy GTM event names after confirming no remaining route consumes them.
- Expand the focused delivery-ledger tests to cover the complete browser event contract, safe URL behavior, and vendor activation gates.
- Update project-level analytics documentation after this migration ships so a future agent does not restore the removed direct LinkedIn or Reddit integrations.
