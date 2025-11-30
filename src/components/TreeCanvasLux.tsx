import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AvlNode, AvlRole, Student, TutorGhostMode } from "../lib/avl/types";

type Props = {
  root: AvlNode | null;

  // highlight nodes (insert / balance when needed)
  focusIds?: string[];

  // highlight edges theo path (format: "parent->child")
  // (search: chỉ tô edges, không tô nodes => focusIds = [])
  focusEdges?: string[];

  // insert ghost
  ghost?: Student;
  ghostMode?: TutorGhostMode;
  ghostTargetId?: string;
  ghostDirHint?: "L" | "R";

  autoFit?: boolean; // fit tree vào frame 90vw/90vh

  // balance roles: { nodeId: "Z"|"Y"|"X" }
  roles?: Record<string, AvlRole>;
};

// layout constants (đã nén để cây gọn)
const NODE_W = 140;
const NODE_H = 70;
const X_GAP = 26;
const Y_GAP = 82;
const PAD = 36;

function h(n: AvlNode | null) {
  return n ? n.height : 0;
}
function bf(n: AvlNode) {
  return h(n.left) - h(n.right);
}

function layoutTree(root: AvlNode | null) {
  let idx = 0;

  const nodes: Array<{
    id: string;
    name: string;
    gpa: number;
    height: number;
    b: number;
    x: number;
    y: number;
  }> = [];

  const edges: Array<{ from: string; to: string }> = [];
  const depth = new Map<string, number>();

  function inorder(n: AvlNode | null, d: number) {
    if (!n) return;
    inorder(n.left, d + 1);

    depth.set(n.id, d);

    const cx = PAD + idx * (NODE_W + X_GAP);
    const top = PAD + d * Y_GAP;

    nodes.push({
      id: n.id,
      name: n.name,
      gpa: n.gpa,
      height: n.height,
      b: bf(n),
      x: cx,
      y: top,
    });

    idx++;
    inorder(n.right, d + 1);
  }

  function link(n: AvlNode | null) {
    if (!n) return;
    if (n.left) edges.push({ from: n.id, to: n.left.id });
    if (n.right) edges.push({ from: n.id, to: n.right.id });
    link(n.left);
    link(n.right);
  }

  inorder(root, 0);
  link(root);

  const maxDepth = nodes.reduce((m, p) => Math.max(m, depth.get(p.id) ?? 0), 0);

  const width =
    nodes.length === 0 ? 560 : PAD * 2 + nodes.length * (NODE_W + X_GAP) - X_GAP;

  const height =
    nodes.length === 0 ? 560 : PAD * 2 + (maxDepth + 1) * Y_GAP + 40;

  const map = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => map.set(n.id, { x: n.x, y: n.y }));

  return { nodes, edges, map, width, height };
}

function roleBadge(role?: AvlRole) {
  if (!role) return null;

  const cls =
    role === "Z"
      ? "bg-rose-500/20 text-rose-200 border-rose-400/40"
      : role === "Y"
      ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
      : "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";

  return (
    <div className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold ${cls}`}>
      {role}
    </div>
  );
}

function roleFrame(role?: AvlRole) {
  if (!role) return "";
  if (role === "Z") return "border-rose-300/60 ring-2 ring-rose-400/20";
  if (role === "Y") return "border-sky-300/60 ring-2 ring-sky-400/20";
  return "border-emerald-300/60 ring-2 ring-emerald-400/20";
}

export default function TreeCanvasLux({
  root,
  focusIds = [],
  focusEdges = [],
  ghost,
  ghostMode,
  ghostTargetId,
  ghostDirHint,
  autoFit = true,
  roles,
}: Props) {
  const { nodes, edges, map, width, height } = useMemo(() => layoutTree(root), [root]);

  const focus = useMemo(() => new Set(focusIds), [focusIds]);
  const edgeFocus = useMemo(() => new Set(focusEdges), [focusEdges]);

  // measure the frame size for auto-fit scale
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setFrame({ w: r.width, h: r.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    if (!autoFit) return 1;
    if (frame.w === 0 || frame.h === 0) return 1;

    const safePad = 32;
    const sx = (frame.w - safePad) / width;
    const sy = (frame.h - safePad) / height;
    return Math.min(1, sx, sy);
  }, [autoFit, frame.w, frame.h, width, height]);

  // Ghost positioning (insert flow)
  const ghostPos = useMemo(() => {
    if (!ghost) return null;

    if (!ghostMode || ghostMode === "floating") return { x: width / 2, y: 18 };

    if (!ghostTargetId) return { x: width / 2, y: 18 };
    const t = map.get(ghostTargetId);
    if (!t) return { x: width / 2, y: 18 };

    if (ghostMode === "atNode") return { x: t.x, y: t.y - 86 };

    // atNull: position near the intended child direction
    const dx = (NODE_W + X_GAP) * 0.42 * (ghostDirHint === "L" ? -1 : 1);
    return { x: t.x + dx, y: t.y + Y_GAP };
  }, [ghost, ghostMode, ghostTargetId, ghostDirHint, map, width]);

  return (
    <div className="absolute inset-0">
      {/* Background full screen */}
      <div className="absolute inset-0 bg-linear-to-br from-[#070B14] via-[#0B1220] to-[#05070D]" />

      {/* Frame 90vw/90vh */}
      <div
        ref={frameRef}
        className="absolute left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur"
      >
        <div className="relative h-full w-full">
          {/* Stage centered + auto-fit scale */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) scale(${fitScale})`,
              transformOrigin: "center",
            }}
          >
            <div
              className="relative"
              style={{
                width,
                height,
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(212,175,55,0.08) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            >
              {/* EDGES */}
              <svg className="absolute inset-0" width={width} height={height}>
                <AnimatePresence initial={false}>
                  {edges.map((e) => {
                    const a = map.get(e.from);
                    const b = map.get(e.to);
                    if (!a || !b) return null;

                    const x1 = a.x;
                    const y1 = a.y + NODE_H;
                    const x2 = b.x;
                    const y2 = b.y;

                    const c1y = y1 + 24;
                    const c2y = y2 - 24;
                    const d = `M ${x1} ${y1} C ${x1} ${c1y}, ${x2} ${c2y}, ${x2} ${y2}`;

                    const edgeKey = `${e.from}->${e.to}`;
                    const isPathEdge = edgeFocus.has(edgeKey);

                    // roles (Z/Y/X) should also pop
                    const isRole = !!roles?.[e.from] || !!roles?.[e.to];

                    //   only path edges (search) OR roles (balance)
                    const strong = isPathEdge || isRole;

                    return (
                      <motion.path
                        key={edgeKey}
                        d={d}
                        fill="none"
                        stroke={strong ? "rgba(212,175,55,0.98)" : "rgba(226,232,240,0.82)"}
                        strokeWidth={strong ? 3.8 : 2.8}
                        strokeLinecap="round"
                        initial={{ opacity: 0, pathLength: 0.25 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        exit={{ opacity: 0, pathLength: 0 }}
                        transition={{ duration: 0.28 }}
                      />
                    );
                  })}
                </AnimatePresence>
              </svg>

              {/* NODES */}
              <AnimatePresence initial={false}>
                {nodes.map((n) => {
                  const highlight = focus.has(n.id);
                  const role = roles?.[n.id];

                  return (
                    <motion.div
                      key={n.id}
                      layout
                      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                      className="absolute"
                      style={{
                        left: n.x - NODE_W / 2,
                        top: n.y,
                        width: NODE_W,
                        height: NODE_H,
                      }}
                    >
                      <div
                        className={[
                          "h-full w-full rounded-2xl border px-3 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.45)]",
                          highlight
                            ? "border-[#D4AF37] bg-[#0E162A] ring-4 ring-[#D4AF37]/25"
                            : "border-white/10 bg-[#0C1426]",
                          !highlight ? roleFrame(role) : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-extrabold tracking-wide text-white">
                            {n.id}
                          </div>
                          <div className="flex items-center gap-2">
                            {roleBadge(role)}
                            <div className="text-[11px] text-white/70">
                              h={n.height} • bf={n.b}
                            </div>
                          </div>
                        </div>

                        <div className="mt-0.5 truncate text-xs font-semibold text-white/90">
                          {n.name}
                        </div>

                        <div className="text-xs text-white/80">
                          GPA: <span className="font-bold text-[#D4AF37]">{n.gpa}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* GHOST NODE */}
              {ghost && ghostPos && (
                <motion.div
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    left: ghostPos.x - (NODE_W * 1.04) / 2,
                    top: ghostPos.y,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  style={{ width: NODE_W * 1.04 }}
                >
                  <div className="rounded-2xl border border-[#D4AF37] bg-[#0B1020]/85 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.6)] backdrop-blur">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4AF37]">
                      New (not attached)
                    </div>
                    <div className="mt-0.5 text-base font-extrabold text-white">{ghost.id}</div>
                    <div className="truncate text-xs text-white/85">{ghost.name}</div>
                    <div className="text-xs text-white/80">
                      GPA: <span className="font-bold text-[#D4AF37]">{ghost.gpa}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {!root && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70">
                  Cây rỗng.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
