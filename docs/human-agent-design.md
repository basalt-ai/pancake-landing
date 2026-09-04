# Human / agent toggle foundation

Scope reset by Tristan on September 4, 2026: keep the existing landing, add a toggle above the headline’s right edge, and prepare an agent page containing the hero in inverse colors with one empty viewport below. The agent headline and a terminal-style setup CTA were subsequently added at Tristan’s request; product demonstrations are deferred.

## Implemented

- Human mode is the original v3 landing (baseline `14ad159`) with only the audience selector added.
- The selector uses the [Figma Signals switch](https://www.figma.com/design/fr8NgOCTUxsEbrMEJA3YKu/Pancake-Design?node-id=4389-781): a 40×24 track, 20×20 white thumb and 2px inset. Per Tristan’s follow-up, human mode uses the human rainbow’s blue (`--lp-blue-40`) and agent mode its green (`--lp-green-20`). The artwork sits within a 44×44 keyboard-accessible button.
- Agent mode reads “Give your human” / “GTM superpowers” in the original headline’s font, size, weight and spacing. Human mode retains “You run your company” / “We bring you customers”. Both layers share the original headline box so the toggle and adjacent content stay fixed. The inactive copy is hidden visually and from assistive technology.
- Agent mode replaces the hero description and buttons with “Start here”, a copyable `set up https://github.com/get-pancake/agent-plugins` instruction, and a “Friends with” row showing clean white Claude Code and Codex SVG marks. The public repository contains the maintained installation guides for both clients. “Start here” matches the human hero supporting copy (Fono, 16px/24px, regular). The terminal uses a pure black background, cream Fono text and a green prompt; its copy button confirms success with a checkmark and a screen-reader announcement, and offers manual selection if clipboard access fails.
- Agent mode keeps the original navigation, H1 typography and rainbow motion. Cream and plum exchange roles; each of the five rainbow bands uses its exact RGB negative.
- Only an empty `100vh` section follows the agent hero. There is no content below the hero besides that empty section.
- `/?audience=agents` opens the inverse hero directly. The toggle updates the URL without remounting the hero; refresh and browser history retain the selected view.
- Audience changes use a quick 240ms page crossfade, including the rainbow. The switch is excluded from that fade and keeps its ordinary thumb slide. Active canvas renderers repaint the new palette synchronously, eliminating the previous capture wait while preserving their clocks. Reduced motion and browsers without this API switch immediately; there is no entrance animation on initial loading.
- Hidden original sections remain mounted so their fit and motion observers survive the return to human mode.
- Both canvas renderers follow all six rings’ new colors without restarting the animation clock. Reduced motion uses the same palette through the original static SVG.
- Original signup, scheduling and analytics contracts are unchanged. No packages installed.

## Validation

- Codex Browser found identical original human text/link records and desktop layout measurements at 1280×720.
- Both perspectives use identical H1 typography. The human hero text and desktop geometry remain identical to the prior preview; the agent setup block aligns with the H1 on desktop and flows below it on phones.
- Original human layout comparisons passed at 320×740, 393×852 and 768×1024; the selector stays inside the phone viewport.
- Agent mode exposes only the hero and a blank section measuring exactly the viewport height.
- Direct agent URL, keyboard switching, back/forward, reduced motion, inverse mobile menu and the existing booking dialog were checked. The live WebGL renderer and forced phone Canvas fallback both retained the correct palette through audience changes.
- Terminal CTA checked at 320×740, 393×852, 1025×768 and 1280×720. Clipboard copying and keyboard activation succeed; human hero text and desktop geometry match the previous preview.
- Independent code review confirmed the reduced scope and original component parity.
- The crossfade was measured at 240ms in both directions on desktop and phone. Heading geometry, scroll position and canvas instances remained unchanged. Three rapid toggles, Back/Forward and reduced-motion switching passed without errors.
- Removing the capture wait reduced measured desktop click-to-fade onset from about 95–100ms to 20–30ms. Only the page snapshot fades; the named switch snapshot has no fade animation.

Preview: https://pancake-lb9shsfdn-getpancake.vercel.app

The setup CTA borrows the single copyable instruction pattern from [Monid](https://monid.ai/), adapted to Pancake’s existing typography, colors and geometry. Other reference screenshots are historical research from the broader concept.
