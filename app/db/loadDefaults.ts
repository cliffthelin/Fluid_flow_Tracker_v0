import { db } from './index';
import type { TrackerRepo } from '~/types/tracker';

/**
 * Adds tracker groups and entries into Dexie.
 * Avoids duplicates by checking name+group combo.
 */
export async function loadDefaultsToDexie(data: TrackerRepo) {
  for (const group of Object.keys(data)) {
    const entries = data[group];

    for (const entry of entries) {
      const exists = await db.customTrackers
        .where({ group, Name: entry.Name })
        .first();

      if (!exists) {
        await db.customTrackers.add({ ...entry, group });
      }
    }
  }
}
