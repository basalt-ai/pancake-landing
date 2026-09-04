# Human / agent toggle foundation

Scope reset by Tristan on September 4, 2026: keep the existing landing, add a toggle above the headline’s right edge, and prepare an agent page containing the same hero in inverse colors with one empty viewport below. Copy and product demonstrations are deferred.

## Implemented

- Human mode is the original v3 landing (baseline `14ad159`) with only the audience selector added.
- The selector uses the [Figma Signals switch](https://www.figma.com/design/fr8NgOCTUxsEbrMEJA3YKu/Pancake-Design?node-id=4389-781): a 40×24 track, 20×20 white thumb and 2px inset. Per Tristan’s follow-up, human mode uses the human rainbow’s blue (`--lp-blue-40`) and agent mode its green (`--lp-green-20`). The artwork sits within a 44×44 keyboard-accessible button.
- Agent mode keeps the original navigation, hero headline, description, buttons, layout and rainbow motion. Cream and plum exchange roles; each of the five rainbow bands uses its exact RGB negative.
- Only an empty `100vh` section follows the agent hero. There is no agent demo, setup block, pricing, testimonial section or footer in this view.
- `/?audience=agents` opens the inverse hero directly. The toggle updates the URL without remounting the hero; refresh and browser history retain the selected view.
- Audience changes use a quick 240ms crossfade across the whole viewport, including the rainbow. Native View Transitions capture the updated canvas palette while keeping the original renderers running. Reduced motion and browsers without this API switch immediately; there is no entrance animation on initial loading.
- Hidden original sections remain mounted so their fit and motion observers survive the return to human mode.
- Both canvas renderers follow all six rings’ new colors without restarting the animation clock. Reduced motion uses the same palette through the original static SVG.
- Original signup, scheduling and analytics contracts are unchanged. No packages installed.

## Validation

- Codex Browser found identical original human text/link records and desktop layout measurements at 1280×720.
- Both perspectives have identical hero text and geometry.
- Original human layout comparisons passed at 320×740, 393×852 and 768×1024; the selector stays inside the phone viewport.
- Agent mode exposes only the hero and a blank section measuring exactly the viewport height.
- Direct agent URL, keyboard switching, back/forward, reduced motion, inverse mobile menu and the existing booking dialog were checked. The live WebGL renderer and forced phone Canvas fallback both retained the correct palette through audience changes.
- Independent code review confirmed the reduced scope and original component parity.
- The crossfade was measured at 240ms in both directions on desktop and phone. Heading geometry, scroll position and canvas instances remained unchanged. Three rapid toggles, Back/Forward and reduced-motion switching passed without errors.

Preview: https://pancake-so1qelt0n-getpancake.vercel.app

The research screenshots and product evidence retained beside this document are historical research from the earlier, broader concept. They do not describe the implemented scope above.
