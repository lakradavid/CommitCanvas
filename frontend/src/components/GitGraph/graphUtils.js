const BRANCH_COLORS = [
  '#58a6ff', '#f78166', '#3fb950', '#d2a8ff',
  '#ffa657', '#79c0ff', '#ff7b72', '#56d364',
];

// Layout constants
const H_SPACING = 140;   // horizontal gap between commits
const V_SPACING = 110;   // vertical gap between branch lanes
const START_X = 80;      // left margin for first commit
const COMMIT_Y_BASE = 160; // y center for lane 0
const BRANCH_LABEL_OFFSET_Y = -60; // branch label above commit
const BRANCH_LABEL_OFFSET_X = -10; // slight left align

export function buildGraphElements(state) {
  if (!state || !state.commits || state.commits.length === 0) {
    return { nodes: [], edges: [] };
  }

  const { commits, branches, HEAD, detachedHEAD, detachedCommitId } = state;
  const nodes = [];
  const edges = [];

  // ── 1. Build branch color map ─────────────────────────────────────────────
  const branchColorMap = {};
  branches.forEach((b, i) => {
    branchColorMap[b.name] = b.color || BRANCH_COLORS[i % BRANCH_COLORS.length];
  });

  // ── 2. Topological sort (parents before children) ─────────────────────────
  const commitMap = {};
  commits.forEach((c) => { commitMap[c.id] = c; });

  const sorted = topologicalSort(commits);

  // ── 3. Assign x positions in topo order ───────────────────────────────────
  const commitX = {};
  sorted.forEach((c, i) => { commitX[c.id] = START_X + i * H_SPACING; });

  // ── 4. Assign y lanes per branch (one lane per unique branch name) ─────────
  const branchLaneMap = {};
  let laneCounter = 0;

  // main/master always gets lane 0
  const mainName = branches.find((b) => b.name === 'main' || b.name === 'master')?.name;
  if (mainName) { branchLaneMap[mainName] = 0; laneCounter = 1; }

  sorted.forEach((c) => {
    const bName = c.branch;
    if (bName && branchLaneMap[bName] === undefined) {
      branchLaneMap[bName] = laneCounter++;
    }
  });
  branches.forEach((b) => {
    if (branchLaneMap[b.name] === undefined) {
      branchLaneMap[b.name] = laneCounter++;
    }
  });

  const getY = (branchName) =>
    COMMIT_Y_BASE + (branchLaneMap[branchName] ?? 0) * V_SPACING;

  // ── 5. HEAD commit id ─────────────────────────────────────────────────────
  const headBranch = branches.find((b) => b.name === HEAD);
  const headCommitId = detachedHEAD ? detachedCommitId : headBranch?.commitId;

  // ── 6. Latest commit per branch (tip) ─────────────────────────────────────
  const tipCommitIds = new Set(branches.map((b) => b.commitId));

  // ── 7. Commit nodes ───────────────────────────────────────────────────────
  sorted.forEach((commit) => {
    const color = branchColorMap[commit.branch] || '#58a6ff';
    const isHead = commit.id === headCommitId;
    const isLatest = tipCommitIds.has(commit.id);
    const x = commitX[commit.id] ?? START_X;
    const y = getY(commit.branch);

    nodes.push({
      id: `commit-${commit.id}`,
      type: 'commitNode',
      position: { x, y },
      data: { commit, isHead, branchColor: color, isLatest },
    });

    // Edges from each parent → this commit
    commit.parents.forEach((parentId) => {
      const parentCommit = commitMap[parentId];
      const edgeColor = parentCommit
        ? (branchColorMap[parentCommit.branch] || '#58a6ff')
        : '#58a6ff';

      edges.push({
        id: `edge-${commit.id}-${parentId}`,
        source: `commit-${parentId}`,
        target: `commit-${commit.id}`,
        type: commit.isMerge ? 'smoothstep' : 'smoothstep',
        animated: isHead && !commit.isMerge,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: edgeColor, width: 16, height: 16 },
      });
    });
  });

  // ── 8. Branch label nodes ─────────────────────────────────────────────────
  // Group branches by the commit they point to
  const branchesByCommit = {};
  branches.forEach((b) => {
    if (!b.commitId) return;
    if (!branchesByCommit[b.commitId]) branchesByCommit[b.commitId] = [];
    branchesByCommit[b.commitId].push(b);
  });

  // For each commit, spread its branch labels horizontally above it
  Object.entries(branchesByCommit).forEach(([commitId, branchGroup]) => {
    const tipCommit = commitMap[commitId];
    if (!tipCommit) return;

    const tipX = commitX[tipCommit.id] ?? START_X;
    const tipY = getY(tipCommit.branch);
    const count = branchGroup.length;

    // Label width ~90px, gap 8px — center the group over the commit
    const LABEL_W = 90;
    const GAP = 8;
    const totalWidth = count * LABEL_W + (count - 1) * GAP;
    const startX = tipX - totalWidth / 2 + LABEL_W / 2;

    branchGroup.forEach((branch, idx) => {
      const isCurrentBranch = branch.name === HEAD && !detachedHEAD;
      const labelX = startX + idx * (LABEL_W + GAP);

      nodes.push({
        id: `branch-${branch.name}`,
        type: 'branchLabel',
        position: {
          x: labelX - LABEL_W / 2,          // center the label node
          y: tipY + BRANCH_LABEL_OFFSET_Y,  // fixed distance above commit
        },
        data: { branch, isCurrentBranch },
        draggable: false,
      });

      // Dashed connector from label down to commit
      edges.push({
        id: `branch-edge-${branch.name}`,
        source: `branch-${branch.name}`,
        target: `commit-${tipCommit.id}`,
        type: 'straight',
        style: {
          stroke: branch.color || '#58a6ff',
          strokeWidth: 1.5,
          strokeDasharray: '4 3',
          opacity: 0.7,
        },
      });
    });
  });

  return { nodes, edges };
}

// ── Topological sort (Kahn's algorithm) ──────────────────────────────────────
function topologicalSort(commits) {
  const inDegree = {};
  const childrenMap = {};

  commits.forEach((c) => {
    inDegree[c.id] = inDegree[c.id] ?? 0;
    childrenMap[c.id] = childrenMap[c.id] ?? [];
    c.parents.forEach((pid) => {
      inDegree[c.id] = (inDegree[c.id] || 0) + 1;
      childrenMap[pid] = childrenMap[pid] || [];
      childrenMap[pid].push(c.id);
    });
  });

  const commitById = {};
  commits.forEach((c) => { commitById[c.id] = c; });

  const queue = commits.filter((c) => (inDegree[c.id] || 0) === 0);
  const result = [];

  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    (childrenMap[node.id] || []).forEach((childId) => {
      inDegree[childId]--;
      if (inDegree[childId] === 0) {
        queue.push(commitById[childId]);
      }
    });
  }

  // Fallback: append any remaining (cycles shouldn't happen but just in case)
  if (result.length < commits.length) {
    commits.forEach((c) => {
      if (!result.find((r) => r.id === c.id)) result.push(c);
    });
  }

  return result;
}
