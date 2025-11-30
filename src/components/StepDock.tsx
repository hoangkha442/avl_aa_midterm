// import type { TutorStep } from "../lib/avl/types";

// type Props = {
//   active: boolean;
//   step?: TutorStep;
//   index: number;
//   total: number;
//   onPrev: () => void;
//   onNext: () => void;
//   onCommit: () => void;
//   onExit: () => void;
//   atEnd: boolean;
// };

// export default function StepDock({
//   active,
//   step,
//   index,
//   total,
//   onPrev,
//   onNext,
//   onCommit,
//   onExit,
//   atEnd,
// }: Props) {
//   if (!active) return null;

//   return (
//     <div className="absolute bottom-6 left-1/2 z-40 w-[980px] max-w-[95vw] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0B1020]/85 p-4 text-white shadow-[0_25px_80px_rgba(0,0,0,0.75)] backdrop-blur">
//       <div className="flex flex-wrap items-start justify-between gap-3">
//         <div className="min-w-[260px]">
//           <div className="text-xs uppercase tracking-widest text-white/60">
//             Step {Math.min(index + 1, total)}/{total}
//           </div>
//           <div className="mt-1 text-lg font-extrabold">{step?.title ?? ""}</div>
//           <div className="mt-1 text-sm text-white/80">{step?.detail ?? ""}</div>

//           {step?.compareText && (
//             <div className="mt-3 rounded-2xl border border-[#D4AF37]/35 bg-[#111B33] px-4 py-3">
//               <div className="text-[11px] uppercase tracking-widest text-[#D4AF37]">Compare</div>
//               <div className="mt-1 text-xl font-extrabold text-white">{step.compareText}</div>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={onPrev}
//             className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
//           >
//             ◀ Prev
//           </button>
//           <button
//             onClick={onNext}
//             className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
//           >
//             Next ▶
//           </button>

//           <button
//             onClick={onExit}
//             className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
//           >
//             Exit
//           </button>

//           {atEnd && (
//             <button
//               onClick={onCommit}
//               className="rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
//             >
//               Commit (Apply to Tree)
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import type { AvlCase, TutorStep } from "../lib/avl/types";

type Props = {
  active: boolean;
  step?: TutorStep;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onCommit: () => void;
  onExit: () => void;
  atEnd: boolean;
};

function CaseDiagram({ caze, mode }: { caze: AvlCase; mode: "before" | "after" }) {
  // coordinates
  const Z = { x: 90, y: 26 };
  const YL = { x: 46, y: 72 };
  const YR = { x: 134, y: 72 };
  const XL = { x: 26, y: 114 };
  const XR = { x: 66, y: 114 };
  const XL2 = { x: 114, y: 114 };
  const XR2 = { x: 154, y: 114 };

  type P = { x: number; y: number; label: "Z" | "Y" | "X" };
  type E = { a: P; b: P };

  // Build a tiny “shape only” diagram - enough to see rotation outcome.
  let nodes: P[] = [];
  let edges: E[] = [];

  if (caze === "LL") {
    const z = { ...Z, label: "Z" as const };
    const y = { ...YL, label: "Y" as const };
    const x = { ...XL, label: "X" as const };
    if (mode === "before") {
      nodes = [z, y, x];
      edges = [{ a: z, b: y }, { a: y, b: x }];
    } else {
      // after: Y root, X left, Z right
      const y2 = { ...Z, label: "Y" as const };
      const x2 = { ...YL, label: "X" as const };
      const z2 = { ...YR, label: "Z" as const };
      nodes = [y2, x2, z2];
      edges = [{ a: y2, b: x2 }, { a: y2, b: z2 }];
    }
  }

  if (caze === "RR") {
    const z = { ...Z, label: "Z" as const };
    const y = { ...YR, label: "Y" as const };
    const x = { ...XR2, label: "X" as const };
    if (mode === "before") {
      nodes = [z, y, x];
      edges = [{ a: z, b: y }, { a: y, b: x }];
    } else {
      // after: Y root, Z left, X right
      const y2 = { ...Z, label: "Y" as const };
      const z2 = { ...YL, label: "Z" as const };
      const x2 = { ...YR, label: "X" as const };
      nodes = [y2, z2, x2];
      edges = [{ a: y2, b: z2 }, { a: y2, b: x2 }];
    }
  }

  if (caze === "LR") {
    // before: Z, Y left, X is Y.right
    if (mode === "before") {
      const z = { ...Z, label: "Z" as const };
      const y = { ...YL, label: "Y" as const };
      const x = { ...XR, label: "X" as const };
      nodes = [z, y, x];
      edges = [{ a: z, b: y }, { a: y, b: x }];
    } else {
      // after: X root, Y left, Z right
      const x2 = { ...Z, label: "X" as const };
      const y2 = { ...YL, label: "Y" as const };
      const z2 = { ...YR, label: "Z" as const };
      nodes = [x2, y2, z2];
      edges = [{ a: x2, b: y2 }, { a: x2, b: z2 }];
    }
  }

  if (caze === "RL") {
    // before: Z, Y right, X is Y.left
    if (mode === "before") {
      const z = { ...Z, label: "Z" as const };
      const y = { ...YR, label: "Y" as const };
      const x = { ...XL2, label: "X" as const };
      nodes = [z, y, x];
      edges = [{ a: z, b: y }, { a: y, b: x }];
    } else {
      // after: X root, Z left, Y right
      const x2 = { ...Z, label: "X" as const };
      const z2 = { ...YL, label: "Z" as const };
      const y2 = { ...YR, label: "Y" as const };
      nodes = [x2, z2, y2];
      edges = [{ a: x2, b: z2 }, { a: x2, b: y2 }];
    }
  }

  const color = (lab: "Z" | "Y" | "X") =>
    lab === "Z" ? "rgba(244,63,94,0.95)" : lab === "Y" ? "rgba(56,189,248,0.95)" : "rgba(16,185,129,0.95)";

  return (
    <svg width="180" height="138" className="rounded-2xl border border-white/10 bg-white/5">
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke="rgba(226,232,240,0.75)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={14} fill="rgba(15,23,42,0.9)" stroke={color(n.label)} strokeWidth={3} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fill="white" fontWeight="800">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function StepDock({
  active,
  step,
  index,
  total,
  onPrev,
  onNext,
  onCommit,
  onExit,
  atEnd,
}: Props) {
  if (!active) return null;

  return (
    <div className="absolute bottom-6 left-1/2 z-40 w-[920px] max-w-[90vw] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0B1020]/85 p-4 text-white shadow-[0_25px_80px_rgba(0,0,0,0.75)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[260px]">
          <div className="text-xs uppercase tracking-widest text-white/60">
            Step {Math.min(index + 1, total)}/{total}
          </div>

          <div className="mt-1 text-lg font-extrabold">{step?.title ?? ""}</div>
          <div className="mt-1 text-sm text-white/80">{step?.detail ?? ""}</div>

          {step?.compareText && (
            <div className="mt-3 rounded-2xl border border-[#D4AF37]/35 bg-[#111B33] px-4 py-3">
              <div className="text-[11px] uppercase tracking-widest text-[#D4AF37]">Compare</div>
              <div className="mt-1 text-xl font-extrabold text-white">{step.compareText}</div>
            </div>
          )}

          {(step?.avlCase || step?.rotationHint) && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-xs font-bold text-white/80">
                {step.avlCase ? `Case: ${step.avlCase}` : "Rotation"}
              </div>
              {step.rotationHint && <div className="mt-1 text-sm text-white/85">{step.rotationHint}</div>}

              {step.avlCase && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-widest text-white/60">Before</div>
                    <CaseDiagram caze={step.avlCase} mode="before" />
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-widest text-white/60">After</div>
                    <CaseDiagram caze={step.avlCase} mode="after" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
          >
            ◀ Prev
          </button>
          <button
            onClick={onNext}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
          >
            Next ▶
          </button>

          <button
            onClick={onExit}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
          >
            Exit
          </button>

          {atEnd && (
            <button
              onClick={onCommit}
              className="rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
            >
              Commit (Apply)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
