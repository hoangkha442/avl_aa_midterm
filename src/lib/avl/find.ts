import type { AvlNode } from "./types";

function cmp(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function findNode(root: AvlNode | null, id: string): AvlNode | null {
  let cur = root;
  const key = id.trim();
  while (cur) {
    const c = cmp(key, cur.id);
    if (c === 0) return cur;
    cur = c < 0 ? cur.left : cur.right;
  }
  return null;
}
