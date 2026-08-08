import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState, STORAGE_KEY, INITIAL_STATE } from './storage.js';

// Mock localStorage implementation for Node test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}

test('loadState returns INITIAL_STATE when storage is empty', () => {
  const mockStorage = new MockLocalStorage();
  const state = loadState(mockStorage);
  assert.deepEqual(state, INITIAL_STATE);
});

test('saveState and loadState persist and retrieve state correctly', () => {
  const mockStorage = new MockLocalStorage();
  const testState = {
    activeProjectId: 'proj_123',
    projects: {
      proj_123: { id: 'proj_123', title: 'Test Project', counters: [], events: [] }
    }
  };

  const saved = saveState(testState, mockStorage);
  assert.equal(saved, true);

  const loaded = loadState(mockStorage);
  assert.deepEqual(loaded, testState);
});

test('loadState recovers gracefully from corrupted JSON in storage', () => {
  const mockStorage = new MockLocalStorage();
  mockStorage.setItem(STORAGE_KEY, '{ invalid json corrupted string ...');

  const state = loadState(mockStorage);
  assert.deepEqual(state, INITIAL_STATE);
});
