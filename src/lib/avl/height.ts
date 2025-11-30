import type { AvlNode } from "./types";

export function recomputeHeights(root: AvlNode | null): AvlNode | null {
  function dfs(n: AvlNode | null): number {
    if (!n) return 0;
    const hl = dfs(n.left);
    const hr = dfs(n.right);
    n.height = Math.max(hl, hr) + 1;
    return n.height;
  }
  dfs(root);
  return root;
}

export function getBF(n: AvlNode) {
  const hl = n.left ? n.left.height : 0;
  const hr = n.right ? n.right.height : 0;
  return hl - hr;
}
