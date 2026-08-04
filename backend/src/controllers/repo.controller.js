import Repository from '../models/Repository.js';
import SimulationHistory from '../models/SimulationHistory.js';
import User from '../models/User.js';
import { executeCommand, createInitialState } from '../utils/gitSimulator.js';

export const createRepo = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const repo = await Repository.create({
      name,
      description,
      owner: req.user._id,
      state: createInitialState(),
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.reposCreated': 1 } });
    res.status(201).json({ repo });
  } catch (err) {
    next(err);
  }
};

export const getRepos = async (req, res, next) => {
  try {
    const repos = await Repository.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json({ repos });
  } catch (err) {
    next(err);
  }
};

export const getRepo = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    res.json({ repo });
  } catch (err) {
    next(err);
  }
};

export const deleteRepo = async (req, res, next) => {
  try {
    await Repository.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ message: 'Repository deleted' });
  } catch (err) {
    next(err);
  }
};

export const runCommand = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });

    const { command } = req.body;
    if (!command) return res.status(400).json({ message: 'command is required' });

    const stateBefore = JSON.parse(JSON.stringify(repo.state));

    // Push current state to undo stack before mutation
    repo.undoStack.push(stateBefore);
    if (repo.undoStack.length > 50) repo.undoStack.shift();
    repo.redoStack = []; // clear redo on new command

    const { state: newState, result, explanation } = executeCommand(repo.state.toObject ? repo.state.toObject() : repo.state, command);

    repo.state = newState;
    repo.commandHistory.push({ command, result, explanation, timestamp: new Date() });
    if (repo.commandHistory.length > 200) repo.commandHistory.shift();

    await repo.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.commandsRun': 1 } });

    // Save to simulation history
    await SimulationHistory.create({
      user: req.user._id,
      repository: repo._id,
      command,
      result,
      explanation,
      stateBefore,
      stateAfter: newState,
    });

    res.json({ state: repo.state, result, explanation, commandHistory: repo.commandHistory });
  } catch (err) {
    next(err);
  }
};

export const undoCommand = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.undoStack || repo.undoStack.length === 0) {
      return res.status(400).json({ message: 'Nothing to undo' });
    }
    const prevState = repo.undoStack.pop();
    repo.redoStack.push(JSON.parse(JSON.stringify(repo.state)));
    repo.state = prevState;
    await repo.save();
    res.json({ state: repo.state, message: 'Undo successful' });
  } catch (err) {
    next(err);
  }
};

export const redoCommand = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, owner: req.user._id });
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.redoStack || repo.redoStack.length === 0) {
      return res.status(400).json({ message: 'Nothing to redo' });
    }
    const nextState = repo.redoStack.pop();
    repo.undoStack.push(JSON.parse(JSON.stringify(repo.state)));
    repo.state = nextState;
    await repo.save();
    res.json({ state: repo.state, message: 'Redo successful' });
  } catch (err) {
    next(err);
  }
};
