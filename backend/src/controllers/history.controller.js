import SimulationHistory from '../models/SimulationHistory.js';

export const getHistory = async (req, res, next) => {
  try {
    const { repoId, search, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };
    if (repoId) query.repository = repoId;
    if (search) query.command = { $regex: search, $options: 'i' };

    const history = await SimulationHistory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('repository', 'name');

    const total = await SimulationHistory.countDocuments(query);

    res.json({ history, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const deleteHistory = async (req, res, next) => {
  try {
    await SimulationHistory.deleteMany({ user: req.user._id });
    res.json({ message: 'History cleared' });
  } catch (err) {
    next(err);
  }
};
