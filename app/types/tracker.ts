// types/tracker.ts

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

// Update the base entry interface to include isDemo
export interface BaseEntry {
  id: string
  timestamp: string
  isDemo?: boolean // Add the isDemo field as optional for backward compatibility
}

// Update any specific entry types that extend BaseEntry
export interface UroLog extends BaseEntry {
  volume: number
  duration: number
  flowRate: number
  color: string
  concerns: string[]
  urgency: number
  notes: string
}

export interface HydroLog extends BaseEntry {
  volume: number
  type: string
  notes: string
}

export interface KegelLog extends BaseEntry {
  duration: number
  intensity: number
  sets: number
  notes: string
}

export interface FieldDefinition {
  id: string
  label: string
  type: string
  required?: boolean
  options?: string[]
}

export interface TabConfig {
  name: string
  fields: string[]
}

// For dynamic entries, ensure isDemo is included
export interface DynamicEntry extends BaseEntry {
  entryType: string
  fields: Record<string, any>
  config?: {
    fieldDefinitions: FieldDefinition[]
    tabConfig: TabConfig
  }
}
