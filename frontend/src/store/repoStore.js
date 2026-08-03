import { create } from 'zustand';
import api from '../lib/api';

export const useRepoStore = create((set, get) => ({
  repos: [],
  currentRepo: null,
  isLoading: false,
  isRunning: false,
  commandOutput: null,
  explanation: null,
  commandHistory: [],

  fetchRepos: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/repos');
      set({ repos: data.repos, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createRepo: async (name, description) => {
    const { data } = await api.post('/repos', { name, description });
    set((s) => ({ repos: [data.repo, ...s.repos] }));
    return data.repo;
  },

  loadRepo: async (id) => {
    set({ isLoading: true });
    const { data } = await api.get(`/repos/${id}`);
    set({ currentRepo: data.repo, commandHistory: data.repo.commandHistory || [], isLoading: false });
    return data.repo;
  },

  deleteRepo: async (id) => {
    await api.delete(`/repos/${id}`);
    set((s) => ({ repos: s.repos.filter((r) => r._id !== id) }));
  },

  runCommand: async (command) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    set({ isRunning: true, commandOutput: null, explanation: null });
    try {
      const { data } = await api.post(`/repos/${currentRepo._id}/command`, { command });
      set((s) => ({
        currentRepo: { ...s.currentRepo, state: data.state },
        commandOutput: data.result,
        explanation: data.explanation,
        commandHistory: data.commandHistory || [],
        isRunning: false,
      }));
      return { success: true, result: data.result, explanation: data.explanation };
    } catch (err) {
      const msg = err.response?.data?.message || 'Command failed';
      set({ isRunning: false, commandOutput: msg });
      return { success: false, error: msg };
    }
  },

  undo: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    const { data } = await api.post(`/repos/${currentRepo._id}/undo`);
    set((s) => ({ currentRepo: { ...s.currentRepo, state: data.state } }));
  },

  redo: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    const { data } = await api.post(`/repos/${currentRepo._id}/redo`);
    set((s) => ({ currentRepo: { ...s.currentRepo, state: data.state } }));
  },

  clearOutput: () => set({ commandOutput: null, explanation: null }),
}));
