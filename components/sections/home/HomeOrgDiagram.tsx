/**
 * Org diagram under “Hire squads of agents that work autonomously” — squads
 * revamp of the original Figma `428:14926` stage (1136×706). You + Pancake
 * chips and the founder wire are unchanged; the stage now holds ALL 7 squad
 * cards (Posthog, Meta Ads, Outreach, AI SEO, GitHub Triage, Google Ads,
 * Reddit). The root `.home-org-diagram` is a full-bleed band (max 1536px,
 * `overflow-x: clip` + horizontal fade mask) wider than the 1136 stage, so
 * the outer two cards bleed past the edges as blurred teasers. Squad
 * subagent rows animate in `HomeOrgLiveRows`; wires/balls stay in
 * `OrgConnections`. (The "Build your own" bar was cut — founder call.)
 */

"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import { getInitialDeptMap, HomeOrgLiveRows } from "@/components/sections/home/HomeOrgLiveRows";
import { OrgConnections } from "@/components/sections/home/OrgConnections";

/** Figma `428:14929` / `428:14930` — path `d` from MCP SVG asset (same geometry; placement + rotation per node). */
const CHIP_CONNECTOR_PATH_D =
  "M55.8696 1.00009C34.5611 3.32492 13.6236 11.213 1 22.0334M14.2597 23.8502C9.07792 22.3178 6.17345 22.206 1 22.0334C2.96911 16.9411 4.3971 14.3004 7.21321 9.75729";

const CHIP_ARROW_VB_W = 56.8697;
const CHIP_ARROW_VB_H = 24.8505;
const CHIP_ARROW_CX = CHIP_ARROW_VB_W / 2;
const CHIP_ARROW_CY = CHIP_ARROW_VB_H / 2;

/** Figma `get_design_context` wrapper frames (Vector 264 / 265), not Dev metadata bbox.
 *
 *  Both wrappers were originally placed flush against their chip edge (V264 at
 *  x=744 with right edge at 802 — crossing Pancake chip's left edge x=800; V265
 *  at x=312.96 with left edge basically AT You chip's right edge x=313). After
 *  the path's rotation/scale and the stroke's round line-cap, the START cap of
 *  each arrow rendered as a visible grey "bulb" on the chip's dark surface.
 *  Nudge each wrapper 4 units AWAY from its chip so the cap sits cleanly in the
 *  gap between chip and icon:
 *    • V264 (chip on right → monster on left): x 744 → 740 (shift left)
 *    • V265 (chip on left → avatar on right): x 312.96 → 316.96 (shift right) */
const V264_WRAPPER = { x: 740, y: 22.53125, w: 58.07, h: 32.288 };
const V265_WRAPPER = { x: 316.96, y: 77.82, w: 54.87, h: 22.85 };
const V_PATH_INNER_W = 54.86962890625;
const V_PATH_INNER_H = 22.850130081176758;
const V264_INNER_OFFSET_X = (V264_WRAPPER.w - V_PATH_INNER_W) / 2;
const V264_INNER_OFFSET_Y = (V264_WRAPPER.h - V_PATH_INNER_H) / 2;
const CHIP_ARROW_SX = V_PATH_INNER_W / CHIP_ARROW_VB_W;
const CHIP_ARROW_SY = V_PATH_INNER_H / CHIP_ARROW_VB_H;

export function HomeOrgDiagram() {
  const founderClipId = useId().replace(/:/g, "");
  const diagramRootRef = useRef<HTMLDivElement>(null);
  const [deptRows, setDeptRows] = useState(getInitialDeptMap);

  return (
    <div ref={diagramRootRef} className="home-org-diagram">
      <div className="home-org-diagram__stage">
        <OrgConnections />

        <div
          className="home-org-diagram__you-chip home-org-diagram__abs home-org-diagram__chip--surface"
          data-node-id="596:1685"
          aria-label="You, the founder"
        >
          <div className="home-org-diagram__chip-copy">
            <p className="home-org-diagram__chip-title home-org-diagram__chip-title--inverted">You</p>
            <p className="home-org-diagram__chip-sub home-org-diagram__chip-sub--inverted">The founder</p>
          </div>
        </div>

        <div
          className="home-org-diagram__pancake-chip home-org-diagram__abs home-org-diagram__chip--surface"
          data-node-id="428:14941"
        >
          <div className="home-org-diagram__chip-copy">
            <p className="home-org-diagram__chip-title home-org-diagram__chip-title--inverted">Pancake</p>
            <p className="home-org-diagram__chip-sub home-org-diagram__chip-sub--inverted">
              Your coworker
            </p>
          </div>
        </div>

        {/* Stage box is 1136/632 (dead bottom air trimmed) but the Figma
            geometry stays in 706-unit space — `slice` keeps the width-based
            1:1 mapping and top alignment; the cropped 106 units are empty. */}
        <svg
          className="home-org-diagram__svg home-org-diagram__svg--chip-arrows"
          viewBox="0 0 1136 706"
          preserveAspectRatio="xMidYMin slice"
          aria-hidden
          focusable="false"
        >
          {/* Vector 264 / 265 — `d` from MCP SVG; wrapper x/y from get_design_context (not metadata bbox). */}
          <g transform={`translate(${V264_WRAPPER.x} ${V264_WRAPPER.y}) translate(${V264_INNER_OFFSET_X} ${V264_INNER_OFFSET_Y})`}>
            <g transform={`scale(${CHIP_ARROW_SX} ${CHIP_ARROW_SY}) rotate(10.29 ${CHIP_ARROW_CX} ${CHIP_ARROW_CY})`}>
              <path className="home-org-diagram__chip-arrow-path" d={CHIP_CONNECTOR_PATH_D} />
            </g>
          </g>
          <g transform={`translate(${V265_WRAPPER.x} ${V265_WRAPPER.y})`}>
            <g transform={`scale(${CHIP_ARROW_SX} ${CHIP_ARROW_SY}) rotate(180 ${CHIP_ARROW_CX} ${CHIP_ARROW_CY})`}>
              <path className="home-org-diagram__chip-arrow-path" d={CHIP_CONNECTOR_PATH_D} />
            </g>
          </g>
        </svg>

        <div className="home-org-diagram__you-avatar home-org-diagram__abs" aria-hidden data-node-id="428:14931">
          {/* Figma Frame 109 — vector group from MCP SVG asset (`get_design_context`); fills → palette tokens. */}
          <svg
            className="home-org-diagram__founder-avatar-svg"
            viewBox="0 0 108 108"
            preserveAspectRatio="xMidYMid meet"
            width={108}
            height={108}
          >
            <title>You</title>
            <g clipPath={`url(#${founderClipId})`}>
              <rect width="108" height="108" rx="54" fill="var(--palette-purple-10)" />
              <path
                d="M70.7992 43.5975C72.1483 59.1754 65.1894 74.0014 49.5981 75.4872C33.9421 76.979 24.4667 63.8761 23.1042 48.1425C21.7417 32.4089 28.8112 17.7294 44.4672 16.2375C60.0585 14.7517 69.4502 28.0197 70.7992 43.5975Z"
                fill="var(--palette-purple-30)"
              />
              <path
                d="M59.8224 148.311C38.4258 154.044 16.024 148.002 10.0967 126.621C4.14489 105.151 20.08 88.6935 41.6905 82.903C63.301 77.1125 85.5258 83.3447 91.4776 104.815C97.4049 126.196 81.2189 142.578 59.8224 148.311Z"
                fill="var(--palette-purple-30)"
              />
              <path
                d="M47.6222 46.0657C47.9529 49.8841 46.5381 53.4905 43.2713 53.8018C39.991 54.1144 37.9628 50.8745 37.6288 47.018C37.2949 43.1614 38.7333 39.5912 42.0136 39.2786C45.2805 38.9673 47.2916 42.2472 47.6222 46.0657Z"
                fill="var(--palette-chrome-100)"
              />
              <path
                d="M64.9917 43.682C65.2504 46.6698 64.1434 49.4918 61.5872 49.7354C59.0204 49.98 57.4334 47.4449 57.1721 44.4272C56.9107 41.4095 58.0363 38.6159 60.6031 38.3713C63.1593 38.1277 64.7329 40.6942 64.9917 43.682Z"
                fill="var(--palette-chrome-100)"
              />
            </g>
            <defs>
              <clipPath id={founderClipId}>
                <rect width="108" height="108" rx="54" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="home-org-diagram__monster home-org-diagram__abs" data-node-id="428:15009">
          <Image
            className="home-org-diagram__monster-img"
            src="/pancake-monster.png"
            alt=""
            width={128}
            height={128}
            priority
          />
        </div>

        <HomeOrgLiveRows scrollRootRef={diagramRootRef} deptRows={deptRows} setDeptRows={setDeptRows} />
      </div>
    </div>
  );
}
