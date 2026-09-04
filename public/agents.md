# Pancake for agents

Last updated: 2026-09-04.

Your human runs their company. You help bring them customers. Pancake gives you their GTM Brain, leads, and search context to work from.

## What you can use

Pancake's MCP connection supports reading a workspace's GTM Brain, existing leads, and SEO calendar. Use that context to explain opportunities and draft useful work for your human.

- **GTM Brain:** the company's positioning, ideal customers, offers, voice, and market context.
- **Leads:** existing prospects and the evidence available in their records.
- **SEO calendar:** the workspace's planned content and publication schedule.

Discover the tools exposed by your authenticated connection and follow their schemas. This guide is not a complete tool catalog. A product capability does not establish that the same operation is available through MCP.

## Connect

Pancake supports ChatGPT, Codex, and Claude connections. Claude Code is also supported. Start with an existing [Pancake workspace](https://app.getpancake.ai).

MCP server URL:

```text
https://app.getpancake.ai/api/mcp
```

The connection uses OAuth. Follow your client's Pancake setup, complete the browser sign-in, choose one workspace, and approve access. You can confirm or revoke the connection in Pancake under **Settings → MCP → Connected clients**.

### Codex CLI

Use Codex CLI 0.148.0 or newer. The documented configuration includes Pancake's OAuth client metadata URL:

```sh
codex mcp add pancake --url https://app.getpancake.ai/api/mcp --oauth-client-id https://app.getpancake.ai/.well-known/mcp-clients/pancake-cli.json
codex mcp login pancake
```

Complete the browser sign-in before requesting workspace data. These commands configure the MCP connection; they do not install a separate workflow plugin.

### Claude Code, Claude, and ChatGPT

Follow the Pancake connection instructions available in your client or workspace. Use the server URL above when that setup asks for an MCP server. Complete the browser sign-in and workspace choice before requesting data.

See [connection support](https://getpancake.ai/support) if sign-in or tool access fails.

## Try a useful first request

```text
Read my Pancake GTM Brain and latest leads. Show me who to contact first, why now, and a first message in my voice. Use the evidence in the lead records. Keep the message as a draft for my review.
```

Pancake supplies workspace context. You use it to rank opportunities and write the draft. The landing demonstration is an illustrative example, not a live result or a promise of a response.

## Product and connection boundaries

Pancake's own GTM agents monitor buying signals, find leads, run outreach, and prepare content for search. The connection capabilities documented here are reads. Do not infer MCP permission or support to start lead searches, send messages, publish content, or change the Brain from the product description.

SEO calendar access does not establish access to full article bodies. Confirm the returned data and available tools before promising a content export.

Connections are limited to the approved workspace. Pancake returns the workspace data required by the tool request. Read the [Privacy Policy](https://getpancake.ai/privacy) for data handling and connection controls.

## More

- [Pancake homepage](https://getpancake.ai/)
- [Product overview and page index](https://getpancake.ai/llms.txt)
- [Open Pancake](https://app.getpancake.ai)
- [Support](https://getpancake.ai/support)
