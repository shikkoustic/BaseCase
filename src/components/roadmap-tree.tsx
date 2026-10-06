"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LEVEL_LABEL, LEVEL_BADGE_CLASS } from "@/lib/difficulty";
import type { TopicSlot } from "@/lib/topic-slots";

// Hand-laid-out (not auto-generated) node-link diagram of how the stages
// actually build on each other — not just "do these in order" but which
// ones branch off the same prerequisite and which ones converge back
// together. Positions are percentages of a fixed-width inner canvas, and
// the connector lines are drawn in an SVG sharing that same 0-100
// coordinate space (viewBox="0 0 100 100" + preserveAspectRatio="none"), so
// a line always meets a node's center exactly. The canvas has a minimum
// pixel width (see CANVAS_MIN_WIDTH below) and the outer wrapper scrolls
// horizontally rather than letting the 3-way branch row squeeze into
// collision on narrow screens.
type NodeSpec = {
  key: string; // slot key: topic slug, category name for a grouped stage, or a BIT_MATH_KEY-style virtual key
  x: number;
  y: number;
};

const CANVAS_MIN_WIDTH = 820;

// Bit Manipulation and Math & Number Theory are two separate real topics,
// but the reference layout shows them as one trailing box — folded into a
// single virtual node the same way "Graphs" already folds five subtopics
// into one. See buildNodeInfo below.
const BIT_MATH_KEY = "bit-math-combined";

// Cosmetic-only renames for the tree (the real topic name — "Backtracking" —
// is unchanged everywhere else in the app, e.g. the topics list and its own
// page; this is just how this one diagram labels that stop).
const LABEL_OVERRIDES: Record<string, string> = {
  backtracking: "Recursion & Backtracking",
};

const NODES: NodeSpec[] = [
  { key: "arrays-hashing", x: 50, y: 9 },
  { key: "two-pointers", x: 18, y: 18 },
  { key: "binary-search", x: 82, y: 18 },
  { key: "sliding-window", x: 10, y: 27 },
  { key: "linked-list", x: 30, y: 27 },
  { key: "stacks-queues", x: 18, y: 36 },
  { key: "backtracking", x: 50, y: 46 },
  { key: "trees", x: 50, y: 55 },
  { key: "tries", x: 26, y: 64 },
  { key: "heaps-priority-queues", x: 74, y: 64 },
  { key: "Graphs", x: 55, y: 73 },
  { key: "greedy", x: 86, y: 73 },
  { key: "Dynamic Programming", x: 50, y: 83 },
  { key: BIT_MATH_KEY, x: 50, y: 94 },
];

const EDGES: [string, string][] = [
  ["root", "arrays-hashing"],
  ["arrays-hashing", "two-pointers"],
  ["arrays-hashing", "binary-search"],
  ["arrays-hashing", "backtracking"], // the middle pass-through column in the reference diagram
  ["two-pointers", "sliding-window"],
  ["two-pointers", "linked-list"],
  ["sliding-window", "stacks-queues"],
  ["linked-list", "stacks-queues"],
  ["stacks-queues", "backtracking"],
  ["binary-search", "backtracking"],
  ["backtracking", "trees"],
  ["trees", "tries"],
  ["trees", "heaps-priority-queues"],
  ["heaps-priority-queues", "Graphs"],
  ["heaps-priority-queues", "greedy"],
  ["Graphs", "Dynamic Programming"],
  ["greedy", "Dynamic Programming"],
  ["Dynamic Programming", BIT_MATH_KEY],
];

const ROOT: NodeSpec = { key: "root", x: 50, y: 2 };

type NodeInfo = {
  name: string;
  level: string;
  count: number;
  href: string;
  subLabel?: string;
};

function buildNodeInfo(slots: TopicSlot[], countsByTopic: Record<string, number>): Map<string, NodeInfo> {
  const map = new Map<string, NodeInfo>();
  for (const slot of slots) {
    if (slot.kind === "group") {
      const count = slot.topics.reduce((sum, t) => sum + (countsByTopic[t.id] ?? 0), 0);
      map.set(slot.category, {
        name: slot.category,
        level: slot.level,
        count,
        href: `/topics/${slot.topics[0].slug}`,
        // Full subtopic names would wrap to several lines and grow the card
        // tall enough to collide with the node below it — a plain count
        // keeps every card the same height; the branch detail lives on the
        // topics page itself.
        subLabel: `${slot.topics.length} subtopics`,
      });
    } else {
      map.set(slot.topic.slug, {
        name: slot.topic.name,
        level: slot.topic.level,
        count: countsByTopic[slot.topic.id] ?? 0,
        href: `/topics/${slot.topic.slug}`,
      });
    }
  }

  const bitManip = map.get("bit-manipulation");
  const math = map.get("math-number-theory");
  if (bitManip && math) {
    map.set(BIT_MATH_KEY, {
      name: "Bit Manipulation & Math Essentials",
      level: bitManip.level,
      count: bitManip.count + math.count,
      href: bitManip.href,
      subLabel: "2 topics",
    });
  }

  return map;
}

// The set of actual (stored) edge directions, used to find the right <line>
// / motion-path regardless of which way a given random-walk hop travels it.
const EDGE_ID_SET = new Set(EDGES.map(([a, b]) => `${a}-${b}`));
function edgeIdFor(a: string, b: string): string {
  const forward = `${a}-${b}`;
  return EDGE_ID_SET.has(forward) ? forward : `${b}-${a}`;
}

const WALK_MIN_STEPS = 6;
const WALK_MAX_STEPS = 10;

// A genuine random walk over the whole tree, treating every edge as
// two-way — the beam can head back up through a parent just as easily as
// down into a child, not just one fixed root-to-leaf descent. Avoids
// immediately bouncing back the way it came when there's another option.
function pickRandomWalk(neighborsOf: Map<string, string[]>): { from: string; to: string }[] {
  const steps = WALK_MIN_STEPS + Math.floor(Math.random() * (WALK_MAX_STEPS - WALK_MIN_STEPS + 1));
  const path: { from: string; to: string }[] = [];
  let current = "root";
  let prev: string | null = null;

  for (let i = 0; i < steps; i++) {
    const neighbors = neighborsOf.get(current) ?? [];
    if (neighbors.length === 0) break;
    const candidates = prev !== null && neighbors.length > 1 ? neighbors.filter((n) => n !== prev) : neighbors;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    path.push({ from: current, to: next });
    prev = current;
    current = next;
  }
  return path;
}

// A branch "ignites" like a lightsaber blade: it doesn't just flip on, it
// visibly grows from its origin node toward the other end over the full
// duration below. Built with the standard SVG line-draw technique — a
// dasharray equal to the line's own length, with dashoffset transitioning
// from that length (fully hidden) down to 0 (fully drawn) via a plain CSS
// transition — rather than a traveling dot or rAF loop. This is the same
// reason the dot was avoided (Safari's SMIL support is inconsistent), but
// simpler and more robust: no per-frame JS at all, just one style change per
// edge when it lights up.
const EDGE_DURATION_MS = 4500;
const NODE_GLOW_LINGER_MS = 800;
const PAUSE_BETWEEN_BEAMS_MS = 3000;

export function RoadmapTree({
  slots,
  countsByTopic,
}: {
  slots: TopicSlot[];
  countsByTopic: Record<string, number>;
}) {
  const info = useMemo(() => buildNodeInfo(slots, countsByTopic), [slots, countsByTopic]);
  const positions = useMemo(
    () => new Map<string, NodeSpec>([[ROOT.key, ROOT], ...NODES.map((n): [string, NodeSpec] => [n.key, n])]),
    [],
  );
  // Undirected — a random walk can head back up through a parent, not just
  // down into children.
  const neighborsOf = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [a, b] of EDGES) {
      map.set(a, [...(map.get(a) ?? []), b]);
      map.set(b, [...(map.get(b) ?? []), a]);
    }
    return map;
  }, []);

  const [litEdges, setLitEdges] = useState<Set<string>>(new Set());
  const [litNodes, setLitNodes] = useState<Set<string>>(new Set());
  // Which way the beam actually travelled through each edge the last time it
  // lit up — a random walk can cross a stored edge in either direction, and
  // the blade needs to grow FROM wherever the beam entered, not always from
  // the edge's stored (from, to) order. A ref, not state: it only needs to
  // be current by the time `litEdges` triggers the next render, not to
  // trigger one itself.
  const edgeDirectionRef = useRef<Map<string, { from: string; to: string }>>(new Map());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timeoutsRef.current.push(id);
    }

    function runBeam() {
      if (cancelled) return;
      const path = pickRandomWalk(neighborsOf);
      if (path.length === 0) {
        schedule(runBeam, PAUSE_BETWEEN_BEAMS_MS);
        return;
      }

      path.forEach(({ from, to }, i) => {
        const edgeId = edgeIdFor(from, to);
        const start = i * EDGE_DURATION_MS;
        schedule(() => {
          edgeDirectionRef.current.set(edgeId, { from, to });
          setLitEdges((prev) => new Set(prev).add(edgeId));
          setLitNodes((prev) => {
            const next = new Set(prev);
            next.add(to);
            if (i === 0) next.add(from);
            return next;
          });
        }, start);

        schedule(() => {
          setLitEdges((prev) => {
            const next = new Set(prev);
            next.delete(edgeId);
            return next;
          });
          setLitNodes((prev) => {
            const next = new Set(prev);
            next.delete(to);
            if (i === 0) next.delete(from);
            return next;
          });
        }, start + EDGE_DURATION_MS + NODE_GLOW_LINGER_MS);
      });

      const totalDuration = path.length * EDGE_DURATION_MS + NODE_GLOW_LINGER_MS;
      schedule(runBeam, totalDuration + PAUSE_BETWEEN_BEAMS_MS);
    }

    schedule(runBeam, 1200);

    return () => {
      cancelled = true;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [neighborsOf]);

  return (
    <div className="overflow-x-auto">
      <div className="relative h-[1050px] w-full" style={{ minWidth: CANVAS_MIN_WIDTH }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          {EDGES.map(([from, to]) => {
            const a = positions.get(from);
            const b = positions.get(to);
            if (!a || !b) return null;
            const edgeId = `${from}-${to}`;
            const lit = litEdges.has(edgeId);
            // The blade always grows from wherever the beam actually entered
            // this edge, which may be the reverse of its stored (from, to)
            // order — see edgeDirectionRef above.
            const dir = edgeDirectionRef.current.get(edgeId) ?? { from, to };
            const start = positions.get(dir.from) ?? a;
            const end = positions.get(dir.to) ?? b;
            // Rounded, not raw — Math.hypot isn't guaranteed bit-identical
            // across JS engines, so the server (Node/V8) and a client
            // engine like Safari's JavaScriptCore can land on a different
            // last decimal digit for the exact same inputs. That's invisible
            // at this precision but was enough of a string mismatch to trip
            // React's hydration check (the only float computed inline in
            // JSX like this anywhere in the tree).
            const length = Math.round(Math.hypot(end.x - start.x, end.y - start.y) * 1000) / 1000;
            return (
              <g key={edgeId}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  vectorEffect="non-scaling-stroke"
                  className="stroke-foreground/15"
                  strokeWidth={1.5}
                />
                {/* The lightsaber blade itself: a dash spanning the edge's
                    full length, revealed from its start point by animating
                    dashoffset down to 0. No vector-effect here — the dash
                    pattern has to stay in the same (non-uniformly scaled)
                    coordinate space as x1/y1/x2/y2 for the reveal to track
                    the line's real endpoints exactly, which also means the
                    stroke width itself gets stretched by that same per-axis
                    scale (the canvas is ~10-15x taller/wider than the 0-100
                    viewBox) — so it's sized small enough here to still read
                    as a thin line once stretched, not a blob. */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  strokeLinecap="round"
                  className="stroke-sky-300 dark:stroke-sky-200"
                  strokeWidth={0.22}
                  strokeDasharray={length}
                  style={{
                    strokeDashoffset: lit ? 0 : length,
                    transition: lit
                      ? `stroke-dashoffset ${EDGE_DURATION_MS}ms linear`
                      : "stroke-dashoffset 350ms ease-in",
                  }}
                />
              </g>
            );
          })}
        </svg>

        <div
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-shadow duration-500 ${
            litNodes.has("root") ? "rounded-full shadow-[0_0_24px_6px_rgba(56,189,248,0.55)]" : ""
          }`}
          style={{ left: `${ROOT.x}%`, top: `${ROOT.y}%` }}
        >
          <span
            className={`flex size-10 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors duration-500 ${
              litNodes.has("root")
                ? "border-sky-400/80 bg-sky-400/10 text-foreground"
                : "border-foreground/20 bg-foreground/[0.04]"
            }`}
          >
            DSA
          </span>
        </div>

        {NODES.map((node) => {
          const data = info.get(node.key);
          if (!data) return null;
          const lit = litNodes.has(node.key);
          return (
            <Link
              key={node.key}
              href={data.href}
              className={`group absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg border bg-foreground/[0.03] px-2.5 py-2 text-center backdrop-blur-sm transition-all duration-500 hover:border-foreground/30 ${
                lit
                  ? "border-sky-400/70 shadow-[0_0_22px_4px_rgba(56,189,248,0.45)]"
                  : "border-foreground/[0.12] shadow-sm"
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span className="text-sm font-medium leading-tight group-hover:underline">
                {LABEL_OVERRIDES[node.key] ?? data.name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={LEVEL_BADGE_CLASS}>{LEVEL_LABEL[data.level] ?? data.level}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{data.count}</span>
              </span>
              {data.subLabel && (
                <span className="text-[9px] leading-tight text-muted-foreground/60">{data.subLabel}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
