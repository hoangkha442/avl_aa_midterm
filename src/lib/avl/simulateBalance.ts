import type { AvlCase, AvlNode, TutorStep } from "./types";
import { cloneNode } from "./clone";
import { getBF, recomputeHeights } from "./height";

export type BalanceCase = AvlCase;
type Dir = "L" | "R";

function rotateLeft(x: AvlNode): AvlNode {
  const y = x.right!;
  const t2 = y.left;
  y.left = x;
  x.right = t2;
  return y;
}
function rotateRight(y: AvlNode): AvlNode {
  const x = y.left!;
  const t2 = x.right;
  x.right = y;
  y.left = t2;
  return x;
}

function pathTo(root: AvlNode | null, id: string) {
  const path: AvlNode[] = [];
  const dirs: Dir[] = [];
  let cur = root;

  const cmp = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

  while (cur) {
    path.push(cur);
    if (cur.id === id) return { path, dirs };
    if (cmp(id, cur.id) < 0) {
      dirs.push("L");
      cur = cur.left;
    } else {
      dirs.push("R");
      cur = cur.right;
    }
  }
  return null;
}

function reconnect(rootRef: { root: AvlNode | null }, path: AvlNode[], dirs: Dir[], zIndex: number, newSub: AvlNode) {
  if (zIndex === 0) rootRef.root = newSub;
  else {
    const parent = path[zIndex - 1];
    const d = dirs[zIndex - 1];
    if (d === "L") parent.left = newSub;
    else parent.right = newSub;
  }
  path[zIndex] = newSub;
}

function deepestImbalance(root: AvlNode | null): string | null {
  let bestId: string | null = null;
  let bestDepth = -1;

  const dfs: (n: AvlNode | null, depth: number) => void = (n, depth) => {
    if (!n) return;

    dfs(n.left, depth + 1);
    dfs(n.right, depth + 1);

    const b = getBF(n);
    if (Math.abs(b) > 1 && depth > bestDepth) {
      bestDepth = depth;
      bestId = n.id;
    }
  };

  dfs(root, 0);
  return bestId;
}


// function deepestImbalance(root: AvlNode | null) {
//   let best: { id: string; depth: number } | null = null;

//   function dfs(n: AvlNode | null, depth: number) {
//     if (!n) return;
//     dfs(n.left, depth + 1);
//     dfs(n.right, depth + 1);
//     const b = n ? getBF(n) : 0;
//     if (Math.abs(b) > 1) {
//       if (!best || depth > best.depth) best = { id: n.id, depth };
//     }
//   }

//   dfs(root, 0);
//   return best?.id ?? null;
// }

export function simulateBalanceWithTutorSteps(root: AvlNode | null) {
  const rootRef = { root: cloneNode(root) };
  const steps: TutorStep[] = [];
  const snap = () => cloneNode(rootRef.root);
  const push = (x: Omit<TutorStep, "snapshot">) => steps.push({ ...x, snapshot: snap() });

  rootRef.root = recomputeHeights(rootRef.root);

  if (!rootRef.root) {
    push({ title: "Cây rỗng", detail: "Không có gì để cân bằng.", focusIds: [], compareText: "EMPTY" });
    return { steps, finalRoot: rootRef.root, ok: true };
  }

  const zId = deepestImbalance(rootRef.root);
  if (!zId) {
    push({
      title: "Không mất cân bằng",
      detail: "Cây hiện tại đã cân bằng (|bf| ≤ 1).",
      focusIds: [],
      compareText: "Already balanced",
    });
    return { steps, finalRoot: rootRef.root, ok: true };
  }

  const zPath = pathTo(rootRef.root, zId);
  if (!zPath) {
    push({ title: "Lỗi", detail: "Không tìm được node mất cân bằng.", focusIds: [], compareText: "Error" });
    return { steps, finalRoot: rootRef.root, ok: false };
  }

  const zIndex = zPath.path.length - 1;
  const z = zPath.path[zIndex];
  rootRef.root = recomputeHeights(rootRef.root);

  const bfZ = getBF(z);
  push({
    title: "Chọn node mất cân bằng (Z)",
    detail: `Node Z là node có |bf| > 1.`,
    focusIds: [z.id],
    roles: { [z.id]: "Z" },
    compareText: `Z=${z.id} | bf(Z)=${bfZ}`,
  });

  const leftHeavy = bfZ > 1;
  const y = leftHeavy ? z.left : z.right;
  if (!y) {
    push({ title: "Lỗi", detail: "Thiếu node con Y.", focusIds: [z.id], roles: { [z.id]: "Z" } });
    return { steps, finalRoot: rootRef.root, ok: false };
  }

  rootRef.root = recomputeHeights(rootRef.root);
  const bfY = getBF(y);

  push({
    title: "Chọn Y (child của Z theo phía nặng)",
    detail: `Nếu bf(Z)>1 => Y=Z.left, nếu bf(Z)<-1 => Y=Z.right.`,
    focusIds: [z.id, y.id],
    roles: { [z.id]: "Z", [y.id]: "Y" },
    compareText: `bf(Z)=${bfZ} ⇒ Y=${y.id} | bf(Y)=${bfY}`,
  });

  let caze: AvlCase;
  if (leftHeavy) caze = bfY >= 0 ? "LL" : "LR";
  else caze = bfY <= 0 ? "RR" : "RL";

  const x =
    caze === "LL" ? y.left :
    caze === "RR" ? y.right :
    caze === "LR" ? y.right :
    y.left;

  const roles: Record<string, "Z" | "Y" | "X"> = { [z.id]: "Z", [y.id]: "Y" };
  if (x) roles[x.id] = "X";

  push({
    title: "Xác định case (LL/RR/LR/RL)",
    detail: "Dựa vào bf(Z) và bf(Y) để phân loại.",
    focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
    roles,
    avlCase: caze,
    compareText: `Case=${caze} (bfZ=${bfZ}, bfY=${bfY})`,
  });

  // Rotation steps: show BEFORE and AFTER clearly
  if (caze === "LL") {
    push({
      title: "Chuẩn bị quay (LL)",
      detail: "LL => 1 lần RightRotate tại Z.",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Z)",
    });

    const newSub = rotateRight(z);
    reconnect(rootRef, zPath.path, zPath.dirs, zIndex, newSub);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau quay (LL)",
      detail: "Đã RightRotate(Z). Subtree cân bằng hơn.",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Z) DONE",
    });
  }

  if (caze === "RR") {
    push({
      title: "Chuẩn bị quay (RR)",
      detail: "RR => 1 lần LeftRotate tại Z.",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Z)",
    });

    const newSub = rotateLeft(z);
    reconnect(rootRef, zPath.path, zPath.dirs, zIndex, newSub);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau quay (RR)",
      detail: "Đã LeftRotate(Z).",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Z) DONE",
    });
  }

  if (caze === "LR") {
    push({
      title: "Chuẩn bị quay (LR)",
      detail: "LR => LeftRotate(Y) rồi RightRotate(Z).",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Y) -> RightRotate(Z)",
    });

    // step 1
    const yNow = z.left!;
    push({
      title: "Trước bước 1",
      detail: "Bước 1: LeftRotate(Y).",
      focusIds: [yNow.id, z.id],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Y)",
    });

    z.left = rotateLeft(yNow);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau bước 1",
      detail: "Đã LeftRotate(Y). Chuẩn bị RightRotate(Z).",
      focusIds: [z.id, yNow.id],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Y) DONE",
    });

    // step 2
    push({
      title: "Trước bước 2",
      detail: "Bước 2: RightRotate(Z).",
      focusIds: [z.id],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Z)",
    });

    const newSub = rotateRight(z);
    reconnect(rootRef, zPath.path, zPath.dirs, zIndex, newSub);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau bước 2",
      detail: "Đã RightRotate(Z).",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Z) DONE",
    });
  }

  if (caze === "RL") {
    push({
      title: "Chuẩn bị quay (RL)",
      detail: "RL => RightRotate(Y) rồi LeftRotate(Z).",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Y) -> LeftRotate(Z)",
    });

    // step 1
    const yNow = z.right!;
    push({
      title: "Trước bước 1",
      detail: "Bước 1: RightRotate(Y).",
      focusIds: [yNow.id, z.id],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Y)",
    });

    z.right = rotateRight(yNow);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau bước 1",
      detail: "Đã RightRotate(Y). Chuẩn bị LeftRotate(Z).",
      focusIds: [z.id, yNow.id],
      roles,
      avlCase: caze,
      rotationHint: "RightRotate(Y) DONE",
    });

    // step 2
    push({
      title: "Trước bước 2",
      detail: "Bước 2: LeftRotate(Z).",
      focusIds: [z.id],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Z)",
    });

    const newSub = rotateLeft(z);
    reconnect(rootRef, zPath.path, zPath.dirs, zIndex, newSub);
    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Sau bước 2",
      detail: "Đã LeftRotate(Z).",
      focusIds: [z.id, y.id, ...(x ? [x.id] : [])],
      roles,
      avlCase: caze,
      rotationHint: "LeftRotate(Z) DONE",
    });
  }

  push({
    title: "Hoàn tất cân bằng",
    detail: "Subtree đã được xoay đúng case. Kiểm tra lại bf trên các node liên quan.",
    focusIds: Object.keys(roles),
    roles,
    avlCase: caze,
    compareText: "Balanced  ",
  });

  return { steps, finalRoot: rootRef.root, ok: true };
}

// Presets tạo mất cân bằng đúng 4 case (BST insert order)
export function buildUnbalancedPreset(caseKey: BalanceCase): AvlNode | null {
  const mk = (id: string) => ({
    id,
    name: `Student ${id}`,
    gpa: Number((Math.random() * 4 + 6).toFixed(1)),
  });

  const orders: Record<BalanceCase, string[]> = {
    LL: ["SV30", "SV20", "SV10"],
    RR: ["SV10", "SV20", "SV30"],
    LR: ["SV30", "SV10", "SV20"],
    RL: ["SV10", "SV30", "SV20"],
  };

  const list = orders[caseKey].map(mk);

  let root: AvlNode | null = null;
  const cmp = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

  for (const s of list) {
    if (!root) {
      root = { ...s, height: 1, left: null, right: null };
      continue;
    }
    let cur = root;
    while (true) {
      const c = cmp(s.id, cur.id);
      if (c < 0) {
        if (!cur.left) {
          cur.left = { ...s, height: 1, left: null, right: null };
          break;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = { ...s, height: 1, left: null, right: null };
          break;
        }
        cur = cur.right;
      }
    }
  }

  return recomputeHeights(root);
}
