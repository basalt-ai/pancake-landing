# Human / agent landing: product evidence

Reviewed 2026-09-04. This file records the public basis and verification limits for the landing's connection claims. Public copy lives in `public/agents.md` and `public/llms.txt`. Maintained connection configuration and reported client reads were reviewed on this date. An authenticated workspace workflow was not executed as part of this documentation pass.

## Evidence used

| Claim | Source | Scope |
| --- | --- | --- |
| ChatGPT, Codex, and Claude connections; browser sign-in; workspace choice; connection revocation; reading the GTM Brain | [Public support](https://getpancake.ai/support), source `app/support/page.tsx:28–37` | Publicly documented. |
| OAuth, one approved workspace, request-specific workspace data | [Public privacy policy](https://getpancake.ai/privacy), source `app/privacy/page.tsx:288–306` | Publicly documented. |
| Current MCP endpoint and explicit Codex OAuth client metadata configuration; Codex CLI 0.148.0 or newer | Maintained configuration reviewed 2026-09-04; published in [the agent guide](https://getpancake.ai/agents.md) | Local CLI syntax checked; authenticated login not independently verified. |
| Claude Code reads the Brain, existing leads, and SEO calendar | Reported client reads reviewed 2026-09-04 | The implementation uses an illustrative demonstration of these reads. No authenticated customer data is displayed. |

The current endpoint is `https://app.getpancake.ai/api/mcp`; OAuth client metadata is at `https://app.getpancake.ai/.well-known/mcp-clients/pancake-cli.json`. Local Codex CLI help confirms the `--url` and `--oauth-client-id` flags used in the published command. The app destination was verified to reach sign-in. Codex Browser blocked public endpoint metadata with `ERR_BLOCKED_BY_CLIENT`; metadata availability and an authenticated workspace read were not independently verified. A successful read of public metadata would establish configuration availability, not successful authentication or authorized tool execution.

## Demonstration contract

The illustrative demonstration uses existing Brain and lead context, explains a buying opportunity, and ends with an agent-authored message draft. This connects the documented read capabilities to customer acquisition without implying that the connector found new leads or sent a message.

- Identify example companies, records, and results as illustrative.
- Keep the result at draft / review. Do not claim a message was sent or a customer replied.
- Do not invent MCP tool names or response schemas.
- Describe Pancake's product automation separately from client-accessible operations.
- A copy button must copy the displayed prompt, server URL, or commands. A link to setup should say it opens setup, not that it has connected an account.

## Remaining product dependencies

1. **Current public Claude Code installation instructions:** client support was reviewed, but a current public installation command has not been independently verified. Until the guided setup is verified, publish the current server URL and connection support destination without a guessed Claude Code command.
2. **Authenticated operation catalog:** no complete current public tool schema was available in the inspected landing repository. Brain, lead, and SEO calendar reads are evidenced; acquisition writes, Brain updates, publishing, and new lead-search calls must be checked against authenticated tool discovery before being demonstrated as executable operations.
3. **Article body export:** full article body access has not been verified. Calendar access alone does not establish content export. Do not promise export to an external Next.js build, markdown download, or a publication webhook without verifying the relevant operation.
4. **End-to-end connection validation:** the documented Codex configuration and version guidance do not substitute for completing OAuth and reading the selected workspace. Preserve that distinction in validation reporting.

## Discoverability

The static `/agents.md` guide is available to clients without the visual selector or JavaScript. `/agents` renders the same source as a readable HTML page for browser visitors. `/llms.txt` links to it near the top and includes the endpoint and capability boundaries. The existing `app/robots.ts` permits all crawlers. The new `/agents` guide is linked from the page and sitemap. Signup, scheduler, and analytics behavior are unchanged.
