# Human / agent landing: product evidence

Reviewed September 4, 2026. The current agent hero exposes one setup instruction. No plugin was installed and no authenticated workspace operation was performed during this landing verification.

## Current setup destination

The [official public plugin repository](https://github.com/get-pancake/agent-plugins) is accessible without sign-in. Its README links both maintained client guides:

- [Codex](https://github.com/get-pancake/agent-plugins/blob/main/codex/README.md): install the marketplace and `pancake-workflow` plugin, then authorize MCP. The guide includes current version requirements and the older-client OAuth configuration.
- [Claude Code](https://github.com/get-pancake/agent-plugins/blob/main/claude-code/README.md): install the marketplace and plugin, then authenticate Pancake through `/mcp`.

The plugin bundles the operating skill and MCP connection. The user completes browser sign-in and workspace consent. The standalone `SKILL.md` assumes an existing MCP connection; it is not an installation guide.

The landing displays and copies exactly:

```text
set up https://github.com/get-pancake/agent-plugins
```

This is a natural-language instruction to paste into Codex or Claude Code, not an executable shell command. The decorative `$` is excluded from the clipboard.

## Public product evidence

| Claim | Source | Scope |
| --- | --- | --- |
| ChatGPT, Codex and Claude connections; browser sign-in; workspace choice; revocation; reading the GTM Brain | [Public support](https://getpancake.ai/support) | Publicly documented. |
| OAuth, one approved workspace and request-specific workspace data | [Privacy policy](https://getpancake.ai/privacy) | Publicly documented. |
| Codex and Claude Code plugin installation | [Public plugin repository](https://github.com/get-pancake/agent-plugins) | Guides and public availability checked in Codex Browser. Installation and authenticated reads were not executed. |

## Verification boundary

The landing makes no claim that copying the instruction installs or connects Pancake. Successful OAuth and tool execution remain separate from the verified clipboard action and public guide availability. New client support, acquisition writes, publishing and tool schemas must be verified before being demonstrated as executable operations.

The earlier `/agents` and `/agents.md` landing guides were removed when the concept was simplified. The current instruction points to the maintained public plugin repository instead of an unavailable local guide. `/llms.txt` and crawler rules remain unchanged.
