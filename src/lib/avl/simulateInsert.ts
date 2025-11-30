// import type { AvlNode, CompareDir, Student, TutorStep } from "./types";
// import { cloneNode } from "./clone";

// function cmp(a: string, b: string) {
//   return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
// }
// function h(n: AvlNode | null) {
//   return n ? n.height : 0;
// }
// function updateHeight(n: AvlNode) {
//   n.height = Math.max(h(n.left), h(n.right)) + 1;
// }
// function bf(n: AvlNode) {
//   return h(n.left) - h(n.right);
// }

// function rotateLeft(x: AvlNode): AvlNode {
//   const y = x.right!;
//   const t2 = y.left;
//   y.left = x;
//   x.right = t2;
//   updateHeight(x);
//   updateHeight(y);
//   return y;
// }
// function rotateRight(y: AvlNode): AvlNode {
//   const x = y.left!;
//   const t2 = x.right;
//   x.right = y;
//   y.left = t2;
//   updateHeight(y);
//   updateHeight(x);
//   return x;
// }

// type Dir = "L" | "R";

// function reconnect(rootRef: { root: AvlNode | null }, path: AvlNode[], dirs: Dir[], i: number, newSub: AvlNode) {
//   if (i === 0) rootRef.root = newSub;
//   else {
//     const parent = path[i - 1];
//     const d = dirs[i - 1];
//     if (d === "L") parent.left = newSub;
//     else parent.right = newSub;
//   }
//   path[i] = newSub;
// }

// export function simulateInsertWithTutorSteps(root: AvlNode | null, student: Student) {
//   const rootRef = { root: cloneNode(root) }; // làm trên bản copy
//   const steps: TutorStep[] = [];
//   const s: Student = { ...student, id: student.id.trim(), name: student.name.trim(), gpa: Number(student.gpa) };

//   const snap = () => cloneNode(rootRef.root);

//   const push = (step: Omit<TutorStep, "snapshot">) => {
//     steps.push({ ...step, snapshot: snap() });
//   };

//   push({
//     title: "Giá trị cần thêm",
//     detail: `Chuẩn bị chèn ${s.id} (chưa nối vào cây).`,
//     focusIds: [],
//     ghost: s,
//     ghostMode: "floating",
//     compareText: `${s.id} • ${s.name} • GPA ${s.gpa}`,
//   });

//   // empty tree
//   if (!rootRef.root) {
//     push({
//       title: "Cây rỗng",
//       detail: "Không có node nào để so sánh. Node mới sẽ trở thành root.",
//       focusIds: [],
//       ghost: s,
//       ghostMode: "floating",
//       compareText: "Insert as ROOT",
//     });

//     // attach
//     rootRef.root = { ...s, height: 1, left: null, right: null };
//     push({
//       title: "Đã gắn node",
//       detail: `${s.id} đã trở thành root.`,
//       focusIds: [s.id],
//       ghost: s,
//       ghostMode: "atNode",
//       ghostTargetId: s.id,
//     });

//     return { steps, finalRoot: rootRef.root };
//   }

//   // traverse without modifying tree
//   let cur = rootRef.root;
//   const path: AvlNode[] = [];
//   const dirs: Dir[] = [];

//   while (true) {
//     // compare step (manual next)
//     const c = cmp(s.id, cur.id);
//     const dir: CompareDir = c < 0 ? "L" : "R";
//     const sign = c < 0 ? "<" : c > 0 ? ">" : "=";

//     push({
//       title: "So sánh",
//       detail: `So sánh mã SV để quyết định đi trái/phải (chưa nối đường đi).`,
//       focusIds: [cur.id],
//       ghost: s,
//       ghostMode: "atNode",
//       ghostTargetId: cur.id,
//       ghostDirHint: dir,
//       compareText: `${s.id} ${sign} ${cur.id}  → đi ${dir === "L" ? "LEFT" : dir === "R" ? "RIGHT" : ""}`,
//     });

//     if (c === 0) {
//       push({
//         title: "Trùng mã",
//         detail: `Mã ${s.id} đã tồn tại → dừng.`,
//         focusIds: [cur.id],
//         ghost: s,
//         ghostMode: "atNode",
//         ghostTargetId: cur.id,
//       });
//       // finalRoot = cây cũ
//       return { steps, finalRoot: rootRef.root };
//     }

//     // move step (still no attach)
//     push({
//       title: "Di chuyển",
//       detail: `Di chuyển tới nhánh ${dir === "L" ? "LEFT" : "RIGHT"} để tiếp tục so sánh.`,
//       focusIds: [cur.id],
//       ghost: s,
//       ghostMode: "atNode",
//       ghostTargetId: cur.id,
//       ghostDirHint: dir,
//     });

//     path.push(cur);
//     dirs.push(dir);

//     const next = dir === "L" ? cur.left : cur.right;
//     if (!next) {
//       // hit null position
//       push({
//         title: "Gặp vị trí rỗng (null)",
//         detail: `Đã đến chỗ rỗng. Sẵn sàng đặt ${s.id} vào ${dir === "L" ? "LEFT" : "RIGHT"} của ${cur.id} (vẫn chưa nối).`,
//         focusIds: [cur.id],
//         ghost: s,
//         ghostMode: "atNull",
//         ghostTargetId: cur.id,
//         ghostDirHint: dir,
//         compareText: `Ready to attach under ${cur.id} (${dir})`,
//       });

//       // attach now
//       const newNode: AvlNode = { ...s, height: 1, left: null, right: null };
//       if (dir === "L") cur.left = newNode;
//       else cur.right = newNode;

//       push({
//         title: "Đã gắn node",
//         detail: `Đã nối ${s.id} vào cây.`,
//         focusIds: [cur.id, s.id],
//         ghost: s,
//         ghostMode: "atNode",
//         ghostTargetId: s.id,
//       });

//       break;
//     }

//     cur = next;
//   }

//   // rebalance path (manual steps)
//   for (let i = path.length - 1; i >= 0; i--) {
//     const node = path[i];
//     updateHeight(node);
//     const balance = bf(node);

//     push({
//       title: "Kiểm tra cân bằng",
//       detail: `Node ${node.id}: bf = ${balance}.`,
//       focusIds: [node.id],
//       ghost: s,
//       ghostMode: "atNode",
//       ghostTargetId: node.id,
//       compareText: `bf(${node.id}) = ${balance}`,
//     });

//     if (Math.abs(balance) <= 1) continue;

//     // Left heavy
//     if (balance > 1) {
//       const L = node.left!;
//       if (bf(L) >= 0) {
//         // LL
//         const newSub = rotateRight(node);
//         reconnect(rootRef, path, dirs, i, newSub);
//         push({
//           title: "Rotate Right (LL)",
//           detail: `Quay phải tại ${node.id}.`,
//           focusIds: [node.id, newSub.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Right rotate at ${node.id}`,
//         });
//       } else {
//         // LR
//         node.left = rotateLeft(L);
//         push({
//           title: "Rotate Left (LR-1)",
//           detail: `Quay trái tại ${L.id}.`,
//           focusIds: [L.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Left rotate at ${L.id}`,
//         });

//         const newSub = rotateRight(node);
//         reconnect(rootRef, path, dirs, i, newSub);
//         push({
//           title: "Rotate Right (LR-2)",
//           detail: `Quay phải tại ${node.id}.`,
//           focusIds: [node.id, newSub.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Right rotate at ${node.id}`,
//         });
//       }
//     }

//     // Right heavy
//     if (balance < -1) {
//       const R = node.right!;
//       if (bf(R) <= 0) {
//         // RR
//         const newSub = rotateLeft(node);
//         reconnect(rootRef, path, dirs, i, newSub);
//         push({
//           title: "Rotate Left (RR)",
//           detail: `Quay trái tại ${node.id}.`,
//           focusIds: [node.id, newSub.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Left rotate at ${node.id}`,
//         });
//       } else {
//         // RL
//         node.right = rotateRight(R);
//         push({
//           title: "Rotate Right (RL-1)",
//           detail: `Quay phải tại ${R.id}.`,
//           focusIds: [R.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Right rotate at ${R.id}`,
//         });

//         const newSub = rotateLeft(node);
//         reconnect(rootRef, path, dirs, i, newSub);
//         push({
//           title: "Rotate Left (RL-2)",
//           detail: `Quay trái tại ${node.id}.`,
//           focusIds: [node.id, newSub.id],
//           ghost: s,
//           ghostMode: "floating",
//           compareText: `Left rotate at ${node.id}`,
//         });
//       }
//     }
//   }

//   push({
//     title: "Hoàn tất",
//     detail: `Đã chèn và cân bằng xong ${s.id}.`,
//     focusIds: [s.id],
//     ghost: s,
//     ghostMode: "atNode",
//     ghostTargetId: s.id,
//   });

//   return { steps, finalRoot: rootRef.root };
// }
import type { AvlNode, CompareDir, Student, TutorStep } from "./types";
import { cloneNode } from "./clone";
import { recomputeHeights } from "./height";

function cmp(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function insertBST(root: AvlNode | null, s: Student): AvlNode | null {
  const r = cloneNode(root);
  const st: Student = { id: s.id.trim(), name: s.name.trim(), gpa: Number(s.gpa) };

  if (!r) {
    const newRoot: AvlNode = { ...st, height: 1, left: null, right: null };
    return newRoot;
  }

  let cur = r;
  while (true) {
    const c = cmp(st.id, cur.id);
    if (c === 0) return recomputeHeights(r);

    if (c < 0) {
      if (!cur.left) {
        cur.left = { ...st, height: 1, left: null, right: null };
        break;
      }
      cur = cur.left;
    } else {
      if (!cur.right) {
        cur.right = { ...st, height: 1, left: null, right: null };
        break;
      }
      cur = cur.right;
    }
  }

  return recomputeHeights(r);
}

//   tutorial flow: compare -> move -> null -> attach (NO balancing / NO rotations)
export function simulateInsertWithTutorSteps(root: AvlNode | null, student: Student) {
  const rootRef = { root: cloneNode(root) };
  const steps: TutorStep[] = [];

  const s: Student = {
    id: student.id.trim(),
    name: student.name.trim(),
    gpa: Number(student.gpa),
  };

  const snap = () => cloneNode(rootRef.root);
  const push = (x: Omit<TutorStep, "snapshot">) => steps.push({ ...x, snapshot: snap() });

  push({
    title: "Giá trị cần thêm",
    detail: `Chuẩn bị chèn ${s.id} (chưa nối vào cây).`,
    focusIds: [],
    ghost: s,
    ghostMode: "floating",
    compareText: `${s.id} • ${s.name} • GPA ${s.gpa}`,
  });

  if (!rootRef.root) {
    push({
      title: "Cây rỗng",
      detail: "Không có node để so sánh. Node mới sẽ thành root.",
      focusIds: [],
      ghost: s,
      ghostMode: "floating",
      compareText: "Insert as ROOT",
    });

    rootRef.root = { ...s, height: 1, left: null, right: null };
    recomputeHeights(rootRef.root);

    push({
      title: "Attach",
      detail: `${s.id} đã được gắn vào cây (root).`,
      focusIds: [s.id],
      ghost: s,
      ghostMode: "atNode",
      ghostTargetId: s.id,
    });

    push({
      title: "Hoàn tất (BST)",
      detail: `Kết thúc insert BST cho ${s.id}. (Chưa cân bằng AVL)`,
      focusIds: [s.id],
      ghost: s,
      ghostMode: "atNode",
      ghostTargetId: s.id,
    });

    return { steps, finalRoot: rootRef.root };
  }

  let cur = rootRef.root;

  while (true) {
    const c = cmp(s.id, cur.id);
    const dir: CompareDir = c < 0 ? "L" : "R";
    const sign = c < 0 ? "<" : c > 0 ? ">" : "=";

    push({
      title: "So sánh",
      detail: "So sánh mã SV để quyết định đi trái/phải (chưa nối).",
      focusIds: [cur.id],
      ghost: s,
      ghostMode: "atNode",
      ghostTargetId: cur.id,
      ghostDirHint: dir,
      compareText: `${s.id} ${sign} ${cur.id} → đi ${dir === "L" ? "LEFT" : "RIGHT"}`,
    });

    if (c === 0) {
      push({
        title: "Trùng mã",
        detail: `Mã ${s.id} đã tồn tại → dừng.`,
        focusIds: [cur.id],
        ghost: s,
        ghostMode: "atNode",
        ghostTargetId: cur.id,
      });
      return { steps, finalRoot: rootRef.root };
    }

    push({
      title: "Di chuyển",
      detail: `Đi sang ${dir === "L" ? "LEFT" : "RIGHT"} để so sánh tiếp (vẫn chưa gắn).`,
      focusIds: [cur.id],
      ghost: s,
      ghostMode: "atNode",
      ghostTargetId: cur.id,
      ghostDirHint: dir,
    });

    const next = dir === "L" ? cur.left : cur.right;

    if (!next) {
      push({
        title: "Gặp null",
        detail: `Đã tới null. Sắp attach ${s.id} vào ${dir === "L" ? "LEFT" : "RIGHT"} (chưa nối).`,
        focusIds: [cur.id],
        ghost: s,
        ghostMode: "atNull",
        ghostTargetId: cur.id,
        ghostDirHint: dir,
        compareText: `Ready to attach under ${cur.id} → ${dir}`,
      });

      const newNode: AvlNode = { ...s, height: 1, left: null, right: null };
      if (dir === "L") cur.left = newNode;
      else cur.right = newNode;

      recomputeHeights(rootRef.root);

      push({
        title: "Attach",
        detail: `Đã nối ${s.id} vào cây (BST).`,
        focusIds: [cur.id, s.id],
        ghost: s,
        ghostMode: "atNode",
        ghostTargetId: s.id,
      });

      break;
    }

    cur = next;
  }

  push({
    title: "Hoàn tất (BST)",
    detail: `Kết thúc insert BST cho ${s.id}. (Chưa cân bằng AVL)`,
    focusIds: [s.id],
    ghost: s,
    ghostMode: "atNode",
    ghostTargetId: s.id,
  });

  return { steps, finalRoot: rootRef.root };
}
