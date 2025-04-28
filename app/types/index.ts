export interface HydroLog {
  timestamp: string
  type: string
  customType?: string
  amount: number
  unit: string
  temperature?: string
  timeOfDay?: string
  goal?: number
  notes?: string
}
