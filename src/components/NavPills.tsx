import { NavLink } from "react-router-dom";

export default function NavPills() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-2xl px-4 py-2 text-sm font-bold transition",
      isActive
        ? "bg-[#D4AF37] text-black"
        : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    ].join(" ");

  return (
    <div className="flex gap-2">
      <NavLink to="/insert" className={cls}>
        Insert (BST)
      </NavLink>
      <NavLink to="/balance" className={cls}>
        Balance (AVL)
      </NavLink>
    </div>
  );
}
