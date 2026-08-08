// Global Project Sandwich Menu Action Drawer Renderer
import { openModal } from './renderModal.js';
import { exportAndShareCSV } from '../csv.js';

export function openSandwichMenu({ project, onSortByCount, onSortByTitle, onResetAll, onDeleteProject }) {
  closeSandwichMenu();

  const overlay = document.createElement('div');
  overlay.className = 'action-sheet-overlay';
  overlay.id = 'active-sandwich-menu';

  overlay.innerHTML = `
    <div class="action-sheet">
      <div class="action-sheet-title">Project Options: ${escapeHtml(project.title)}</div>
      <button id="menu-sort-count-btn" class="action-sheet-item">
        <span>#️⃣</span> Sort by Count
      </button>
      <button id="menu-sort-title-btn" class="action-sheet-item">
        <span>🅰️</span> Sort by Title
      </button>
      <button id="menu-export-btn" class="action-sheet-item">
        <span>📥</span> Export CSV Summary
      </button>
      <button id="menu-reset-all-btn" class="action-sheet-item">
        <span>🔄</span> Reset All Counters to 0
      </button>
      <button id="menu-delete-project-btn" class="action-sheet-item danger">
        <span>🗑️</span> Delete Project
      </button>
      <button id="menu-cancel-btn" class="action-sheet-item" style="margin-top: 8px; justify-content: center; color: var(--text-secondary);">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const sortCountBtn = overlay.querySelector('#menu-sort-count-btn');
  const sortTitleBtn = overlay.querySelector('#menu-sort-title-btn');
  const exportBtn = overlay.querySelector('#menu-export-btn');
  const resetAllBtn = overlay.querySelector('#menu-reset-all-btn');
  const deleteProjBtn = overlay.querySelector('#menu-delete-project-btn');
  const cancelBtn = overlay.querySelector('#menu-cancel-btn');

  sortCountBtn.addEventListener('click', () => {
    closeSandwichMenu();
    if (onSortByCount) onSortByCount();
  });

  sortTitleBtn.addEventListener('click', () => {
    closeSandwichMenu();
    if (onSortByTitle) onSortByTitle();
  });

  exportBtn.addEventListener('click', () => {
    closeSandwichMenu();
    exportAndShareCSV(project);
  });

  resetAllBtn.addEventListener('click', () => {
    closeSandwichMenu();
    openModal({
      title: 'Reset All Counters',
      bodyHtml: `<p style="color: var(--text-secondary);">Are you sure you want to reset all counter categories in <strong>${escapeHtml(project.title)}</strong> to 0?</p>`,
      confirmText: 'Reset All',
      onConfirm: () => {
        if (onResetAll) onResetAll();
      }
    });
  });

  deleteProjBtn.addEventListener('click', () => {
    closeSandwichMenu();
    openModal({
      title: 'Delete Project',
      bodyHtml: `<p style="color: var(--text-secondary);">Are you sure you want to delete project <strong>${escapeHtml(project.title)}</strong>? All counts will be permanently removed.</p>`,
      confirmText: 'Delete Project',
      onConfirm: () => {
        if (onDeleteProject) onDeleteProject();
      }
    });
  });

  cancelBtn.addEventListener('click', closeSandwichMenu);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSandwichMenu();
  });
}

export function closeSandwichMenu() {
  const existing = document.getElementById('active-sandwich-menu');
  if (existing) existing.remove();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
