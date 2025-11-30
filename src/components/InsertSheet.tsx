import { useState } from "react";
import type { Student } from "../lib/avl/types";

type Props = {
  open: boolean;
  disabled?: boolean;
  onClose: () => void;
  onSubmit: (s: Student) => void;
};

export default function InsertSheet({ open, disabled, onClose, onSubmit }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [gpa, setGpa] = useState<number>(8.0);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute bottom-6 left-1/2 w-[520px] max-w-[92vw] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold">Add Student</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div>
            <div className="mb-1 text-sm text-white/70">Mã SV</div>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-[#D4AF37]/20"
              placeholder="VD: SV12"
              disabled={disabled}
            />
          </div>

          <div>
            <div className="mb-1 text-sm text-white/70">Họ tên</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-[#D4AF37]/20"
              placeholder="VD: Nguyễn Văn A"
              disabled={disabled}
            />
          </div>

          <div>
            <div className="mb-1 text-sm text-white/70">Điểm TB (0..10)</div>
            <input
              type="number"
              value={gpa}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => setGpa(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-[#D4AF37]/20"
              disabled={disabled}
            />
          </div>

          <button
            onClick={() => onSubmit({ id, name, gpa })}
            disabled={disabled}
            className="mt-1 rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
          >
            Start Insert Tutorial
          </button>

          <div className="text-xs text-white/55">
            Bạn sẽ tự bấm Next để xem: so sánh → di chuyển → gặp null → gắn node → cân bằng.
          </div>
        </div>
      </div>
    </div>
  );
}
