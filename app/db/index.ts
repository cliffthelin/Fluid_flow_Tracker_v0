import Dexie, { type Table } from "dexie"
import type { TrackerEntry } from "~/types/tracker"

export interface TrackerEntryDB extends TrackerEntry {
  id?: number // Dexie auto-increment ID
  group: string // Group name from TrackerRepo key
}

class TrackerDatabase extends Dexie {
  customTrackers!: Table<TrackerEntryDB, number>

  constructor() {
    super("trackerAppDB")
    this.version(1).stores({
      customTrackers: "++id, group, Name", // Indexed by id, searchable by group & Name
    })
  }
}

export const db = new TrackerDatabase()
