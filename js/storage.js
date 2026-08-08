// LocalStorage Persistence Wrapper for Counter App
export const STORAGE_KEY = 'counter_app_state_v1';

export const INITIAL_STATE = {
  activeProjectId: null,
  sortMode: 'manual', // 'manual' | 'count' | 'title'
  projects: {}
};

/**
 * Load state from localStorage with fallback to default state
 */
export function loadState(storage = globalThis.localStorage) {
  if (!storage) return { ...INITIAL_STATE };
  try {
    const serialized = storage.getItem(STORAGE_KEY);
    if (!serialized) return { ...INITIAL_STATE };
    const parsed = JSON.parse(serialized);
    return {
      activeProjectId: parsed.activeProjectId || null,
      sortMode: parsed.sortMode || 'manual',
      projects: parsed.projects || {}
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return { ...INITIAL_STATE };
  }
}

/**
 * Save state snapshot to localStorage
 */
export function saveState(state, storage = globalThis.localStorage) {
  if (!storage) return false;
  try {
    const serialized = JSON.stringify(state);
    storage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
    return false;
  }
}
