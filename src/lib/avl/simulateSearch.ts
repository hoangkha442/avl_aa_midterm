import type { AvlNode, CompareDir, TutorStep } from "./types";
import { cloneNode } from "./clone";

function cmp(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function simulateSearchWithTutorSteps(root: AvlNode | null, idRaw: string) {
  const steps: TutorStep[] = [];
  const id = idRaw.trim();

  // snapshot luôn là cây hiện tại (không đổi)
  const frozen = cloneNode(root);
  const snap = () => cloneNode(frozen);
  const push = (x: Omit<TutorStep, "snapshot">) => steps.push({ ...x, snapshot: snap() });

  const pathEdges: string[] = []; // "A->B"
  const edgeList = () => Array.from(new Set(pathEdges));

  push({
    title: "Bắt đầu tìm kiếm",
    detail: `Tìm sinh viên theo Mã SV = "${id}".`,
    focusIds: [],
    focusEdges: [],
    compareText: `Search key: ${id || "(rỗng)"}`,
  });

  if (!id) {
    push({
      title: "Dữ liệu không hợp lệ",
      detail: "Mã SV rỗng → không thể tìm.",
      focusIds: [],
      focusEdges: [],
      compareText: "Invalid ID",
    });
    return { steps, foundId: null };
  }

  if (!root) {
    push({
      title: "Cây rỗng",
      detail: "Không có node nào để so sánh.",
      focusIds: [],
      focusEdges: [],
      compareText: "Not found",
    });
    return { steps, foundId: null };
  }

  let cur: AvlNode | null = root;

  while (cur) {
    const c = cmp(id, cur.id);
    const dir: CompareDir = c < 0 ? "L" : "R";
    const sign = c < 0 ? "<" : c > 0 ? ">" : "=";

    push({
      title: "So sánh",
      detail: "So sánh mã cần tìm với node hiện tại",
      focusIds: [],
      focusEdges: edgeList(),
      compareText: `${id} ${sign} ${cur.id}`,
    });

    if (c === 0) {
      push({
        title: "Tìm thấy",
        detail: `Sinh viên: ${cur.id} — ${cur.name} — GPA ${cur.gpa}`,
        focusIds: [],
        focusEdges: edgeList(),
        compareText: "FOUND",
      });
      return { steps, foundId: cur.id };
    }

    //   FIX: đặt type rõ + đổiENAME để TS khỏi báo implicit any
    const nextNode: AvlNode | null = dir === "L" ? cur.left : cur.right;

    push({
      title: "Di chuyển theo hướng",
      detail: `${id} ${c < 0 ? "nhỏ hơn" : "lớn hơn"} ${cur.id} → đi ${dir === "L" ? "LEFT" : "RIGHT"}.`,
      focusIds: [],
      focusEdges: edgeList(),
      compareText: `Go ${dir === "L" ? "LEFT" : "RIGHT"}`,
    });

    if (!nextNode) {
      push({
        title: "Gặp null",
        detail: `Nhánh tiếp theo là null → không tồn tại mã "${id}" trong cây.`,
        focusIds: [],
        focusEdges: edgeList(),
        compareText: "Not found",
      });
      return { steps, foundId: null };
    }

    //   chỉ khi thật sự đi sang node con thì mới thêm edge
    pathEdges.push(`${cur.id}->${nextNode.id}`);
    cur = nextNode;
  }

  push({
    title: "Kết thúc",
    detail: `Không tìm thấy mã "${id}".`,
    focusIds: [],
    focusEdges: edgeList(),
    compareText: "Not found",
  });

  return { steps, foundId: null };
}
