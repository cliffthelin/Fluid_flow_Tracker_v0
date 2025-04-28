// app/types/tracker.ts

export interface TrackerEntry {
  Name: string
  Acronym?: string
  CommonUnits?: string
  CommonUnitsFullName?: string
  EntryText?: string
  isSystem?: boolean // true = part of default Tracker_List.json
  [key: string]: any // for future extensibility
}

export type TrackerRepo = Record<string, TrackerEntry[]>
