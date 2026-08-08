import { loadState, saveState } from './storage.js';

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = loadState();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    saveState(this.state);
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    }
  }

  // --- Project Actions ---

  setActiveProject(projectId) {
    if (projectId && !this.state.projects[projectId]) return false;
    this.state.activeProjectId = projectId;
    this.notify();
    return true;
  }

  createProject(title) {
    const trimmed = (title || '').trim();
    if (!trimmed) return null;

    const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const now = Date.now();
    const newProject = {
      id,
      title: trimmed,
      createdAt: now,
      updatedAt: now,
      counters: [],
      events: [] // Append-only event history log for Undo
    };

    this.state.projects[id] = newProject;
    this.state.activeProjectId = id;
    this.notify();
    return newProject;
  }

  updateProject(id, { title }) {
    const project = this.state.projects[id];
    if (!project) return false;
    if (title !== undefined) project.title = title.trim();
    project.updatedAt = Date.now();
    this.notify();
    return true;
  }

  deleteProject(id) {
    if (!this.state.projects[id]) return false;
    delete this.state.projects[id];
    if (this.state.activeProjectId === id) {
      this.state.activeProjectId = null;
    }
    this.notify();
    return true;
  }

  // --- Counter Actions ---

  createCounter(projectId, { title, colorHex }) {
    const project = this.state.projects[projectId];
    if (!project) return null;

    const trimmed = (title || '').trim();
    if (!trimmed) return null;

    const id = 'cnt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const now = Date.now();
    const newCounter = {
      id,
      projectId,
      title: trimmed,
      count: 0,
      orderIndex: project.counters.length,
      colorHex: colorHex || '#38bdf8',
      createdAt: now,
      updatedAt: now
    };

    project.counters.push(newCounter);
    project.updatedAt = now;
    this.notify();
    return newCounter;
  }

  updateCounter(projectId, counterId, { title, colorHex }) {
    const project = this.state.projects[projectId];
    if (!project) return false;

    const counter = project.counters.find(c => c.id === counterId);
    if (!counter) return false;

    if (title !== undefined && title.trim()) counter.title = title.trim();
    if (colorHex !== undefined) counter.colorHex = colorHex;
    counter.updatedAt = Date.now();
    project.updatedAt = counter.updatedAt;

    this.notify();
    return true;
  }

  deleteCounter(projectId, counterId) {
    const project = this.state.projects[projectId];
    if (!project) return false;

    const idx = project.counters.findIndex(c => c.id === counterId);
    if (idx === -1) return false;

    project.counters.splice(idx, 1);
    // Re-index remaining counters
    project.counters.forEach((c, i) => c.orderIndex = i);
    // Remove relevant events from undo log
    project.events = project.events.filter(e => e.counterId !== counterId);
    project.updatedAt = Date.now();

    this.notify();
    return true;
  }

  resetCounter(projectId, counterId) {
    const project = this.state.projects[projectId];
    if (!project) return false;

    const counter = project.counters.find(c => c.id === counterId);
    if (!counter) return false;

    counter.count = 0;
    counter.updatedAt = Date.now();
    project.updatedAt = counter.updatedAt;

    this.notify();
    return true;
  }

  resetAllCounters(projectId) {
    const project = this.state.projects[projectId];
    if (!project) return false;

    project.counters.forEach(c => {
      c.count = 0;
      c.updatedAt = Date.now();
    });
    project.events = [];
    project.updatedAt = Date.now();

    this.notify();
    return true;
  }

  // --- High-Speed Increment & Fixed Undo Stack ---

  tap(projectId, counterId) {
    const project = this.state.projects[projectId];
    if (!project) return false;

    const counter = project.counters.find(c => c.id === counterId);
    if (!counter) return false;

    counter.count += 1;
    counter.updatedAt = Date.now();
    project.updatedAt = counter.updatedAt;

    // Record in Undo event stack
    const event = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      counterId,
      timestamp: counter.updatedAt,
      delta: 1
    };
    project.events.push(event);

    this.notify();
    return { newCount: counter.count, event };
  }

  undo(projectId) {
    const project = this.state.projects[projectId];
    if (!project || !project.events || project.events.length === 0) return false;

    const lastEvent = project.events.pop();
    const counter = project.counters.find(c => c.id === lastEvent.counterId);

    if (counter) {
      counter.count = Math.max(0, counter.count - lastEvent.delta);
      counter.updatedAt = Date.now();
      project.updatedAt = counter.updatedAt;
    }

    this.notify();
    return true;
  }

  // --- One-Time Instant Sorting Actions ---

  sortCounters(projectId = null, criterion = 'count') {
    const targetProjectId = projectId || this.state.activeProjectId;
    if (!targetProjectId || !this.state.projects[targetProjectId]) return false;

    const project = this.state.projects[targetProjectId];

    if (criterion === 'count') {
      project.counters.sort((a, b) => b.count - a.count);
    } else if (criterion === 'title') {
      project.counters.sort((a, b) => a.title.localeCompare(b.title));
    }

    project.counters.forEach((c, index) => {
      c.orderIndex = index;
    });

    project.updatedAt = Date.now();
    this.notify();
    return true;
  }
}

export const store = new Store();
