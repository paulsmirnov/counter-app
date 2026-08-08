// Modal Dialog Renderer Utility

const COLOR_PRESETS = [
  '#38bdf8', // Blue
  '#34d399', // Green
  '#fbbf24', // Amber
  '#f43f5e', // Rose
  '#c084fc', // Purple
  '#2dd4bf', // Teal
  '#fb923c', // Orange
  '#818cf8'  // Indigo
];

export function openModal({ title, bodyHtml, confirmText = 'Create', onConfirm, onCancel }) {
  closeModal(); // Close any existing modal

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal-overlay';

  overlay.innerHTML = `
    <div class="modal-dialog">
      <h2 class="modal-header">${escapeHtml(title)}</h2>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">
        <button id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
        <button id="modal-confirm-btn" class="btn btn-primary">${escapeHtml(confirmText)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const confirmBtn = overlay.querySelector('#modal-confirm-btn');
  const cancelBtn = overlay.querySelector('#modal-cancel-btn');
  const input = overlay.querySelector('input');

  if (input) {
    setTimeout(() => input.focus(), 100);
  }

  const handleConfirm = () => {
    if (onConfirm) {
      const result = onConfirm(overlay);
      if (result !== false) closeModal();
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handleCancel();
  });
}

export function closeModal() {
  const existing = document.getElementById('active-modal-overlay');
  if (existing) {
    existing.remove();
  }
}

export function promptNewProject(onConfirm) {
  openModal({
    title: 'New Project',
    bodyHtml: `
      <div class="form-group">
        <label class="form-label" for="project-title-input">Project Title</label>
        <input type="text" id="project-title-input" class="form-input" placeholder="e.g. Parking Lot Survey" maxlength="40">
      </div>
    `,
    confirmText: 'Create Project',
    onConfirm: (overlay) => {
      const val = overlay.querySelector('#project-title-input').value.trim();
      if (!val) return false;
      onConfirm(val);
    }
  });
}

export function promptNewCounter(onConfirm) {
  let selectedColor = COLOR_PRESETS[0];

  const colorOptionsHtml = COLOR_PRESETS.map((color, i) => `
    <div class="color-option ${i === 0 ? 'selected' : ''}" data-color="${color}" style="background-color: ${color};"></div>
  `).join('');

  openModal({
    title: 'New Counter Category',
    bodyHtml: `
      <div class="form-group">
        <label class="form-label" for="counter-title-input">Category Title</label>
        <input type="text" id="counter-title-input" class="form-input" placeholder="e.g. Toyota" maxlength="30">
      </div>
      <div class="form-group">
        <label class="form-label">Accent Color</label>
        <div class="color-picker-grid" id="color-picker-grid">
          ${colorOptionsHtml}
        </div>
      </div>
    `,
    confirmText: 'Add Category',
    onConfirm: (overlay) => {
      const val = overlay.querySelector('#counter-title-input').value.trim();
      if (!val) return false;
      onConfirm(val, selectedColor);
    }
  });

  // Color picker selection handler
  setTimeout(() => {
    const grid = document.getElementById('color-picker-grid');
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
