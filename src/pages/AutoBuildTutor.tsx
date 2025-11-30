import { useEffect, useMemo, useState } from "react";
import TreeCanvasLux from "../components/TreeCanvasLux";
import StepDock from "../components/StepDock";
import NavPills from "../components/NavPills";
import AutoBuildModal from "../components/AutoBuildModal";
import type { AvlNode, TutorStep } from "../lib/avl/types";
import { simulateAutoBuildFromNumbers } from "../lib/avl/simulateAutoBuild";

export default function AutoBuildTutor() {
  const [root, setRoot] = useState<AvlNode | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // wizard
  const [open, setOpen] = useState(true);
  const [stage, setStage] = useState<"count" | "values">("count");
  const [count, setCount] = useState(7);
  const [values, setValues] = useState<string[]>(() => Array.from({ length: 7 }, () => ""));

  // numbers list for UI (parsed)
  const [nums, setNums] = useState<number[]>([]);

  // tutorial session
  const [session, setSession] = useState<{
    steps: TutorStep[];
    idx: number;
    finalRoot: AvlNode | null;
  } | null>(null);

  // autoplay
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(650); // nhanh/chậm tùy bạn

  const step = session?.steps[session.idx];
  const renderRoot = session ? (step?.snapshot ?? root) : root;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2100);
  };

  const onCountChange = (n: number) => {
    setCount(n);
    setValues(Array.from({ length: n }, () => ""));
  };

  const onValueChange = (idx: number, val: string) => {
    setValues((arr) => {
      const next = [...arr];
      next[idx] = val;
      return next;
    });
  };

  const start = () => {
    const parsed: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const raw = values[i].trim();
      if (!raw) return showToast(`Ô #${i + 1} đang trống`);
      const v = Number(raw);
      if (!Number.isFinite(v)) return showToast(`Ô #${i + 1} không hợp lệ`);
      parsed.push(Math.trunc(v));
    }

    const sim = simulateAutoBuildFromNumbers(parsed);
    setNums(parsed);
    setSession({ steps: sim.steps, idx: 0, finalRoot: sim.finalRoot });
    setOpen(false);

    // ✅ auto-run ngay, user chỉ cần pause/play
    setPlaying(true);
  };

  // ✅ autoplay engine
  useEffect(() => {
    if (!session || !playing) return;

    if (session.idx >= session.steps.length - 1) {
      setPlaying(false);
      return;
    }

    const t = window.setTimeout(() => {
      setSession((s) => {
        if (!s) return s;
        const nextIdx = Math.min(s.steps.length - 1, s.idx + 1);
        return { ...s, idx: nextIdx };
      });
    }, speedMs);

    return () => window.clearTimeout(t);
  }, [session, playing, speedMs]);

  const prev = () => {
    if (!session) return;
    setPlaying(false);
    setSession({ ...session, idx: Math.max(0, session.idx - 1) });
  };

  const next = () => {
    if (!session) return;
    setPlaying(false);
    setSession({ ...session, idx: Math.min(session.steps.length - 1, session.idx + 1) });
  };

  const exit = () => {
    setPlaying(false);
    setSession(null);
  };

  const atEnd = !!session && session.idx === session.steps.length - 1;

  const commit = () => {
    if (!session) return;
    setRoot(session.finalRoot);
    setSession(null);
    setPlaying(false);
    showToast("Đã áp dụng cây vừa build.");
  };

  const currentBatch = useMemo(() => {
    if (!session) return -1;
    const bi = step?.batchIndex;
    if (typeof bi === "number") return bi;
    return -1;
  }, [session, step?.batchIndex]);

  const progressText = useMemo(() => {
    if (!session) return root ? "Bạn có thể Auto Build lại." : "Chưa có cây. Bấm Auto Build để bắt đầu.";
    const bi = typeof step?.batchIndex === "number" ? step.batchIndex : 0;
    const shown = Math.min(nums.length, bi + 1);
    return `Đang chạy tự động: ${shown}/${nums.length} (Play/Pause).`;
  }, [session, step?.batchIndex, nums.length, root]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <TreeCanvasLux
        root={renderRoot}
        focusIds={step?.focusIds ?? []}
        focusEdges={step?.focusEdges ?? []}
        roles={step?.roles}
        ghost={step?.ghost}
        ghostMode={step?.ghostMode}
        ghostTargetId={step?.ghostTargetId}
        ghostDirHint={step?.ghostDirHint}
      />

      {/* Left top header */}
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/70 px-5 py-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="mb-2">
            <NavPills />
          </div>
          <div className="text-xs uppercase tracking-widest text-white/60">Auto Build</div>
          <div className="text-lg font-extrabold">Nhập n số → Dựng cây AVL (Auto run)</div>
          <div className="text-sm text-white/75">{progressText}</div>
        </div>

        {toast && (
          <div className="w-fit rounded-2xl border border-[#D4AF37]/40 bg-[#0B1020]/80 px-4 py-3 text-sm text-white shadow backdrop-blur">
            <span className="font-bold text-[#D4AF37]">Notice:</span> {toast}
          </div>
        )}
      </div>

      {/* Right panel: list numbers + play/pause */}
      <div className="absolute right-14 top-30 z-30 w-[360px] max-w-[90vw] rounded-3xl border border-white/10 bg-[#0B1020]/70 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold">Danh sách số</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!session) return;
                if (atEnd) {
                  setSession({ ...session, idx: 0 });
                  setPlaying(true);
                } else setPlaying((p) => !p);
              }}
              disabled={!session}
              className="rounded-2xl bg-[#D4AF37] px-3 py-2 text-xs font-extrabold text-black hover:brightness-110 disabled:opacity-50"
            >
              {playing ? "Pause" : "Play"}
            </button>

            <button
              onClick={() => {
                if (!session) return;
                setPlaying(false);
                setSession({ ...session, idx: 0 });
              }}
              disabled={!session}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-50"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-white/60">Speed</div>
          <input
            type="range"
            min={250}
            max={1200}
            step={50}
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            disabled={!session}
            className="mt-2 w-full accent-[#D4AF37] disabled:opacity-50"
          />
          <div className="mt-1 text-[11px] text-white/60">{speedMs} ms/step</div>
        </div>

        <div className="mt-3 max-h-[46vh] overflow-auto rounded-2xl border border-white/10 bg-white/5 p-2">
          <div className="flex flex-wrap gap-2">
            {nums.length === 0 && (
              <div className="px-2 py-2 text-sm text-white/60">Chưa có danh sách (hãy Auto Build).</div>
            )}

            {nums.map((v, i) => {
              const done = session ? i < currentBatch : false;
              const cur = session ? i === currentBatch : false;

              const cls = done
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : cur
                ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white"
                : "border-white/10 bg-[#0C1426] text-white/80";

              return (
                <div
                  key={`${v}-${i}`}
                  className={`rounded-2xl border px-3 py-2 text-sm font-extrabold ${cls}`}
                  title={done ? "Đã xong" : cur ? "Đang chạy" : "Chưa chạy"}
                >
                  <span className="text-[11px] font-black opacity-70">#{i + 1}</span>{" "}
                  <span className="ml-1">{v}</span>
                  <span className="ml-2 text-[11px] opacity-70">
                    {done ? "✓" : cur ? "●" : "…"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            if (session) return;
            setStage("count");
            setOpen(true);
          }}
          disabled={!!session}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 disabled:opacity-50"
        >
          Nhập lại
        </button>
      </div>

      <AutoBuildModal
        open={open}
        stage={stage}
        disabled={!!session}
        count={count}
        onCountChange={onCountChange}
        values={values}
        onValueChange={onValueChange}
        onBack={() => setStage("count")}
        onNext={() => setStage("values")}
        onStart={start}
        onClose={() => setOpen(false)}
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
