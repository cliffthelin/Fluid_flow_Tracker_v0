export interface MeasurementOption {
  Name: string
  Acronym: string
  "Common Units": string
}

export const MEASUREMENT_OPTIONS: MeasurementOption[] = [
  { Name: "Height", Acronym: "HT", "Common Units": "cm, ft/in" },
  { Name: "Weight", Acronym: "WT", "Common Units": "kg, lb" },
  { Name: "Body Mass Index", Acronym: "BMI", "Common Units": "kg/m²" },
  { Name: "Body Temperature", Acronym: "Temp", "Common Units": "°C, °F" },
  { Name: "Heart Rate", Acronym: "HR", "Common Units": "bpm" },
  { Name: "Respiratory Rate", Acronym: "RR", "Common Units": "breaths/min" },
  { Name: "Blood Pressure", Acronym: "BP", "Common Units": "mmHg" },
  { Name: "Oxygen Saturation", Acronym: "SpO₂", "Common Units": "%" },
  { Name: "Steps", Acronym: "Steps", "Common Units": "steps" },
  { Name: "Distance", Acronym: "Dist", "Common Units": "km, miles" },
  { Name: "Active Minutes", Acronym: "AM", "Common Units": "minutes" },
  { Name: "Calories Burned", Acronym: "Cal", "Common Units": "kcal" },
  { Name: "Sleep Duration", Acronym: "Sleep", "Common Units": "hours" },
  { Name: "Urine Color", Acronym: "UC", "Common Units": "visual scale" },
  { Name: "Urine Volume", Acronym: "UV", "Common Units": "mL, L" },
  { Name: "Bowel Movements", Acronym: "BMF", "Common Units": "times/day" },
  { Name: "Sleep Quality", Acronym: "SQ", "Common Units": "score" },
  { Name: "Heart Rate Variability", Acronym: "HRV", "Common Units": "ms" },
  { Name: "Breathing Patterns", Acronym: "BPS", "Common Units": "events/hour" },
  { Name: "Other: Currency", Acronym: "CUR", "Common Units": "USD, EUR, GBP" },
  { Name: "Other: CustomList", Acronym: "CList", "Common Units": "item1, item2, item3" },
  { Name: "Other: Number", Acronym: "Num", "Common Units": "number" },
  { Name: "Other: Quantity", Acronym: "Qty", "Common Units": "units" },
  { Name: "Other: Pain Level", Acronym: "Pain", "Common Units": "1-10" },
  { Name: "Other: Frequency", Acronym: "Freq", "Common Units": "times/day, times/week" },
]

// Helper function to get a measurement by name
export function getMeasurementByName(name: string): MeasurementOption | undefined {
  return MEASUREMENT_OPTIONS.find((option) => option.Name === name)
}

// Helper function to get a measurement by acronym
export function getMeasurementByAcronym(acronym: string): MeasurementOption | undefined {
  return MEASUREMENT_OPTIONS.find((option) => option.Acronym === acronym)
}

// Helper function to get common units for a measurement
export function getCommonUnitsForMeasurement(nameOrAcronym: string): string | undefined {
  const byName = getMeasurementByName(nameOrAcronym)
  if (byName) return byName["Common Units"]

  const byAcronym = getMeasurementByAcronym(nameOrAcronym)
  if (byAcronym) return byAcronym["Common Units"]

  return undefined
}
