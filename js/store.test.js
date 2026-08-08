import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from './store.js';

test('Project CRUD operations in store', () => {
  // Create Project
  const project = store.createProject('Parking Survey');
  assert.notEqual(project, null);
  assert.equal(project.title, 'Parking Survey');
  assert.equal(store.getState().activeProjectId, project.id);

  // Update Project
  const updated = store.updateProject(project.id, { title: 'Updated Survey' });
  assert.equal(updated, true);
  assert.equal(store.getState().projects[project.id].title, 'Updated Survey');

  // Delete Project
  const deleted = store.deleteProject(project.id);
  assert.equal(deleted, true);
  assert.equal(store.getState().projects[project.id], undefined);
  assert.equal(store.getState().activeProjectId, null);
});

test('Counter CRUD, tap increment, and Undo event history', () => {
  const project = store.createProject('Vehicle Counter');
  const counter1 = store.createCounter(project.id, { title: 'Toyota', colorHex: '#38bdf8' });
  const counter2 = store.createCounter(project.id, { title: 'Honda', colorHex: '#34d399' });

  assert.notEqual(counter1, null);
  assert.equal(counter1.count, 0);
  assert.equal(counter2.count, 0);

  // Tap counter1 twice, counter2 once
  store.tap(project.id, counter1.id);
  store.tap(project.id, counter1.id);
  store.tap(project.id, counter2.id);

  let pState = store.getState().projects[project.id];
  let c1 = pState.counters.find(c => c.id === counter1.id);
  let c2 = pState.counters.find(c => c.id === counter2.id);

  assert.equal(c1.count, 2);
  assert.equal(c2.count, 1);
  assert.equal(pState.events.length, 3);

  // Undo last tap (counter2)
  const undo1 = store.undo(project.id);
  assert.equal(undo1, true);

  pState = store.getState().projects[project.id];
  c2 = pState.counters.find(c => c.id === counter2.id);
  assert.equal(c2.count, 0);
  assert.equal(pState.events.length, 2);

  // Undo second tap (counter1)
  const undo2 = store.undo(project.id);
  assert.equal(undo2, true);

  pState = store.getState().projects[project.id];
  c1 = pState.counters.find(c => c.id === counter1.id);
  assert.equal(c1.count, 1);
  assert.equal(pState.events.length, 1);

  // Clean up
  store.deleteProject(project.id);
});

test('Sorting by count updates orderIndex permanently', () => {
  const project = store.createProject('Sort Test Project');
  const c1 = store.createCounter(project.id, { title: 'Alfa' });
  const c2 = store.createCounter(project.id, { title: 'Beta' });

  store.tap(project.id, c2.id);
  store.tap(project.id, c2.id); // c2 has count 2
  store.tap(project.id, c1.id); // c1 has count 1

  store.setSortMode('count', project.id);

  const pState = store.getState().projects[project.id];
  assert.equal(pState.counters[0].id, c2.id);
  assert.equal(pState.counters[0].orderIndex, 0);
  assert.equal(pState.counters[1].id, c1.id);
  assert.equal(pState.counters[1].orderIndex, 1);

  store.deleteProject(project.id);
});
