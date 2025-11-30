import type { AvlNode } from "./types";

export function cloneNode(n: AvlNode | null): AvlNode | null {
  if (!n) return null;
  return {
    id: n.id,
    name: n.name,
    gpa: n.gpa,
    height: n.height,
    left: cloneNode(n.left),
    right: cloneNode(n.right),
  };
}
