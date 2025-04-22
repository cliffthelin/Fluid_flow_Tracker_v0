export interface UroLog {
  timestamp: string
  volume: number
  duration: number
  flowRate: number
  color?: string
  urgency?: string
  concerns?: string[]
  notes?: string
  isDemo?: boolean // Add isDemo field
}

export interface HydroLogEntry {
  timestamp: string
  type: HydroLogType
  customType?: string
  amount: number
  unit: "oz" | "mL"
  notes?: string
  isDemo?: boolean // Add isDemo field
}

export type HydroLogType = "Water" | "Juice" | "Tea" | "Soda" | "Coffee" | "Alcohol" | "Other" | ""

export type UrineColor =
  | "Light Yellow"
  | "Clear"
  | "Dark Yellow"
  | "Amber or Honey"
  | "Orange"
  | "Pink or Red"
  | "Blue or Green"
  | "Brown or Cola-colored"
  | "Cloudy or Murky"
  | "Foamy or Bubbly"
  | ""

export type UrgencyRating = "Normal" | "Hour < 60 min" | "Hold < 15 min" | "Had drips" | "Couldn't hold it" | ""

export type ConcernType =
  | "Straining"
  | "Dribbling"
  | "Frequent urges"
  | "Incomplete emptying"
  | "Waking just to pee"
  | "Pain"
  | "Burning"
  | "Blood"

export interface CustomResource {
  id: string
  title: string
  url: string
  category: string
}

export type FlowEntry = UroLog
export type FluidIntakeEntry = HydroLogEntry
export type HydroLog = HydroLogEntry
export type FluidType = HydroLogType
