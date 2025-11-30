import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  disabled?: boolean;
  onClose: () => void;
  onSubmit: (id: string) => void;
};

export default function DeleteBalanceModal({ open, disabled, onClose, onSubmit }: Props) {
  const [id, setId] = useState("");

  useEffect(() => {
    if (open) setId("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-80">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[520px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[26px] border border-white/10 bg-[#0B1020]/92 p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/60">
                Delete + Auto Balance
              </div>
              <div className="text-xl font-extrabold">Xóa sinh viên</div>
              <div className="mt-1 text-sm text-white/70">
                Nhập <span className="font-bold text-[#D4AF37]">Mã SV</span> → xóa → tự chạy balance cho tới khi cân bằng.
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-semibold text-white/85">Mã SV</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit(id);
              }}
              placeholder="VD: SV20"
              disabled={disabled}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#D4AF37]/60 disabled:opacity-60"
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => onSubmit(id)}
              disabled={disabled}
              className="flex-1 rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Cancel
            </button>
          </div>

          <div className="mt-3 text-xs text-white/55">
            Tip: chạy tutorial xong hãy bấm <b>Commit</b> để áp dụng vào cây hiện tại.
          </div>
        </div>
      </div>
    </div>
  );
}
