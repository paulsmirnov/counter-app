// Counter Grid Screen Renderer (Screen B)
export function renderGrid(container, project, state, callbacks = {}) {
  const {
    onBackToHub,
    onUndo,
    onTapCounter,
    onLongPressCounter,
    onOpenSandwichMenu,
    onCreateCounterPrompt
  } = callbacks;

  if (!project) return;

  const canUndo = project.events && project.events.length > 0;
  const counters = [...(project.counters || [])];

  let html = `
    <header class="app-header">
      <div class="header-left">
        <button id="btn-header-back" class="btn-icon" title="Back to Projects Hub">←</button>
        <h1 class="header-title">${escapeHtml(project.title)}</h1>
      </div>
      <div class="header-right">
        <button id="btn-header-undo" class="btn-undo" ${!canUndo ? 'disabled' : ''} title="Undo Last Tap">
          <span>↩</span> Undo
        </button>
        <button id="btn-header-menu" class="btn-icon" title="Project Actions">⋮</button>
      </div>
    </header>
    <main class="app-content">
  `;

  html += `<div class="counter-grid anim-fade">`;

  counters.forEach((counter) => {
    const color = counter.colorHex || '#38bdf8';
    html += `
      <div class="counter-card" data-counter-id="${counter.id}" style="--card-accent: ${color};">
        <span class="counter-title">${escapeHtml(counter.title)}</span>
        <span class="counter-value" id="val-${counter.id}">${counter.count}</span>
      </div>
    `;
  });

  // Inline Creation Tile at end of grid
  html += `
      <div id="btn-new-counter-tile" class="creation-card">
        <span class="creation-icon">+</span>
        <span class="creation-label">Add Category</span>
      </div>
    </div>
  `;

  html += `</main>`;
  container.innerHTML = html;

  // Bind Header Listeners
  const backBtn = container.querySelector('#btn-header-back');
  if (backBtn) backBtn.addEventListener('click', onBackToHub);

  const undoBtn = container.querySelector('#btn-header-undo');
  if (undoBtn) undoBtn.addEventListener('click', onUndo);

  const menuBtn = container.querySelector('#btn-header-menu');
  if (menuBtn) menuBtn.addEventListener('click', onOpenSandwichMenu);

  const tileBtn = container.querySelector('#btn-new-counter-tile');
  if (tileBtn) tileBtn.addEventListener('click', onCreateCounterPrompt);

  // Bind Counter Cards Touch & Long-Press
  container.querySelectorAll('.counter-card').forEach(card => {
    const counterId = card.getAttribute('data-counter-id');
    let timer = null;
    let isLongPress = false;

    const startPress = () => {
      isLongPress = false;
      timer = setTimeout(() => {
        isLongPress = true;
        if (onLongPressCounter) onLongPressCounter(counterId);
      }, 500);
    };

    const endPress = (e) => {
      if (timer) clearTimeout(timer);
      if (!isLongPress && onTapCounter) {
        // Single tap increment
        card.classList.remove('anim-pulse');
        void card.offsetWidth; // Trigger reflow for animation restart
        card.classList.add('anim-pulse');
        onTapCounter(counterId);
      }
    };

    const cancelPress = () => {
      if (timer) clearTimeout(timer);
    };

    card.addEventListener('pointerdown', startPress);
    card.addEventListener('pointerup', endPress);
    card.addEventListener('pointercancel', cancelPress);
    card.addEventListener('pointerleave', cancelPress);
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
