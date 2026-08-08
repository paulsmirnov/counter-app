import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCSV, escapeCsvCell } from './csv.js';

test('escapeCsvCell RFC 4180 rules', () => {
  assert.equal(escapeCsvCell('Simple Title'), 'Simple Title');
  assert.equal(escapeCsvCell('Title, with comma'), '"Title, with comma"');
  assert.equal(escapeCsvCell('Title with "quotes"'), '"Title with ""quotes"""');
  assert.equal(escapeCsvCell('Title with\nnewline'), '"Title with\nnewline"');
});

test('generateCSV creates correct structure and summary totals', () => {
  const mockProject = {
    id: 'p1',
    title: 'Parking Lot Survey',
    counters: [
      { id: 'c1', title: 'Toyota', count: 34 },
      { id: 'c2', title: 'Honda, Civic', count: 21 },
      { id: 'c3', title: 'Ford', count: 18 }
    ]
  };

  const csv = generateCSV(mockProject);

  assert.match(csv, /^Project Title,Parking Lot Survey/);
  assert.match(csv, /Total Items Counted,73/);
  assert.match(csv, /Category Title,Total Count/);
  assert.match(csv, /Toyota,34/);
  assert.match(csv, /"Honda, Civic",21/);
  assert.match(csv, /Ford,18/);
});
