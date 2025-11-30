import { useEffect, useMemo, useState } from "react";
import TreeCanvasLux from "../components/TreeCanvasLux";
import StepDock from "../components/StepDock";
import NavPills from "../components/NavPills";
import type { AvlNode, TutorStep } from "../lib/avl/types";
import { simulateDeleteThenBalanceWithTutorSteps } from "../lib/avl/simulateDeleteAndBalance";

import {
  buildUnbalancedPreset,
  simulateBalanceWithTutorSteps,
  type BalanceCase,
} from "../lib/avl/simulateBalance";
import DeleteBalanceModal from "../components/DeleteBalanceModal";

const LS_KEY = "bst_tree_latest";

export default function BalanceTutor() {
  const [root, setRoot] = useState<AvlNode | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [picked, setPicked] = useState<BalanceCase>("LL");
  const [deleteId, setDeleteId] = useState("");
  console.log("deleteId: ", deleteId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [session, setSession] = useState<{
    steps: TutorStep[];
    idx: number;
    finalRoot: AvlNode | null;
  } | null>(null);

  useEffect(() => {
    // default: preset LL
    setRoot(buildUnbalancedPreset("LL"));
  }, []);

  const step = session?.steps[session.idx];
  const renderRoot = session ? step?.snapshot ?? root : root;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2100);
  };

  const loadLastFromInsert = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return showToast("Chưa có cây lưu từ Insert.");
      const parsed = JSON.parse(raw) as AvlNode | null;
      setRoot(parsed);
      showToast("Đã load cây từ Insert.");
    } catch {
      showToast("Load thất bại.");
    }
  };

  const usePreset = (c: BalanceCase) => {
    setPicked(c);
    setRoot(buildUnbalancedPreset(c));
    setSession(null);
  };

  const startDeleteAndBalance = (id: string) => {
    if (!root) return showToast("Cây rỗng.");
    setDeleteId(id);
    const sim = simulateDeleteThenBalanceWithTutorSteps(root, id);
    setSession({ steps: sim.steps, idx: 0, finalRoot: sim.finalRoot });
    setDeleteOpen(false);
  };

  const startBalance = () => {
    if (!root) return showToast("Cây rỗng.");
    const sim = simulateBalanceWithTutorSteps(root);
    setSession({ steps: sim.steps, idx: 0, finalRoot: sim.finalRoot });
  };

  const prev = () =>
    session && setSession({ ...session, idx: Math.max(0, session.idx - 1) });
  const next = () =>
    session &&
    setSession({
      ...session,
      idx: Math.min(session.steps.length - 1, session.idx + 1),
    });
  const exit = () => setSession(null);

  const atEnd = !!session && session.idx === session.steps.length - 1;

  const commit = () => {
    if (!session) return;
    setRoot(session.finalRoot);
    setSession(null);
    showToast("Đã áp dụng cân bằng.");
  };

  const caseButtons = useMemo(
    () =>
      (["LL", "RR", "LR", "RL"] as BalanceCase[]).map((c) => (
        <button
          key={c}
          onClick={() => usePreset(c)}
          disabled={!!session}
          className={[
            "rounded-2xl px-4 cursor-pointer py-2 text-sm font-extrabold transition",
            picked === c
              ? "bg-[#D4AF37] text-black"
              : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
            session ? "opacity-60" : "",
          ].join(" ")}
        >
          {c}
        </button>
      )),
    [picked, session]
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <TreeCanvasLux
        root={renderRoot}
        focusIds={step?.focusIds ?? []}
        roles={step?.roles}
        focusEdges={step?.focusEdges ?? []}
      />

      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/70 px-5 py-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="mb-2">
            <NavPills />
          </div>
          <div className="text-xs uppercase tracking-widest text-white/60">
            Balance Tutor
          </div>
          <div className="text-lg font-extrabold">
            AVL Imbalance → Rotations
          </div>
          <div className="text-sm text-white/75">
            Chọn case LL/RR/LR/RL → Start → Next từng bước.
          </div>
        </div>

        {toast && (
          <div className="w-fit rounded-2xl border border-[#D4AF37]/40 bg-[#0B1020]/80 px-4 py-3 text-sm text-white shadow backdrop-blur">
            <span className="font-bold text-[#D4AF37]">Notice:</span> {toast}
          </div>
        )}
      </div>

      {/* control panel (minimal) */}
      <div className="absolute right-6 top-6 z-30 w-[420px] max-w-[90vw] rounded-3xl border border-white/10 bg-[#0B1020]/70 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="text-sm font-extrabold">Presets</div>
        <div className="mt-3 flex flex-wrap gap-2">{caseButtons}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={startBalance}
            disabled={!!session}
            className="rounded-2xl cursor-pointer bg-white px-4 py-2.5 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
          >
            Start Balance
          </button>

          <button
            onClick={() => setDeleteOpen(true)}
            disabled={!!session}
            className="rounded-2xl cursor-pointer bg-white px-4 py-2.5 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
          >
            Delete
          </button>

          <button
            onClick={loadLastFromInsert}
            disabled={!!session}
            className="rounded-2xl  cursor-pointer border border-white/10 bg-white/5 px-4 text-sm font-bold hover:bg-white/10 disabled:opacity-60"
          >
            Load from Insert
          </button>
        </div>

        
      </div>

      <DeleteBalanceModal
        open={deleteOpen}
        disabled={!!session}
        onClose={() => setDeleteOpen(false)}
        onSubmit={startDeleteAndBalance}
      />

      <StepDock
        active={!!session}
        step={step}
        index={session?.idx ?? 0}
        total={session?.steps.length ?? 0}
        onPrev={prev}
        onNext={next}
        onCommit={commit}
        onExit={exit}
        atEnd={atEnd}
      />
    </div>
  );
}
