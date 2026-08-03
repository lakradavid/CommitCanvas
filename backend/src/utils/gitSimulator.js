import { v4 as uuidv4 } from 'uuid';

const BRANCH_COLORS = [
  '#58a6ff', '#f78166', '#3fb950', '#d2a8ff',
  '#ffa657', '#79c0ff', '#ff7b72', '#56d364',
];

const shortHash = () => Math.random().toString(16).slice(2, 9);

// Get current commit id
const getCurrentCommitId = (state) => {
  if (state.detachedHEAD) return state.detachedCommitId;
  const branch = state.branches.find((b) => b.name === state.HEAD);
  return branch ? branch.commitId : null;
};

// Deep clone state
const cloneState = (state) => JSON.parse(JSON.stringify(state));

export const createInitialState = () => ({
  commits: [],
  branches: [],
  HEAD: 'main',
  detachedHEAD: false,
  detachedCommitId: null,
  stagingArea: [],
  workingDirectory: [],
  stash: [],
  tags: {},
  initialized: false,
});

// ─── COMMANDS ────────────────────────────────────────────────────────────────

const handlers = {};

// git init
handlers.init = (state, _args) => {
  if (state.initialized) {
    return { state, result: 'Repository already initialized.', explanation: 'git init creates a new Git repository. This repo is already initialized.' };
  }
  const newState = cloneState(state);
  newState.initialized = true;
  newState.HEAD = 'main';
  newState.branches = [];
  return {
    state: newState,
    result: 'Initialized empty Git repository.',
    explanation: 'git init creates a hidden .git folder that tracks all version history. Your working directory is now a Git repository.',
  };
};

// git add
handlers.add = (state, args) => {
  if (!state.initialized) return notInit();
  const files = args[0] === '.' ? [...state.workingDirectory] : args;
  if (files.length === 0) return { state, result: 'Nothing specified to add.', explanation: 'git add moves files from working directory to staging area.' };
  const newState = cloneState(state);
  const toAdd = files.filter((f) => !newState.stagingArea.includes(f) && newState.workingDirectory.includes(f));
  if (toAdd.length === 0) return { state: newState, result: 'Nothing new to add (files already staged or not in working directory).', explanation: 'These files are already staged or not tracked.' };
  newState.stagingArea = [...new Set([...newState.stagingArea, ...toAdd])];
  return {
    state: newState,
    result: `Added: ${toAdd.join(', ')}`,
    explanation: `git add moves your changes to the staging area (index). Files: ${toAdd.join(', ')} are now ready to be committed. The staging area lets you craft your commits precisely.`,
  };
};

// git commit
handlers.commit = (state, args) => {
  if (!state.initialized) return notInit();
  const msgIdx = args.indexOf('-m');
  const message = msgIdx !== -1 ? args.slice(msgIdx + 1).join(' ').replace(/^"|"$/g, '') : 'Update';
  if (state.stagingArea.length === 0) {
    return { state, result: 'Nothing to commit, working tree clean.', explanation: 'git commit saves staged changes. Stage files with git add first.' };
  }
  const newState = cloneState(state);
  const parentId = getCurrentCommitId(newState);
  const commitId = uuidv4();
  const commit = {
    id: commitId,
    message,
    author: 'user',
    timestamp: new Date().toISOString(),
    parents: parentId ? [parentId] : [],
    branch: newState.HEAD,
    hash: shortHash(),
    isMerge: false,
    tags: [],
    staged: [...newState.stagingArea],
  };
  newState.commits.push(commit);
  newState.stagingArea = [];
  // ensure main branch exists on first commit
  const branchIdx = newState.branches.findIndex((b) => b.name === newState.HEAD);
  if (branchIdx === -1) {
    newState.branches.push({ name: newState.HEAD, commitId, color: BRANCH_COLORS[0] });
  } else {
    newState.branches[branchIdx].commitId = commitId;
  }
  return {
    state: newState,
    result: `[${newState.HEAD} ${commit.hash}] ${message}`,
    explanation: `git commit takes your staged snapshot and saves it to the project history. Each commit is a save point you can return to. Hash: ${commit.hash}`,
  };
};

// git branch
handlers.branch = (state, args) => {
  if (!state.initialized) return notInit();
  const newState = cloneState(state);
  // List branches
  if (args.length === 0 || args[0] === '--list') {
    const list = newState.branches.map((b) => (b.name === newState.HEAD ? `* ${b.name}` : `  ${b.name}`)).join('\n');
    return { state, result: list || '(no branches)', explanation: 'git branch lists all local branches. The asterisk (*) marks the current branch.' };
  }
  // Delete branch
  if (args[0] === '-d' || args[0] === '-D') {
    const name = args[1];
    if (name === newState.HEAD) return { state, result: `Cannot delete branch '${name}': checked out.`, explanation: 'You cannot delete the currently checked-out branch.' };
    const idx = newState.branches.findIndex((b) => b.name === name);
    if (idx === -1) return { state, result: `Branch '${name}' not found.`, explanation: '' };
    newState.branches.splice(idx, 1);
    return { state: newState, result: `Deleted branch ${name}.`, explanation: `git branch -d deletes a local branch. Branch '${name}' has been removed.` };
  }
  // Create branch
  const name = args[0];
  if (newState.branches.find((b) => b.name === name)) {
    return { state, result: `Branch '${name}' already exists.`, explanation: '' };
  }
  const currentCommitId = getCurrentCommitId(newState);
  const colorIdx = newState.branches.length % BRANCH_COLORS.length;
  newState.branches.push({ name, commitId: currentCommitId, color: BRANCH_COLORS[colorIdx] });
  return {
    state: newState,
    result: `Created branch '${name}'.`,
    explanation: `git branch ${name} creates a new pointer to the current commit (${currentCommitId?.slice(0, 7) || 'none'}). Branches are lightweight pointers — creating one is instant.`,
  };
};

// git checkout
handlers.checkout = (state, args) => {
  if (!state.initialized) return notInit();
  const newState = cloneState(state);
  // checkout -b (create + switch)
  if (args[0] === '-b' && args[1]) {
    const name = args[1];
    if (newState.branches.find((b) => b.name === name)) {
      return { state, result: `Branch '${name}' already exists.`, explanation: '' };
    }
    const currentCommitId = getCurrentCommitId(newState);
    const colorIdx = newState.branches.length % BRANCH_COLORS.length;
    newState.branches.push({ name, commitId: currentCommitId, color: BRANCH_COLORS[colorIdx] });
    newState.HEAD = name;
    newState.detachedHEAD = false;
    return {
      state: newState,
      result: `Switched to a new branch '${name}'.`,
      explanation: `git checkout -b creates a new branch and immediately switches to it. You are now on '${name}'.`,
    };
  }
  const target = args[0];
  // checkout commit hash (detached HEAD)
  const commit = newState.commits.find((c) => c.hash === target || c.id === target);
  if (commit) {
    newState.detachedHEAD = true;
    newState.detachedCommitId = commit.id;
    return {
      state: newState,
      result: `HEAD is now at ${commit.hash} ${commit.message}`,
      explanation: `You are in 'detached HEAD' state. HEAD points directly to commit ${commit.hash}. Changes won't be on any branch unless you create one.`,
    };
  }
  // checkout branch
  const branch = newState.branches.find((b) => b.name === target);
  if (!branch) {
    return { state, result: `Branch '${target}' not found.`, explanation: 'Use git branch to list available branches.' };
  }
  newState.HEAD = target;
  newState.detachedHEAD = false;
  newState.detachedCommitId = null;
  return {
    state: newState,
    result: `Switched to branch '${target}'.`,
    explanation: `git checkout moves HEAD to the '${target}' branch. Your working directory is updated to match that branch's latest commit.`,
  };
};

// git merge
handlers.merge = (state, args) => {
  if (!state.initialized) return notInit();
  const targetBranchName = args[0];
  if (!targetBranchName) return { state, result: 'Usage: git merge <branch>', explanation: '' };
  const newState = cloneState(state);
  const targetBranch = newState.branches.find((b) => b.name === targetBranchName);
  if (!targetBranch) return { state, result: `Branch '${targetBranchName}' not found.`, explanation: '' };
  const currentCommitId = getCurrentCommitId(newState);
  const mergeCommitId = uuidv4();
  const mergeCommit = {
    id: mergeCommitId,
    message: `Merge branch '${targetBranchName}' into ${newState.HEAD}`,
    author: 'user',
    timestamp: new Date().toISOString(),
    parents: [currentCommitId, targetBranch.commitId].filter(Boolean),
    branch: newState.HEAD,
    hash: shortHash(),
    isMerge: true,
    tags: [],
    staged: [],
  };
  newState.commits.push(mergeCommit);
  const currentBranchIdx = newState.branches.findIndex((b) => b.name === newState.HEAD);
  if (currentBranchIdx !== -1) newState.branches[currentBranchIdx].commitId = mergeCommitId;
  return {
    state: newState,
    result: `Merge made by the 'recursive' strategy. [${mergeCommit.hash}]`,
    explanation: `git merge combines the history of '${targetBranchName}' into '${newState.HEAD}'. A merge commit was created with two parents, preserving both branch histories.`,
  };
};

// git rebase
handlers.rebase = (state, args) => {
  if (!state.initialized) return notInit();
  const targetBranchName = args[0];
  if (!targetBranchName) return { state, result: 'Usage: git rebase <branch>', explanation: '' };
  const newState = cloneState(state);
  const targetBranch = newState.branches.find((b) => b.name === targetBranchName);
  if (!targetBranch) return { state, result: `Branch '${targetBranchName}' not found.`, explanation: '' };
  // Find commits exclusive to current branch (simplified)
  const currentBranchCommits = newState.commits.filter((c) => c.branch === newState.HEAD);
  if (currentBranchCommits.length === 0) {
    return { state, result: 'Current branch is up to date.', explanation: 'Nothing to rebase.' };
  }
  let baseCommitId = targetBranch.commitId;
  const newCommitIds = [];
  currentBranchCommits.forEach((original) => {
    const newCommitId = uuidv4();
    newCommitIds.push(newCommitId);
    newState.commits.push({
      ...original,
      id: newCommitId,
      parents: [baseCommitId],
      hash: shortHash(),
      timestamp: new Date().toISOString(),
    });
    baseCommitId = newCommitId;
  });
  const currentBranchIdx = newState.branches.findIndex((b) => b.name === newState.HEAD);
  if (currentBranchIdx !== -1) newState.branches[currentBranchIdx].commitId = baseCommitId;
  return {
    state: newState,
    result: `Successfully rebased onto ${targetBranchName}.`,
    explanation: `git rebase re-applies your commits on top of '${targetBranchName}'. Unlike merge, it creates a linear history by replaying each commit with a new hash.`,
  };
};

// git reset
handlers.reset = (state, args) => {
  if (!state.initialized) return notInit();
  const mode = args.find((a) => a.startsWith('--')) || '--mixed';
  const target = args.find((a) => !a.startsWith('--')) || 'HEAD~1';
  const newState = cloneState(state);
  let steps = 1;
  if (target.startsWith('HEAD~')) steps = parseInt(target.replace('HEAD~', ''), 10) || 1;
  // Remove last N commits from current branch
  const branchCommits = newState.commits.filter((c) => c.branch === newState.HEAD).slice(0, -steps);
  const lastCommit = branchCommits[branchCommits.length - 1];
  const branchIdx = newState.branches.findIndex((b) => b.name === newState.HEAD);
  if (branchIdx !== -1 && lastCommit) newState.branches[branchIdx].commitId = lastCommit.id;
  if (mode === '--hard') newState.stagingArea = [];
  const explanations = {
    '--soft': 'git reset --soft moves HEAD back but keeps changes staged. Great for amending commits.',
    '--mixed': 'git reset --mixed (default) moves HEAD back and unstages changes, keeping them in working directory.',
    '--hard': 'git reset --hard moves HEAD back and DISCARDS all changes. This is irreversible!',
  };
  return {
    state: newState,
    result: `HEAD is now at ${lastCommit?.hash || '(root)'} ${lastCommit?.message || ''}`,
    explanation: explanations[mode] || explanations['--mixed'],
  };
};

// git revert
handlers.revert = (state, args) => {
  if (!state.initialized) return notInit();
  const newState = cloneState(state);
  const currentCommitId = getCurrentCommitId(newState);
  const commitToRevert = newState.commits.find((c) => c.id === currentCommitId);
  if (!commitToRevert) return { state, result: 'Nothing to revert.', explanation: '' };
  const revertId = uuidv4();
  const revertCommit = {
    id: revertId,
    message: `Revert "${commitToRevert.message}"`,
    author: 'user',
    timestamp: new Date().toISOString(),
    parents: [currentCommitId],
    branch: newState.HEAD,
    hash: shortHash(),
    isMerge: false,
    tags: [],
    staged: [],
  };
  newState.commits.push(revertCommit);
  const branchIdx = newState.branches.findIndex((b) => b.name === newState.HEAD);
  if (branchIdx !== -1) newState.branches[branchIdx].commitId = revertId;
  return {
    state: newState,
    result: `[${newState.HEAD} ${revertCommit.hash}] Revert "${commitToRevert.message}"`,
    explanation: `git revert creates a NEW commit that undoes the changes of a previous commit. Unlike reset, it is safe for shared history because it doesn't rewrite history.`,
  };
};

// git stash
handlers.stash = (state, args) => {
  if (!state.initialized) return notInit();
  const sub = args[0] || 'push';
  const newState = cloneState(state);
  if (sub === 'push' || sub === undefined) {
    if (newState.stagingArea.length === 0 && newState.workingDirectory.length === 0) {
      return { state, result: 'No local changes to save.', explanation: 'git stash requires uncommitted changes.' };
    }
    const entry = {
      id: uuidv4(),
      message: args.includes('-m') ? args[args.indexOf('-m') + 1] : `WIP on ${newState.HEAD}`,
      files: [...newState.stagingArea, ...newState.workingDirectory],
      timestamp: new Date().toISOString(),
    };
    newState.stash.unshift(entry);
    newState.stagingArea = [];
    return { state: newState, result: `Saved working directory and index state: ${entry.message}`, explanation: 'git stash saves your uncommitted changes to a stack, giving you a clean working directory.' };
  }
  if (sub === 'pop' || sub === 'apply') {
    if (newState.stash.length === 0) return { state, result: 'No stash entries.', explanation: '' };
    const entry = newState.stash[0];
    newState.stagingArea = [...new Set([...newState.stagingArea, ...entry.files])];
    if (sub === 'pop') newState.stash.shift();
    return { state: newState, result: `Applied stash: ${entry.message}`, explanation: `git stash ${sub} restores the stashed changes back to your working directory.` };
  }
  if (sub === 'list') {
    const list = newState.stash.map((e, i) => `stash@{${i}}: ${e.message}`).join('\n');
    return { state, result: list || '(empty stash)', explanation: 'git stash list shows all saved stash entries.' };
  }
  if (sub === 'drop') {
    if (newState.stash.length === 0) return { state, result: 'No stash entries.', explanation: '' };
    newState.stash.shift();
    return { state: newState, result: 'Dropped stash@{0}.', explanation: 'git stash drop removes the most recent stash entry.' };
  }
  return { state, result: `Unknown stash subcommand: ${sub}`, explanation: '' };
};

// git tag
handlers.tag = (state, args) => {
  if (!state.initialized) return notInit();
  const newState = cloneState(state);
  if (args.length === 0) {
    const list = Object.keys(newState.tags).join('\n');
    return { state, result: list || '(no tags)', explanation: 'git tag lists all tags.' };
  }
  const name = args[0];
  const currentCommitId = getCurrentCommitId(newState);
  if (!currentCommitId) return { state, result: 'No commits to tag.', explanation: '' };
  newState.tags[name] = currentCommitId;
  const commit = newState.commits.find((c) => c.id === currentCommitId);
  if (commit && !commit.tags.includes(name)) commit.tags.push(name);
  return {
    state: newState,
    result: `Created tag '${name}' at ${commit?.hash}.`,
    explanation: `git tag marks a specific commit with a human-readable name like 'v1.0'. Tags are often used for releases.`,
  };
};

// git status (bonus)
handlers.status = (state, _args) => {
  if (!state.initialized) return notInit();
  const staged = state.stagingArea.length ? `Changes to be committed:\n  ${state.stagingArea.map((f) => `new file: ${f}`).join('\n  ')}` : '';
  const wd = state.workingDirectory.length ? `Untracked files:\n  ${state.workingDirectory.join('\n  ')}` : '';
  const clean = !staged && !wd ? 'nothing to commit, working tree clean' : '';
  const result = [`On branch ${state.HEAD}`, staged, wd, clean].filter(Boolean).join('\n\n');
  return { state, result, explanation: 'git status shows the state of the working directory and staging area.' };
};

// git log (bonus)
handlers.log = (state, _args) => {
  if (!state.initialized) return notInit();
  if (state.commits.length === 0) return { state, result: 'No commits yet.', explanation: 'Make your first commit!' };
  const logs = [...state.commits].reverse().slice(0, 10).map((c) =>
    `commit ${c.hash}\nDate: ${new Date(c.timestamp).toLocaleString()}\n\n    ${c.message}\n`
  ).join('\n');
  return { state, result: logs, explanation: 'git log shows the commit history. Newest commits appear first.' };
};

const notInit = () => ({
  state: null,
  result: 'Not a git repository. Run git init first.',
  explanation: 'git init must be run before any other git command.',
});

// Fake file helpers (for adding virtual files)
handlers['touch'] = (state, args) => {
  if (!state.initialized) return notInit();
  const newState = cloneState(state);
  const files = args.filter(Boolean);
  if (files.length === 0) return { state, result: 'Usage: touch <file>', explanation: '' };
  const added = files.filter((f) => !newState.workingDirectory.includes(f));
  newState.workingDirectory = [...newState.workingDirectory, ...added];
  return { state: newState, result: `Created: ${added.join(', ')}`, explanation: 'Created virtual files in the working directory. Use git add to stage them.' };
};

// ─── MAIN EXECUTE ────────────────────────────────────────────────────────────
export const executeCommand = (state, rawCommand) => {
  const parts = rawCommand.trim().split(/\s+/);
  if (parts[0] === 'git') parts.shift();
  const cmd = parts[0];
  const args = parts.slice(1);
  const handler = handlers[cmd];
  if (!handler) {
    return {
      state,
      result: `git: '${cmd}' is not a recognized command.`,
      explanation: `Try one of: init, add, commit, branch, checkout, merge, rebase, reset, revert, stash, tag, status, log`,
    };
  }
  const res = handler(state, args);
  if (!res.state) res.state = state;
  return res;
};
