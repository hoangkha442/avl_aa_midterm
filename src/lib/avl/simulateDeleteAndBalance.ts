import type { AvlNode, TutorStep } from "./types";
import { cloneNode } from "./clone";
import { recomputeHeights, getBF } from "./height";
import { simulateBalanceWithTutorSteps } from "./simulateBalance";

type Dir = "L" | "R";

function cmp(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
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

/**
 * Delete (BST delete by id) rồi auto balance bằng simulateBalanceWithTutorSteps (có thể chạy nhiều lượt)
 * focusEdges: chỉ tô đường đi
 * focusIds: chỉ tô node quan trọng (node bị xóa, successor,...)
 */
export function simulateDeleteThenBalanceWithTutorSteps(root: AvlNode | null, idRaw: string) {
  const rootRef = { root: cloneNode(root) };
  const steps: TutorStep[] = [];
  const snap = () => cloneNode(rootRef.root);
  const push = (x: Omit<TutorStep, "snapshot">) => steps.push({ ...x, snapshot: snap() });

  const id = idRaw.trim();
  const pathEdges: string[] = [];
  const edgeList = () => Array.from(new Set(pathEdges));

  push({
    title: "Bắt đầu xóa",
    detail: `Xóa sinh viên theo Mã SV = "${id}".`,
    focusIds: [],
    focusEdges: [],
    compareText: `Delete key: ${id || "(rỗng)"}`,
  });

  if (!id) {
    push({
      title: "Dữ liệu không hợp lệ",
      detail: "Mã SV rỗng → không thể xóa.",
      focusIds: [],
      focusEdges: [],
      compareText: "Invalid ID",
    });
    return { steps, finalRoot: rootRef.root, ok: false };
  }

  if (!rootRef.root) {
    push({
      title: "Cây rỗng",
      detail: "Không có gì để xóa.",
      focusIds: [],
      focusEdges: [],
      compareText: "EMPTY",
    });
    return { steps, finalRoot: rootRef.root, ok: false };
  }

  // 1) Tìm node cần xóa (iterative)
  let parent: AvlNode | null = null;
  let parentDir: Dir | null = null;
  let cur: AvlNode | null = rootRef.root;

  while (cur && cur.id !== id) {
    const c = cmp(id, cur.id);
    const dir: Dir = c < 0 ? "L" : "R";
    const sign = c < 0 ? "<" : c > 0 ? ">" : "=";

    push({
      title: "So sánh",
      detail: "So sánh để đi trái/phải (chỉ tô đường đi).",
      focusIds: [],
      focusEdges: edgeList(),
      compareText: `${id} ${sign} ${cur.id} → ${dir === "L" ? "LEFT" : "RIGHT"}`,
    });

    const nextNode: AvlNode | null = dir === "L" ? cur.left : cur.right;

    push({
      title: "Di chuyển",
      detail: `Đi ${dir === "L" ? "LEFT" : "RIGHT"}...`,
      focusIds: [],
      focusEdges: edgeList(),
      compareText: `Go ${dir === "L" ? "LEFT" : "RIGHT"}`,
    });

    if (!nextNode) {
      push({
        title: "Không tìm thấy",
        detail: `Gặp null → không tồn tại "${id}" trong cây.`,
        focusIds: [],
        focusEdges: edgeList(),
        compareText: "Not found",
      });
      return { steps, finalRoot: rootRef.root, ok: false };
    }

    pathEdges.push(`${cur.id}->${nextNode.id}`);
    parent = cur;
    parentDir = dir;
    cur = nextNode;
  }

  if (!cur) {
    push({
      title: "Không tìm thấy",
      detail: `Không tồn tại "${id}".`,
      focusIds: [],
      focusEdges: edgeList(),
      compareText: "Not found",
    });
    return { steps, finalRoot: rootRef.root, ok: false };
  }

  // Found
  push({
    title: "Tìm thấy node cần xóa",
    detail: `Node = ${cur.id} (${cur.name}, GPA ${cur.gpa}).`,
    focusIds: [cur.id],
    focusEdges: edgeList(),
    compareText: "FOUND",
  });

  // 2) Xóa theo 3 case
  const hasL = !!cur.left;
  const hasR = !!cur.right;

  // Case A: leaf
  if (!hasL && !hasR) {
    push({
      title: "Case: Leaf",
      detail: "Node không có con → cắt khỏi cây.",
      focusIds: [cur.id],
      focusEdges: edgeList(),
      compareText: "Leaf delete",
    });

    if (!parent) rootRef.root = null;
    else if (parentDir === "L") parent.left = null;
    else parent.right = null;

    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Xóa xong",
      detail: `Đã xóa ${id}.`,
      focusIds: [],
      focusEdges: edgeList(),
      compareText: "Deleted",
    });
  }
  // Case B: one child
  else if (hasL !== hasR) {
    const child = cur.left ?? cur.right!;
    push({
      title: "Case: 1 child",
      detail: "Node có đúng 1 con → nối thẳng con lên thay.",
      focusIds: [cur.id, child.id],
      focusEdges: edgeList(),
      compareText: `Replace with ${child.id}`,
    });

    if (!parent) rootRef.root = child;
    else if (parentDir === "L") parent.left = child;
    else parent.right = child;

    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Xóa xong",
      detail: `Đã xóa ${id}.`,
      focusIds: [child.id],
      focusEdges: edgeList(),
      compareText: "Deleted",
    });
  }
  // Case C: two children
  else {
    push({
      title: "Case: 2 children",
      detail: "Node có 2 con → tìm Inorder Successor (min của subtree phải) để thay.",
      focusIds: [cur.id, cur.right!.id],
      focusEdges: edgeList(),
      compareText: "Find successor",
    });

    // find successor = min in right subtree
    let succParent: AvlNode = cur;
    let succ: AvlNode = cur.right!;
    // đi xuống left cho tới min
    while (succ.left) {
      pathEdges.push(`${succ.id}->${succ.left.id}`);
      succParent = succ;
      succ = succ.left;

      push({
        title: "Đi tìm successor",
        detail: "Successor = node nhỏ nhất bên phải → đi LEFT liên tục.",
        focusIds: [],
        focusEdges: edgeList(),
        compareText: `Move to ${succ.id}`,
      });
    }

    push({
      title: "Đã tìm thấy successor",
      detail: `Successor = ${succ.id} (${succ.name}, GPA ${succ.gpa}).`,
      focusIds: [cur.id, succ.id],
      focusEdges: edgeList(),
      compareText: "Successor found",
    });

    // Detach successor from its old position (succ has no left)
    // if succParent == cur => successor is cur.right
    if (succParent === cur) {
      cur.right = succ.right; // lift successor.right up
    } else {
      succParent.left = succ.right; // lift successor.right up
    }

    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Tách successor khỏi vị trí cũ",
      detail: "Successor đã được gỡ khỏi subtree phải (không tạo trùng ID).",
      focusIds: [succ.id],
      focusEdges: edgeList(),
      compareText: "Detach successor",
    });

    // Put successor into cur's position
    succ.left = cur.left;
    succ.right = cur.right; // cur.right đã được update ở bước detach

    if (!parent) rootRef.root = succ;
    else if (parentDir === "L") parent.left = succ;
    else parent.right = succ;

    rootRef.root = recomputeHeights(rootRef.root);

    push({
      title: "Thay node bị xóa bằng successor",
      detail: `Đã thay ${id} bằng ${succ.id}.`,
      focusIds: [succ.id],
      focusEdges: edgeList(),
      compareText: "Replaced",
    });
  }

  // 3) Auto balance nhiều lượt cho tới khi cân bằng
  push({
    title: "Bắt đầu cân bằng sau khi xóa",
    detail: "Chạy rotations cho tới khi |bf| ≤ 1 trên toàn cây.",
    focusIds: [],
    focusEdges: [],
    compareText: "Auto balance",
  });

  let pass = 1;
  // chặn tối đa 12 lượt để tránh loop vô hạn do dữ liệu lỗi
  while (deepestImbalance(rootRef.root) && pass <= 12) {
    const sim = simulateBalanceWithTutorSteps(rootRef.root);

    // gắn prefix để dễ nhìn
    for (const st of sim.steps) {
      steps.push({
        ...st,
        title: `Balance #${pass}: ${st.title}`,
      });
    }

    rootRef.root = sim.finalRoot;
    pass++;
  }

  push({
    title: "Hoàn tất",
    detail: "Delete + Balance hoàn tất.",
    focusIds: [],
    focusEdges: [],
    compareText: "DONE",
  });

  return { steps, finalRoot: rootRef.root, ok: true };
}
