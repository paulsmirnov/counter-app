import { store } from './store.js';
import { renderHub } from './ui/renderHub.js';
import { renderGrid } from './ui/renderGrid.js';
import { promptNewProject, promptNewCounter } from './ui/renderModal.js';
import { openActionSheet } from './ui/renderSheet.js';
import { openSandwichMenu } from './ui/renderSandwichMenu.js';
import { vibrateTap, vibrateLongPress } from './haptics.js';

class AppController {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.init();
  }

  init() {
    // Subscribe controller to state changes
    store.subscribe((state) => this.render(state));
    // Initial render
    this.render(store.getState());
  }

  render(state) {
    if (!this.appContainer) return;

    const activeProjectId = state.activeProjectId;
    const activeProject = activeProjectId ? state.projects[activeProjectId] : null;

    if (!activeProject) {
      // Screen A: Projects Hub
      renderHub(this.appContainer, state, {
        onSelectProject: (pid) => store.setActiveProject(pid),
        onCreateProjectPrompt: () => {
          promptNewProject((title) => {
            store.createProject(title);
          });
        }
      });
    } else {
      // Screen B: Counter Grid
      renderGrid(this.appContainer, activeProject, state, {
        onBackToHub: () => store.setActiveProject(null),
        onUndo: () => store.undo(activeProject.id),
        onTapCounter: (counterId) => {
          vibrateTap();
          const res = store.tap(activeProject.id, counterId);
          if (res) {
            // Targeted DOM update for sub-millisecond tap response
            const valEl = document.getElementById(`val-${counterId}`);
            if (valEl) valEl.textContent = res.newCount;
            // Update Undo button disabled state
            const undoBtn = document.getElementById('btn-header-undo');
            if (undoBtn) undoBtn.disabled = false;
          }
        },
        onLongPressCounter: (counterId) => {
          vibrateLongPress();
          const counter = activeProject.counters.find(c => c.id === counterId);
          if (!counter) return;

          openActionSheet({
            counter,
            onReset: () => store.resetCounter(activeProject.id, counterId),
            onEdit: (newTitle, newColor) => store.updateCounter(activeProject.id, counterId, { title: newTitle, colorHex: newColor }),
            onDelete: () => store.deleteCounter(activeProject.id, counterId)
          });
        },
        onSortChange: (mode) => store.setSortMode(mode, activeProject.id),
        onOpenSandwichMenu: () => {
          openSandwichMenu({
            project: activeProject,
            onResetAll: () => store.resetAllCounters(activeProject.id),
            onDeleteProject: () => store.deleteProject(activeProject.id)
          });
        },
        onCreateCounterPrompt: () => {
          promptNewCounter((title, colorHex) => {
            store.createCounter(activeProject.id, { title, colorHex });
          });
        }
      });
    }
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
