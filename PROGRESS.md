# Pancake landing rebuild — progress

- [x] **Phase 1:** Audit & Strip
- [x] **Phase 2:** Install + design kit port (tokens, reset, styles, Aeonik Fono, GSAP, UI primitives, `/kit-test`)
- [ ] **Phase 3:** Rebuild Homepage
- [ ] **Phase 4:** Rebuild `/signup` (visual only — form/API sacred)
- [ ] **Phase 5:** Rebuild `/pricing`
- [ ] **Phase 6:** Rebuild `/build-in-public`
- [ ] **Phase 7:** Final Pass

## Human / agent toggle foundation — September 4, 2026

Scope: original human landing plus a selector above the headline’s right edge. Agent mode keeps the hero layout and uses inverse cream/plum colors, followed by one empty `100vh` section.

- [x] Restore original v3 copy and section components.
- [x] Keep human layout unchanged apart from the selector.
- [x] Match the Figma Signals switch, with rainbow blue for humans and green for agents.
- [x] Remove the earlier agent copy, demonstrations and setup surfaces.
- [x] Add the inverse hero, preserving artwork and motion phase.
- [x] Keep URL sharing, refresh, browser history and keyboard switching working.
- [x] Add a quick 240ms crossfade in both directions, respecting reduced motion.
- [x] Remove the pre-fade wait and keep the switch’s standard slide outside the page crossfade.
- [x] Set the agent H1 to “Give your human” / “GTM superpowers”, preserving the original font, size and headline box.
- [x] Add the agent-only “Start here” terminal CTA with verified public plugin setup URL and working copy feedback.
- [x] Set the terminal background to pure black; remove “Start here” at the founder’s request.
- [x] Add the single-line `> give your human gtm superpowers` Aeonik Fono agent headline, with a finite cursor typing reveal and immediate reduced-motion alternative.
- [x] Align the agent setup block to the original human description/buttons bounds, preserving their position and width on desktop and mobile.
- [x] Replace the paste hint with “Friends with” and white Claude / Codex / Cursor / Hermes / OpenClaw logos above the terminal at its right edge, preserving accessible copy feedback.
- [x] Compare desktop and phone human layouts against baseline `14ad159`.
- [x] Independently review code and test booking and mobile menu behavior.
- [x] Complete production build and updated Vercel preview verification.

Preview: https://pancake-qmue81mt3-getpancake.vercel.app
Draft PR: https://github.com/get-pancake/website/pull/275

Implementation and validation: [human-agent-design.md](docs/human-agent-design.md).
