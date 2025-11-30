// export type Student = {
//   id: string;
//   name: string;
//   gpa: number;
// };

// export type AvlNode = Student & {
//   height: number;
//   left: AvlNode | null;
//   right: AvlNode | null;
// };

// export type CompareDir = "L" | "R";

// export type TutorGhostMode = "floating" | "atNode" | "atNull";

// export type TutorStep = {
//   title: string;
//   detail: string;

//   snapshot: AvlNode | null;

//   // highlight node(s) trong cây
//   focusIds: string[];

//   // ghost (SV mới) chưa nối đường đi
//   ghost?: Student;
//   ghostMode?: TutorGhostMode;
//   ghostTargetId?: string; // node đang so sánh/điểm bám
//   ghostDirHint?: CompareDir; // gợi ý L/R cho bước move/null

//   // hiển thị so sánh
//   compareText?: string; // ví dụ: "SV12 > SV10  → đi RIGHT"
// };


export type Student = {
  id: string;
  name: string;
  gpa: number;
};

export type AvlNode = Student & {
  height: number;
  left: AvlNode | null;
  right: AvlNode | null;
};

export type CompareDir = "L" | "R";
export type TutorGhostMode = "floating" | "atNode" | "atNull";

export type AvlRole = "Z" | "Y" | "X";
export type AvlCase = "LL" | "RR" | "LR" | "RL";

export type TutorStep = {
  title: string;
  detail: string;

  snapshot: AvlNode | null;

  // highlight in-tree nodes
  focusIds: string[];

  // ghost (used by insert flow)
  ghost?: Student;
  ghostMode?: TutorGhostMode;
  ghostTargetId?: string;
  ghostDirHint?: CompareDir;

  compareText?: string;

  roles?: Record<string, AvlRole>; 
  avlCase?: AvlCase;
  rotationHint?: string; 

  focusEdges?: string[];
};
