// Contextual Action Sheet Bottom Drawer Renderer
import { promptNewCounter, openModal } from './renderModal.js';

export function openActionSheet({ counter, onReset, onEdit, onDelete }) {
  closeActionSheet();

  const overlay = document.createElement('div');
  overlay.className = 'action-sheet-overlay';
  overlay.id = 'active-action-sheet';

  overlay.innerHTML = `
    <div class="action-sheet">
      <div class="action-sheet-title">${escapeHtml(counter.title)} (${counter.count})</div>
      <button id="sheet-reset-btn" class="action-sheet-item">
        <span>🔄</span> Reset Count to 0
      </button>
      <button id="sheet-edit-btn" class="action-sheet-item">
        <span>✏️</span> Edit Title & Accent Color
      </button>
      <button id="sheet-delete-btn" class="action-sheet-item danger">
        <span>🗑️</span> Delete Category
      </button>
      <button id="sheet-cancel-btn" class="action-sheet-item" style="margin-top: 8px; justify-content: center; color: var(--text-secondary);">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const resetBtn = overlay.querySelector('#sheet-reset-btn');
  const editBtn = overlay.querySelector('#sheet-edit-btn');
  const deleteBtn = overlay.querySelector('#sheet-delete-btn');
  const cancelBtn = overlay.querySelector('#sheet-cancel-btn');

  resetBtn.addEventListener('click', () => {
    closeActionSheet();
    if (onReset) onReset();
  });

  editBtn.addEventListener('click', () => {
    closeActionSheet();
    promptEditCounter(counter, onEdit);
  });

  deleteBtn.addEventListener('click', () => {
    closeActionSheet();
    openModal({
      title: 'Delete Category',
      bodyHtml: `<p style="color: var(--text-secondary);">Are you sure you want to delete <strong>${escapeHtml(counter.title)}</strong>?</p>`,
      confirmText: 'Delete',
      onConfirm: () => {
        if (onDelete) onDelete();
      }
    });
  });

  cancelBtn.addEventListener('click', closeActionSheet);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeActionSheet();
  });
}

export function closeActionSheet() {
  const existing = document.getElementById('active-action-sheet');
  if (existing) existing.remove();
}

function promptEditCounter(counter, onConfirm) {
  const COLOR_PRESETS = [
    '#38bdf8', '#34d399', '#fbbf24', '#f43f5e',
    '#c084fc', '#2dd4bf', '#fb923c', '#818cf8'
  ];

  let selectedColor = counter.colorHex || COLOR_PRESETS[0];

  const colorOptionsHtml = COLOR_PRESETS.map((color) => `
    <div class="color-option ${color === selectedColor ? 'selected' : ''}" data-color="${color}" style="background-color: ${color};"></div>
  `).join('');

  openModal({
    title: 'Edit Category',
    bodyHtml: `
      <div class="form-group">
        <label class="form-label" for="counter-edit-input">Category Title</label>
        <input type="text" id="counter-edit-input" class="form-input" value="${escapeHtml(counter.title)}" maxlength="30">
      </div>
      <div class="form-group">
        <label class="form-label">Accent Color</label>
        <div class="color-picker-grid" id="edit-color-picker-grid">
          ${colorOptionsHtml}
        </div>
      </div>
    `,
    confirmText: 'Save Changes',
    onConfirm: (overlay) => {
      const val = overlay.querySelector('#counter-edit-input').value.trim();
      if (!val) return false;
      if (onConfirm) onConfirm(val, selectedColor);
    }
  });

  setTimeout(() => {
    const grid = document.getElementById('edit-color-picker-grid');
    if (grid) {
      grid.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
          grid.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedColor = opt.getAttribute('data-color');
        });
      });
    }
  }, 50);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
