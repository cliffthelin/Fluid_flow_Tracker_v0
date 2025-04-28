// src/db/trackerDb.ts or app/db/trackerDb.ts

import Dexie, { Table } from 'dexie';
import type { TrackerEntry } from '~/types/tracker';

export interface CustomTracker extends TrackerEntry {
  group: string; // e.g., "Sleep Tracking"
  id?: number;   // Dexie auto-incremented primary key
}

export class TrackerDB extends Dexie {
  customTrackers!: Table<CustomTracker, number>;

  constructor() {
    super('trackerDB');
    this.version(1).stores({
      customTrackers: '++id, group, Name, Acronym'
    });
  }
}

export const db = new TrackerDB();
