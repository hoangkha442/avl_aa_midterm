import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  disabled?: boolean;
  onClose: () => void;
  onSubmit: (id: string) => void;
};

export default function SearchSheet({ open, disabled, onClose, onSubmit }: Props) {
  const [id, setId] = useState("");

  useEffect(() => {
    if (open) setId("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute bottom-24 right-6 z-50 w-[420px] max-w-[90vw]">
      <div className="rounded-3xl border border-white/10 bg-[#0B1020]/90 p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.75)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Search Student</div>
            <div className="text-lg font-extrabold">Tìm theo Mã SV</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-semibold text-white/80">Mã SV</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit(id);
            }}
            placeholder='VD: SV20'
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#D4AF37]/60"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onSubmit(id)}
            disabled={disabled}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
          >
            Start Search
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10"
          >
            Cancel
          </button>
        </div>

        <div className="mt-3 text-xs text-white/55">
          Flow: compare → go left/right → ... → found / null.
        </div>
      </div>
    </div>
  );
}
