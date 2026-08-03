import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

const SEED_CHALLENGES = [
  {
    title: 'Initialize a Repository',
    description: 'Learn to initialize a new Git repository.',
    difficulty: 'beginner',
    category: 'basics',
    instructions: ['Run git init to initialize the repository.'],
    hints: ['Type: git init'],
    solution: ['git init'],
    targetState: { initialized: true },
    points: 10,
    order: 1,
  },
  {
    title: 'Make Your First Commit',
    description: 'Create a file, stage it, and make your first commit.',
    difficulty: 'beginner',
    category: 'basics',
    instructions: ['Create a virtual file with: touch README.md', 'Stage it with: git add README.md', 'Commit it with: git commit -m "Initial commit"'],
    hints: ['Use touch to create files', 'git add stages files', 'git commit -m saves them'],
    solution: ['touch README.md', 'git add README.md', 'git commit -m "Initial commit"'],
    targetState: { minCommits: 1 },
    points: 20,
    order: 2,
  },
  {
    title: 'Create and Switch Branches',
    description: 'Create a new branch called "feature" and switch to it.',
    difficulty: 'beginner',
    category: 'branching',
    instructions: ['Create branch: git branch feature', 'Switch to it: git checkout feature', 'Or do both at once: git checkout -b feature'],
    hints: ['git checkout -b is a shortcut', 'Your HEAD should be on "feature"'],
    solution: ['git checkout -b feature'],
    targetState: { currentBranch: 'feature' },
    points: 20,
    order: 3,
  },
  {
    title: 'Merge Branches',
    description: 'Create a feature branch with a commit, then merge it back into main.',
    difficulty: 'intermediate',
    category: 'branching',
    instructions: [
      'Create and switch to feature branch: git checkout -b feature',
      'Add a file and commit it',
      'Go back to main: git checkout main',
      'Merge: git merge feature',
    ],
    hints: ['Merge creates a merge commit', 'HEAD must be on the receiving branch'],
    solution: ['git checkout -b feature', 'touch feature.txt', 'git add .', 'git commit -m "feature"', 'git checkout main', 'git merge feature'],
    targetState: { minBranches: 2, minMergeCommits: 1 },
    points: 30,
    order: 4,
  },
  {
    title: 'Stash and Apply',
    description: 'Stage some changes, stash them, and then apply the stash.',
    difficulty: 'intermediate',
    category: 'stash',
    instructions: ['Add a virtual file: touch work.txt', 'Stash it: git stash', 'Apply the stash: git stash pop'],
    hints: ['Stash saves uncommitted work', 'git stash pop restores it'],
    solution: ['touch work.txt', 'git stash', 'git stash pop'],
    targetState: { stashEmpty: true },
    points: 25,
    order: 5,
  },
  {
    title: 'Tag a Release',
    description: 'Make a commit and tag it as v1.0.',
    difficulty: 'beginner',
    category: 'tagging',
    instructions: ['Make a commit first', 'Tag it: git tag v1.0'],
    hints: ['Tags mark specific commits', 'Useful for releases'],
    solution: ['touch app.js', 'git add .', 'git commit -m "release"', 'git tag v1.0'],
    targetState: { hasTag: 'v1.0' },
    points: 15,
    order: 6,
  },
];

export const getChallenges = async (req, res, next) => {
  try {
    let challenges = await Challenge.find().sort({ order: 1 });
    if (challenges.length === 0) {
      challenges = await Challenge.insertMany(SEED_CHALLENGES);
    }
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
};

export const getChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json({ challenge });
  } catch (err) {
    next(err);
  }
};

export const completeChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.challengesCompleted': 1 },
    });
    res.json({ message: 'Challenge completed!', points: challenge.points });
  } catch (err) {
    next(err);
  }
};
