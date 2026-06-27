# Archived: "Squads" org-diagram section

Removed from the landing page on 2026-06-27 (see PR that removed the squads
section + nav links). Kept here so it can be revived later.

## What's in the zip
`squad-section-archived-2026-06-27.zip` contains the 5 self-contained components:
- `HomeOrgDiagram.tsx` (desktop diagram)
- `HomeOrgDiagramMobile.tsx` (mobile carousel)
- `HomeOrgLiveRows.tsx`, `OrgConnections.tsx`, `orgLiveData.ts` (helpers/data)

The section's CSS was **not** removed — `.home-org-*`, `.home-landing-section--org`,
`.home-landing-org-mobile/desktop` rules are still in `app/_styles/components.css`.

## How to revive
1. Unzip into the repo root (restores files to `components/sections/home/`):
   ```bash
   unzip _archive/squad-section-archived-2026-06-27.zip
   ```
   Or pull straight from git history instead of the zip:
   ```bash
   git checkout <commit-before-removal> -- components/sections/home/HomeOrgDiagram.tsx \
     components/sections/home/HomeOrgDiagramMobile.tsx \
     components/sections/home/HomeOrgLiveRows.tsx \
     components/sections/home/OrgConnections.tsx \
     components/sections/home/orgLiveData.ts
   ```

2. In `components/sections/home/HomeLandingBody.tsx`, re-add the imports:
   ```ts
   import { HomeOrgDiagram } from "@/components/sections/home/HomeOrgDiagram";
   import { HomeOrgDiagramMobile } from "@/components/sections/home/HomeOrgDiagramMobile";
   ```
   …and the section JSX (it previously sat first, above integrations):
   ```tsx
   <section className="home-landing-section home-landing-section--org" aria-labelledby="home-landing-org-heading">
     <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
       <header className="home-landing-section__header">
         <H2 id="home-landing-org-heading" className="heading home-landing-section__title text-center">
           Hire squads of agents that work autonomously
         </H2>
         <p className="home-landing-section__lede text-center">Even when you’re asleep</p>
       </header>
       <div className="home-landing-section__figure home-landing-org-mobile">
         <HomeOrgDiagramMobile />
       </div>
     </div>
     <div className="home-landing-org-desktop">
       <HomeOrgDiagram />
     </div>
   </section>
   ```

3. (Optional) Restore the "Squads" nav links in `HomeNav.tsx` (desktop nav + mobile
   drawer) pointing to `https://squads.getpancake.ai/` — also recoverable from git history.
