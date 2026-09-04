# Pancake landing rebuild — progress

- [x] **Phase 1:** Audit & Strip
- [x] **Phase 2:** Install + design kit port (tokens, reset, styles, Aeonik Fono, GSAP, UI primitives, `/kit-test`)
- [ ] **Phase 3:** Rebuild Homepage
- [ ] **Phase 4:** Rebuild `/signup` (visual only — form/API sacred)
- [ ] **Phase 5:** Rebuild `/pricing`
- [ ] **Phase 6:** Rebuild `/build-in-public`
- [ ] **Phase 7:** Final Pass

## Human / agent toggle foundation — September 4, 2026

Scope: original human landing plus a selector above the headline’s right edge. Agent mode uses the identical hero and inverse cream/plum colors, followed by one empty `100vh` section.

- [x] Restore original v3 copy and section components.
- [x] Keep human layout unchanged apart from the selector.
- [x] Remove the earlier agent copy, demonstrations and setup surfaces.
- [x] Add the inverse hero, preserving artwork and motion phase.
- [x] Keep URL sharing, refresh, browser history and keyboard switching working.
- [x] Compare desktop and phone human layouts against baseline `14ad159`.
- [x] Independently review code and test booking and mobile menu behavior.
- [x] Complete production build and updated Vercel preview verification.

Preview: https://pancake-6332ikw29-getpancake.vercel.app
Draft PR: https://github.com/get-pancake/website/pull/275

Implementation and validation: [human-agent-design.md](docs/human-agent-design.md).
