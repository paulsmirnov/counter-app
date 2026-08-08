// Projects Hub Screen Renderer (Screen A)
import { ICON_PLUS } from './icons.js';

export function renderHub(container, state, callbacks = {}) {
  const { onSelectProject, onCreateProjectPrompt } = callbacks;
  const projectList = Object.values(state.projects || {});

  let html = `
    <header class="app-header">
      <div class="header-left">
        <h1 class="header-title">Counter Collections</h1>
      </div>
      <div class="header-right">
        <button id="btn-new-project-header" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
          <span style="display: inline-flex; width: 14px; height: 14px;">${ICON_PLUS}</span> New
        </button>
      </div>
    </header>
    <main class="app-content">
  `;

  html += `<div class="projects-grid anim-fade">`;

  projectList.forEach((project) => {
    const totalCount = (project.counters || []).reduce((sum, c) => sum + (c.count || 0), 0);
    const catCount = (project.counters || []).length;

    html += `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-card-header">
          <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
          <span class="project-card-badge">${totalCount} items</span>
        </div>
        <div class="project-card-stats">
          <span>${catCount} ${catCount === 1 ? 'category' : 'categories'}</span>
        </div>
      </div>
    `;
  });

  // Inline Creation Tile
  html += `
      <div id="btn-new-project-tile" class="creation-card">
        <span class="creation-icon">${ICON_PLUS}</span>
        <span class="creation-label">New Project</span>
      </div>
    </div>
  `;

  html += `</main>`;
  container.innerHTML = html;

  // Bind Event Listeners
  const headerBtn = container.querySelector('#btn-new-project-header');
  if (headerBtn) headerBtn.addEventListener('click', onCreateProjectPrompt);

  const tileBtn = container.querySelector('#btn-new-project-tile');
  if (tileBtn) tileBtn.addEventListener('click', onCreateProjectPrompt);

  container.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-project-id');
      if (onSelectProject) onSelectProject(pid);
    });
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
