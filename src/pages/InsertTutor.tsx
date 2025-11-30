import { useState } from "react";
import TreeCanvasLux from "../components/TreeCanvasLux";
import InsertSheet from "../components/InsertSheet";
import StepDock from "../components/StepDock";
import NavPills from "../components/NavPills";
import type { AvlNode, Student, TutorStep } from "../lib/avl/types";
import { seedStudents } from "../data/seedStudents";
import { findNode } from "../lib/avl/find";
import { insertBST, simulateInsertWithTutorSteps } from "../lib/avl/simulateInsert";

import { simulateSearchWithTutorSteps } from "../lib/avl/simulateSearch";
import SearchSheet from "../lib/avl/SearchSheet";

const LS_KEY = "bst_tree_latest";

function buildInitialTree(seed: Student[]) {
  let root: AvlNode | null = null;
  for (const s of seed) root = insertBST(root, s);
  return root;
}

export default function InsertTutor() {
  const [root, setRoot] = useState<AvlNode | null>(() => buildInitialTree(seedStudents));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

const startSearch = (id: string) => {
  const sim = simulateSearchWithTutorSteps(root, id);
  setSession({
    steps: sim.steps,
    idx: 0,
    finalRoot: root,    
    mode: "search",
  } as any);
  setSearchOpen(false);
};
 const [session, setSession] = useState<{
  steps: TutorStep[];
  idx: number;
  finalRoot: AvlNode | null;
  mode: "insert" | "search";
} | null>(null);


  const step = session?.steps[session.idx];
  const renderRoot = session ? (step?.snapshot ?? root) : root;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const startTutorial = (s: Student) => {
    const id = s.id.trim();
    const name = s.name.trim();
    const gpa = Number(s.gpa);

    if (!id) return showToast("Mã SV không được rỗng");
    if (!name) return showToast("Họ tên không được rỗng");
    if (Number.isNaN(gpa) || gpa < 0 || gpa > 10) return showToast("Điểm TB phải trong [0..10]");
    if (findNode(root, id)) return showToast("Mã SV đã tồn tại");

    const sim = simulateInsertWithTutorSteps(root, { id, name, gpa });
    setSession({ steps: sim.steps, idx: 0, finalRoot: sim.finalRoot, mode: "insert" });
    setSheetOpen(false);
  };

  const prev = () => session && setSession({ ...session, idx: Math.max(0, session.idx - 1) });
  const next = () =>
    session && setSession({ ...session, idx: Math.min(session.steps.length - 1, session.idx + 1) });
  const exit = () => setSession(null);

  const commit = () => {
    if (!session || session.mode !== "insert") return;
    setRoot(session.finalRoot);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(session.finalRoot));
    } catch {}
    setSession(null);
    showToast("Đã áp dụng vào cây (BST).");
  };

 const atEnd = !!session && session.mode === "insert" && session.idx === session.steps.length - 1;


  
  return (
    <div className="relative h-full w-full overflow-hidden">
      <TreeCanvasLux
        root={renderRoot}
        focusIds={step?.focusIds ?? []}
        focusEdges={step?.focusEdges ?? []}
        ghost={step?.ghost}
        ghostMode={step?.ghostMode}
        ghostTargetId={step?.ghostTargetId}
        ghostDirHint={step?.ghostDirHint}
      />

      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/70 px-5 py-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="mb-2">
            <NavPills />
          </div>
          <div className="text-xs uppercase tracking-widest text-white/60">Insert Tutor</div>
          <div className="text-lg font-extrabold">BST Insert (no balancing)</div>
          <div className="text-sm text-white/75">
            Ghost chưa nối → so sánh → đi tiếp → gặp null → attach.
          </div>
        </div>

        {toast && (
          <div className="w-fit rounded-2xl border border-[#D4AF37]/40 bg-[#0B1020]/80 px-4 py-3 text-sm text-white shadow backdrop-blur">
            <span className="font-bold text-[#D4AF37]">Notice:</span> {toast}
          </div>
        )}
      </div>

      {/* ONLY ADD BUTTON */}
      <button
        onClick={() => setSheetOpen(true)}
        disabled={!!session}
        className="absolute cursor-pointer bottom-6 right-6 z-40 rounded-full bg-[#D4AF37] px-6 py-4 text-sm font-extrabold text-black shadow-[0_25px_70px_rgba(0,0,0,0.75)] hover:brightness-110 disabled:opacity-50"
      >
        + Add
      </button>

      <InsertSheet
        open={sheetOpen}
        disabled={!!session}
        onClose={() => setSheetOpen(false)}
        onSubmit={startTutorial}
      />
      <button
  onClick={() => setSearchOpen(true)}
  disabled={!!session}
  className="absolute cursor-pointer bottom-6 right-[140px] z-40 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-extrabold text-white shadow-[0_25px_70px_rgba(0,0,0,0.6)] hover:bg-white/10 disabled:opacity-50"
>
  Search 
</button>

<SearchSheet
  open={searchOpen}
  disabled={!!session}
  onClose={() => setSearchOpen(false)}
  onSubmit={startSearch}
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
