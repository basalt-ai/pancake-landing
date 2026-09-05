# Human / agent toggle foundation

Scope reset by Tristan on September 4, 2026: keep the existing landing, add a toggle above the headline’s right edge, and prepare an agent page containing the hero in inverse colors with one empty viewport below. The agent headline and a terminal-style setup CTA were subsequently added at Tristan’s request; product demonstrations are deferred.

## Implemented

- Human mode is the original v3 landing (baseline `14ad159`) with only the audience selector added.
- The selector uses the [Figma Signals switch](https://www.figma.com/design/fr8NgOCTUxsEbrMEJA3YKu/Pancake-Design?node-id=4389-781): a 40×24 track, 20×20 white thumb and 2px inset. Per Tristan’s follow-up, human mode uses the human rainbow’s blue (`--lp-blue-40`) and agent mode its green (`--lp-green-20`). The artwork sits within a 44×44 keyboard-accessible button.
- Agent mode reads “Give your human GTM superpowers” on one line in Aeonik Fono, matching the setup terminal. Cream text types from a green insertion bar in three bursts over 1.6 seconds, after the 240ms audience crossfade; the cursor blinks twice, then stays still. Human mode retains its original two-line Aeonik Condensed headline. Both layers share the original headline box so the toggle and adjacent content stay fixed. The complete active heading is always available to assistive technology; the animated duplicate is decorative. Reduced motion displays the full line and a solid cursor immediately.
- Agent mode replaces the hero description and buttons with a copyable `set up https://github.com/get-pancake/agent-plugins` instruction, and a “Friends with” row above the terminal, aligned to its right edge, showing clean white Claude, Codex, Cursor, Hermes and OpenClaw marks, matching the founder’s five-logo reference. The public repository contains maintained installation guides for Codex and Claude Code. The “Start here” label was removed at the founder’s request. The terminal uses a pure black background, cream Fono text and a green prompt; its copy button confirms success with a checkmark and a screen-reader announcement, and offers manual selection if clipboard access fails.
- Agent mode keeps the original navigation and rainbow motion. Cream and plum exchange roles; each of the five rainbow bands uses its exact RGB negative.
- Only an empty `100vh` section follows the agent hero. There is no content below the hero besides that empty section.
- `/?audience=agents` opens the inverse hero directly. The toggle updates the URL without remounting the hero; refresh and browser history retain the selected view.
- Audience changes use a quick 240ms page crossfade, including the rainbow. The switch is excluded from that fade and keeps its ordinary thumb slide. Active canvas renderers repaint the new palette synchronously, eliminating the previous capture wait while preserving their clocks. Reduced motion and browsers without this API switch immediately; there is no entrance animation on initial loading.
- Hidden original sections remain mounted so their fit and motion observers survive the return to human mode.
- Both canvas renderers follow all six rings’ new colors without restarting the animation clock. Reduced motion uses the same palette through the original static SVG.
- Original signup, scheduling and analytics contracts are unchanged. No packages installed.

## Validation

- Codex Browser found identical original human text/link records and desktop layout measurements at 1280×720.
- Human hero typography, text and desktop geometry remain identical to the prior preview; the agent setup block overlays the exact bounds of the original human description/buttons column, including on phones. The original column remains in layout but is hidden visually and from assistive technology in agent mode, keeping the headline fixed through the toggle.
- Original human layout comparisons passed at 320×740, 393×852 and 768×1024; the selector stays inside the phone viewport.
- Agent mode exposes only the hero and a blank section measuring exactly the viewport height.
- Direct agent URL, keyboard switching, back/forward, reduced motion, inverse mobile menu and the existing booking dialog were checked. The live WebGL renderer and forced phone Canvas fallback both retained the correct palette through audience changes.
- Terminal CTA checked at 320×740, 393×852, 1025×768 and 1280×720. Clipboard copying and keyboard activation succeed; human hero text and desktop geometry match the previous preview.
- Independent code review confirmed the reduced scope and original component parity.
- The crossfade was measured at 240ms in both directions on desktop and phone. Heading geometry, scroll position and canvas instances remained unchanged. Three rapid toggles, Back/Forward and reduced-motion switching passed without errors.
- Removing the capture wait reduced measured desktop click-to-fade onset from about 95–100ms to 20–30ms. Only the page snapshot fades; the named switch snapshot has no fade animation.

Preview: https://pancake-j0tdaa8zy-getpancake.vercel.app

The setup CTA borrows the single copyable instruction pattern from [Monid](https://monid.ai/), adapted to Pancake’s existing typography, colors and geometry. Other reference screenshots are historical research from the broader concept.

Logo sources: Claude and Codex use the existing React Icons marks; Cursor and OpenClaw match the SVG marks in the supplied Monid reference. Hermes uses the [official NousResearch portrait](https://github.com/NousResearch/hermes-agent/blob/main/website/static/img/logo.png), displayed white through CSS and served at icon size by Next Image. The five-logo row follows the founder’s explicit direction; adding a mark does not represent a new installation test.

The agent headline borrows the insertion-cursor and character-step rhythm from [Hacker Typer](https://hackertyper.net/). It uses Pancake’s cream and rainbow green, with no extra terminal frame. The single line scales within the original headline width, including phones. Codex Browser verified the stepped reveal, complete text, rapid mode changes, stable human geometry and immediate reduced-motion rendering at 320px.

The headline and setup terminal share `--lp-font-fono`. Each letter reveals at its natural width so the cursor follows Fono’s proportional spacing; all 31 characters, three typing bursts and reduced-motion behavior were verified in Codex Browser.
