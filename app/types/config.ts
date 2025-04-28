// Configuration schema for form fields

export interface FormFieldConfig {
  id: string
  label: string
  placeholder?: string
  enabled: boolean
  required: boolean
  defaultValue?: string | number | boolean
  min?: number
  max?: number
  options?: { value: string; label: string; bgColor?: string; textColor?: string }[]
  helpText?: string
  order: number
  type:
    | "type_na"
    | "text"
    | "number"
    | "select"
    | "checkbox"
    | "textarea"
    | "date"
    | "time"
    | "color"
    | "measurementType"
    | "tracker" // New tracker field type
    | "calculated" // New calculated field type
  measurementType?: string
  value_na?: string
  trackerGroup?: string // Add tracker group
  isCalculated?: boolean // Flag to indicate if field is calculated
  calculationFormula?: {
    operator: "+" | "-" | "*" | "/" | "custom"
    operands: string[] // Field IDs used in the calculation
    customFormula?: string // For more complex formulas
  }
  enableTimer?: boolean
  timerFormat?: "mm:ss" | "mm:ss.t" | "hh:mm:ss"
  timerControls?: {
    start: boolean
    pause: boolean
    reset: boolean
    fullWidth: boolean
    largeDisplay: boolean
  }
  timerDisplayStyle?: {
    fontSize?: "small" | "medium" | "large"
    fontColor?: string
    backgroundColor?: string
  }
  checkboxDisplay?: string
  selectedStyle?: string
  selectDisplayType?: string
  icon?: string
  iconColor?: string
  characterLimit?: number
  showCharCount?: boolean
  bgColor?: string
  textColor?: string
  commonUnits?: string
}

export interface TabConfig {
  id: string
  label: string
  icon?: string
  enabled: boolean
  order: number
  fields: Record<string, FormFieldConfig>
}

export interface SectionConfig {
  id: string
  label: string
  enabled: boolean
  order: number
  tabs: Record<string, TabConfig>
}

export interface PageConfig {
  id: string
  label: string
  enabled: boolean
  order: number
  sections: Record<string, SectionConfig>
}

export interface AppConfig {
  // App-wide settings
  appearance: {
    darkMode: boolean
    fontSize: number
    highContrastMode: boolean
    headerText: string
    subheaderText: string
  }
  dataManagement: {
    dataRetentionDays: number
    autoBackupFrequency: number
    exportFormat: "csv" | "json" | "txt"
  }
  application: {
    defaultView: "entry" | "stats" | "data" | "resources" | "help" | "config"
    showNotifications: boolean
  }
  // Form configuration by page > section > tab > field
  pages: Record<string, PageConfig>
}

export const healthMeasurements = [
  {
    Name: "Height",
    Acronym: "HT",
    "Common Units": "cm, ft/in",
    "Common Units Full Name": "centimeters, feet and inches",
    "Entry Text": "Enter 'Height' as centimeters, feet and inches.",
  },
  {
    Name: "Weight",
    Acronym: "WT",
    "Common Units": "kg, lb",
    "Common Units Full Name": "kilograms, pounds",
    "Entry Text": "Enter 'Weight' as kilograms, pounds.",
  },
  {
    Name: "Body Mass Index",
    Acronym: "BMI",
    "Common Units": "kg/m²",
    "Common Units Full Name": "kilograms per square meter",
    "Entry Text": "BMI will be automatically calculated from height and weight.",
  },
  {
    Name: "Body Temperature",
    Acronym: "Temp",
    "Common Units": "°C, °F",
    "Common Units Full Name": "degrees Celsius, degrees Fahrenheit",
    "Entry Text": "Enter 'Body Temperature' as degrees Celsius, degrees Fahrenheit.",
  },
  {
    Name: "Heart Rate",
    Acronym: "HR",
    "Common Units": "bpm",
    "Common Units Full Name": "beats per minute",
    "Entry Text": "Enter 'Heart Rate' as beats per minute.",
  },
  {
    Name: "Respiratory Rate",
    Acronym: "RR",
    "Common Units": "breaths/min",
    "Common Units Full Name": "breaths per minute",
    "Entry Text": "Enter 'Respiratory Rate' as breaths per minute.",
  },
  {
    Name: "Blood Pressure",
    Acronym: "BP",
    "Common Units": "mmHg",
    "Common Units Full Name": "millimeters of mercury",
    "Entry Text": "Enter 'Blood Pressure' as millimeters of mercury.",
  },
  {
    Name: "Oxygen Saturation",
    Acronym: "SpO₂",
    "Common Units": "%",
    "Common Units Full Name": "percent",
    "Entry Text": "Enter 'Oxygen Saturation' as percent.",
  },
  {
    Name: "Steps",
    Acronym: "Steps",
    "Common Units": "steps",
    "Common Units Full Name": "steps",
    "Entry Text": "Enter 'Steps' as steps.",
  },
  {
    Name: "Distance",
    Acronym: "Dist",
    "Common Units": "km, miles",
    "Common Units Full Name": "kilometers, miles",
    "Entry Text": "Enter 'Distance' as kilometers, miles.",
  },
  {
    Name: "Active Minutes",
    Acronym: "AM",
    "Common Units": "minutes",
    "Common Units Full Name": "minutes",
    "Entry Text": "Enter 'Active Minutes' as minutes.",
  },
  {
    Name: "Calories Burned",
    Acronym: "Cal",
    "Common Units": "kcal",
    "Common Units Full Name": "kilocalories",
    "Entry Text": "Enter 'Calories Burned' as kilocalories.",
  },
  {
    Name: "Sleep Duration",
    Acronym: "Sleep",
    "Common Units": "hours",
    "Common Units Full Name": "hours",
    "Entry Text": "Enter 'Sleep Duration' as hours.",
  },
  {
    Name: "Urine Color",
    Acronym: "UC",
    "Common Units": "visual scale",
    "Common Units Full Name": "a color chart scale (pale yellow to dark amber)",
    "Entry Text": "Refer to a color chart and record the closest match for 'Urine Color'.",
  },
  {
    Name: "Urine Volume",
    Acronym: "UV",
    "Common Units": "mL, L",
    "Common Units Full Name": "milliliters, liters",
    "Entry Text": "Enter 'Urine Volume' as milliliters, liters.",
  },
  {
    Name: "Bowel Movements",
    Acronym: "BMF",
    "Common Units": "times/day",
    "Common Units Full Name": "times per day",
    "Entry Text": "Enter 'Bowel Movements' as times per day.",
  },
  {
    Name: "Sleep Quality",
    Acronym: "SQ",
    "Common Units": "score",
    "Common Units Full Name": "a numeric or qualitative score",
    "Entry Text": "Enter 'Sleep Quality' as a numeric or qualitative score.",
  },
  {
    Name: "Heart Rate Variability",
    Acronym: "HRV",
    "Common Units": "ms",
    "Common Units Full Name": "milliseconds",
    "Entry Text": "Enter 'Heart Rate Variability' as milliseconds.",
  },
  {
    Name: "Breathing Patterns",
    Acronym: "BPS",
    "Common Units": "events/hour",
    "Common Units Full Name": "events per hour",
    "Entry Text": "Enter 'Breathing Patterns' as events per hour.",
  },
]

// Default configuration
export const DEFAULT_CONFIG: AppConfig = {
  appearance: {
    darkMode: false,
    fontSize: 0,
    highContrastMode: false,
    headerText: "My Uro Log",
    subheaderText: "Monitor Your Urological Health",
  },
  dataManagement: {
    dataRetentionDays: 365,
    autoBackupFrequency: 10,
    exportFormat: "csv",
  },
  application: {
    defaultView: "entry",
    showNotifications: true,
  },
  pages: {
    page1: {
      id: "page1",
      label: "Entry Forms",
      enabled: true,
      order: 1,
      sections: {
        section1: {
          id: "section1",
          label: "Flow Entry",
          enabled: true,
          order: 1,
          tabs: {
            tab1: {
              id: "tab1",
              label: "UroLog",
              icon: "droplet",
              enabled: true,
              order: 1,
              fields: {
                field1: {
                  id: "field1",
                  label: "Volume (mL)",
                  placeholder: "mL",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 0,
                  max: 800,
                  order: 1,
                  type: "number",
                  measurementType: "UV",
                  value_na: "Value_na",
                  helpText: "Enter the volume in milliliters",
                },
                field2: {
                  id: "field2",
                  label: "Duration (seconds)",
                  placeholder: "Sec",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 0,
                  max: 600,
                  order: 2,
                  type: "number",
                  measurementType: "Sleep",
                  value_na: "Value_na",
                  helpText: "Enter the duration in seconds",
                  enableTimer: true,
                  timerFormat: "mm:ss.t",
                  timerControls: {
                    start: true,
                    pause: true,
                    reset: true,
                    fullWidth: true,
                    largeDisplay: true,
                  },
                  timerDisplayStyle: {
                    fontSize: "large",
                    fontColor: "text-blue-600",
                    backgroundColor: "bg-gray-100",
                  },
                },
                field3: {
                  id: "field3",
                  label: "Flow Rate (mL/s)",
                  placeholder: "mL/s",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 3,
                  type: "calculated",
                  measurementType: "UV",
                  value_na: "Value_na",
                  helpText: "Flow rate is automatically calculated",
                  isCalculated: true,
                  calculationFormula: {
                    operator: "/",
                    operands: ["field1", "field2"],
                  },
                },
                field4: {
                  id: "field4",
                  label: "Urine Color",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 4,
                  type: "color",
                  measurementType: "UC",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select color (optional)" },
                    { value: "Light Yellow", label: "Light Yellow" },
                    { value: "Clear", label: "Clear" },
                    { value: "Dark Yellow", label: "Dark Yellow" },
                    { value: "Amber or Honey", label: "Amber or Honey" },
                    { value: "Orange", label: "Orange" },
                    { value: "Pink or Red", label: "Pink or Red" },
                    { value: "Blue or Green", label: "Blue or Green" },
                    { value: "Brown or Cola-colored", label: "Brown or Cola-colored" },
                    { value: "Cloudy or Murky", label: "Cloudy or Murky" },
                    { value: "Foamy or Bubbly", label: "Foamy or Bubbly" },
                  ],
                },
                field5: {
                  id: "field5",
                  label: "Urgency Rating",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 5,
                  type: "select",
                  measurementType: "SQ",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select urgency (optional)" },
                    { value: "Normal", label: "Normal" },
                    { value: "Hour < 60 min", label: "Hour < 60 min" },
                    { value: "Hold < 15 min", label: "Hold < 15 min" },
                    { value: "Hold < 5 minutes", label: "Hold < 5 minutes" },
                    { value: "Had drips", label: "Had drips" },
                    { value: "Couldn't hold it", label: "Couldn't hold it" },
                  ],
                  icon: "clock",
                  iconColor: "purple",
                },
                field6: {
                  id: "field6",
                  label: "Stricture Symptoms",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 6,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "weak_stream", label: "Weak Stream" },
                    { value: "spraying", label: "Spraying" },
                    { value: "hesitancy", label: "Hesitancy" },
                    { value: "straining", label: "Straining" },
                    { value: "incomplete_emptying", label: "Incomplete Emptying" },
                    { value: "post_void_dribbling", label: "Post-void Dribbling" },
                    { value: "pain", label: "Pain During Urination" },
                    { value: "urinary_retention", label: "Urinary Retention" },
                  ],
                  checkboxDisplay: "list",
                  selectedStyle: "highlight",
                },
                field7: {
                  id: "field7",
                  label: "Stream Quality",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 7,
                  type: "select",
                  measurementType: "SQ",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select stream quality (optional)" },
                    { value: "normal", label: "Normal" },
                    { value: "slightly_reduced", label: "Slightly Reduced" },
                    { value: "moderately_reduced", label: "Moderately Reduced" },
                    { value: "severely_reduced", label: "Severely Reduced" },
                    { value: "intermittent", label: "Intermittent" },
                    { value: "no_stream", label: "No Stream (Retention)" },
                  ],
                  selectDisplayType: "default",
                  icon: "activity",
                  iconColor: "blue",
                },
                field8: {
                  id: "field8",
                  label: "Pain Level",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 8,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select pain level (optional)" },
                    { value: "none", label: "None" },
                    { value: "mild", label: "Mild" },
                    { value: "moderate", label: "Moderate" },
                    { value: "severe", label: "Severe" },
                    { value: "very_severe", label: "Very Severe" },
                  ],
                  selectDisplayType: "color",
                  options: [
                    {
                      value: "",
                      label: "Select pain level (optional)",
                      bgColor: "bg-white",
                      textColor: "text-gray-500",
                    },
                    { value: "none", label: "None", bgColor: "bg-green-100", textColor: "text-green-800" },
                    { value: "mild", label: "Mild", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
                    { value: "moderate", label: "Moderate", bgColor: "bg-orange-100", textColor: "text-orange-800" },
                    { value: "severe", label: "Severe", bgColor: "bg-red-100", textColor: "text-red-800" },
                    { value: "very_severe", label: "Very Severe", bgColor: "bg-red-300", textColor: "text-red-800" },
                  ],
                  icon: "thermometer",
                  iconColor: "red",
                },
                field9: {
                  id: "field9",
                  label: "Notes",
                  placeholder: "Add any additional notes about stricture symptoms...",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 9,
                  type: "textarea",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Max 256 characters",
                  characterLimit: 256,
                  showCharCount: true,
                },
              },
            },
            tab2: {
              id: "tab2",
              label: "HydroLog",
              icon: "coffee",
              enabled: true,
              order: 2,
              fields: {
                field1: {
                  id: "field1",
                  label: "Beverage Type",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select type" },
                    { value: "Water", label: "Water" },
                    { value: "Juice", label: "Juice" },
                    { value: "Tea", label: "Tea" },
                    { value: "Soda", label: "Soda" },
                    { value: "Coffee", label: "Coffee" },
                    { value: "Alcohol", label: "Alcohol" },
                    { value: "Other", label: "Other" },
                  ],
                },
                field2: {
                  id: "field2",
                  label: "Custom Beverage Type",
                  placeholder: "Enter beverage type",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 2,
                  type: "text",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field3: {
                  id: "field3",
                  label: "Amount",
                  placeholder: "Amount",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 1,
                  max: 2000,
                  order: 3,
                  type: "number",
                  measurementType: "UV",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Unit",
                  enabled: true,
                  required: true,
                  defaultValue: "mL",
                  order: 4,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "oz", label: "oz" },
                    { value: "mL", label: "mL" },
                  ],
                },
                field5: {
                  id: "field5",
                  label: "Notes",
                  placeholder: "Add any additional notes about this fluid intake...",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 5,
                  type: "textarea",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Max 256 characters",
                },
              },
            },
            tab3: {
              id: "tab3",
              label: "KegelLog",
              icon: "dumbbell",
              enabled: true,
              order: 3,
              fields: {
                field1: {
                  id: "field1",
                  label: "Reps (Number of Squeezes)",
                  placeholder: "Enter number of squeezes",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 1,
                  max: 100,
                  order: 1,
                  type: "number",
                  measurementType: "Steps",
                  value_na: "Value_na",
                },
                field2: {
                  id: "field2",
                  label: "Hold Time (seconds)",
                  placeholder: "Enter duration of each squeeze",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 1,
                  max: 60,
                  order: 2,
                  type: "number",
                  measurementType: "Sleep",
                  value_na: "Value_na",
                },
                field3: {
                  id: "field3",
                  label: "Sets (Number of Sets)",
                  placeholder: "Enter number of sets",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 1,
                  max: 20,
                  order: 3,
                  type: "number",
                  measurementType: "Steps",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Total Exercise Time",
                  placeholder: "Total seconds",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 4,
                  type: "calculated",
                  measurementType: "Sleep",
                  value_na: "Value_na",
                  isCalculated: true,
                  calculationFormula: {
                    operator: "*",
                    operands: ["field1", "field2", "field3"],
                  },
                  helpText: "Automatically calculated: Reps × Hold Time × Sets",
                },
                field5: {
                  id: "field5",
                  label: "Completed All Sets",
                  enabled: true,
                  required: false,
                  defaultValue: false,
                  order: 5,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field6: {
                  id: "field6",
                  label: "Notes",
                  placeholder: "Add any additional notes about this exercise...",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 6,
                  type: "textarea",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Max 256 characters",
                },
              },
            },
            tab4: {
              id: "tab4",
              label: "Urethral Stricture",
              icon: "alert-circle",
              enabled: true,
              order: 4,
              fields: {
                field1: {
                  id: "field1",
                  label: "Volume (mL)",
                  placeholder: "mL",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 0,
                  max: 800,
                  order: 1,
                  type: "number",
                  measurementType: "UV",
                  value_na: "Value_na",
                  helpText: "Enter the volume in milliliters",
                },
                field2: {
                  id: "field2",
                  label: "Duration (seconds)",
                  placeholder: "Sec",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 0,
                  max: 600,
                  order: 2,
                  type: "number",
                  measurementType: "Sleep",
                  value_na: "Value_na",
                  helpText: "Enter the duration in seconds",
                  enableTimer: true,
                  timerFormat: "mm:ss.t",
                  timerControls: {
                    start: true,
                    pause: true,
                    reset: true,
                    fullWidth: true,
                    largeDisplay: true,
                  },
                  timerDisplayStyle: {
                    fontSize: "large",
                    fontColor: "text-orange-600",
                    backgroundColor: "bg-gray-100",
                  },
                },
                field3: {
                  id: "field3",
                  label: "Flow Rate (mL/s)",
                  placeholder: "mL/s",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 3,
                  type: "calculated",
                  measurementType: "UV",
                  value_na: "Value_na",
                  helpText: "Flow rate is automatically calculated",
                  isCalculated: true,
                  calculationFormula: {
                    operator: "/",
                    operands: ["field1", "field2"],
                  },
                },
                field4: {
                  id: "field4",
                  label: "Urine Color",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 4,
                  type: "color",
                  measurementType: "UC",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select color (optional)" },
                    { value: "Light Yellow", label: "Light Yellow" },
                    { value: "Clear", label: "Clear" },
                    { value: "Dark Yellow", label: "Dark Yellow" },
                    { value: "Amber or Honey", label: "Amber or Honey" },
                    { value: "Orange", label: "Orange" },
                    { value: "Pink or Red", label: "Pink or Red" },
                    { value: "Blue or Green", label: "Blue or Green" },
                    { value: "Brown or Cola-colored", label: "Brown or Cola-colored" },
                    { value: "Cloudy or Murky", label: "Cloudy or Murky" },
                    { value: "Foamy or Bubbly", label: "Foamy or Bubbly" },
                  ],
                },
                field5: {
                  id: "field5",
                  label: "Urgency Rating",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 5,
                  type: "select",
                  measurementType: "SQ",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select urgency (optional)" },
                    { value: "Normal", label: "Normal" },
                    { value: "Hour < 60 min", label: "Hour < 60 min" },
                    { value: "Hold < 15 min", label: "Hold < 15 min" },
                    { value: "Hold < 5 minutes", label: "Hold < 5 minutes" },
                    { value: "Had drips", label: "Had drips" },
                    { value: "Couldn't hold it", label: "Couldn't hold it" },
                  ],
                  icon: "clock",
                  iconColor: "purple",
                },
                field6: {
                  id: "field6",
                  label: "Stricture Symptoms",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 6,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "weak_stream", label: "Weak Stream" },
                    { value: "spraying", label: "Spraying" },
                    { value: "hesitancy", label: "Hesitancy" },
                    { value: "straining", label: "Straining" },
                    { value: "incomplete_emptying", label: "Incomplete Emptying" },
                    { value: "post_void_dribbling", label: "Post-void Dribbling" },
                    { value: "pain", label: "Pain During Urination" },
                    { value: "urinary_retention", label: "Urinary Retention" },
                  ],
                  checkboxDisplay: "list",
                  selectedStyle: "highlight",
                },
                field7: {
                  id: "field7",
                  label: "Pain Level",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 8,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select pain level (optional)" },
                    { value: "none", label: "None" },
                    { value: "mild", label: "Mild" },
                    { value: "moderate", label: "Moderate" },
                    { value: "severe", label: "Severe" },
                    { value: "very_severe", label: "Very Severe" },
                  ],
                  selectDisplayType: "color",
                  icon: "thermometer",
                  iconColor: "red",
                },
                field8: {
                  id: "field8",
                  label: "Notes",
                  placeholder: "Add any additional notes about stricture symptoms...",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 9,
                  type: "textarea",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Max 256 characters",
                  characterLimit: 256,
                  showCharCount: true,
                },
              },
            },
            tab5: {
              id: "tab5",
              label: "Hydration",
              icon: "droplet",
              enabled: true,
              order: 5,
              fields: {
                field1: {
                  id: "field1",
                  label: "Beverage Type",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select type" },
                    { value: "Water", label: "Water" },
                    { value: "Juice", label: "Juice" },
                    { value: "Tea", label: "Tea" },
                    { value: "Soda", label: "Soda" },
                    { value: "Coffee", label: "Coffee" },
                    { value: "Alcohol", label: "Alcohol" },
                    { value: "Sports Drink", label: "Sports Drink" },
                    { value: "Energy Drink", label: "Energy Drink" },
                    { value: "Milk", label: "Milk" },
                    { value: "Other", label: "Other" },
                  ],
                  icon: "coffee",
                  iconColor: "blue",
                },
                field2: {
                  id: "field2",
                  label: "Custom Beverage Type",
                  placeholder: "Enter beverage type",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 2,
                  type: "text",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Specify if you selected 'Other'",
                },
                field3: {
                  id: "field3",
                  label: "Amount",
                  placeholder: "Amount",
                  enabled: true,
                  required: true,
                  defaultValue: "",
                  min: 1,
                  max: 2000,
                  order: 3,
                  type: "number",
                  measurementType: "UV",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Unit",
                  enabled: true,
                  required: true,
                  defaultValue: "mL",
                  order: 4,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "oz", label: "oz" },
                    { value: "mL", label: "mL" },
                    { value: "cups", label: "cups" },
                  ],
                },
                field5: {
                  id: "field5",
                  label: "Temperature",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 5,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select temperature (optional)" },
                    { value: "cold", label: "Cold" },
                    { value: "cool", label: "Cool" },
                    { value: "room_temp", label: "Room Temperature" },
                    { value: "warm", label: "Warm" },
                    { value: "hot", label: "Hot" },
                  ],
                  icon: "thermometer",
                  iconColor: "red",
                },
                field6: {
                  id: "field6",
                  label: "Time of Day",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 6,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "", label: "Select time of day (optional)" },
                    { value: "morning", label: "Morning" },
                    { value: "afternoon", label: "Afternoon" },
                    { value: "evening", label: "Evening" },
                    { value: "night", label: "Night" },
                    { value: "with_meal", label: "With Meal" },
                    { value: "before_meal", label: "Before Meal" },
                    { value: "after_meal", label: "After Meal" },
                  ],
                  icon: "clock",
                  iconColor: "purple",
                },
                field7: {
                  id: "field7",
                  label: "Hydration Goal",
                  placeholder: "Daily goal in mL or oz",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  min: 1,
                  max: 5000,
                  order: 7,
                  type: "number",
                  measurementType: "UV",
                  value_na: "Value_na",
                  helpText: "Set your daily hydration goal",
                },
                field8: {
                  id: "field8",
                  label: "Notes",
                  placeholder: "Add any additional notes about this hydration entry...",
                  enabled: true,
                  required: false,
                  defaultValue: "",
                  order: 8,
                  type: "textarea",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Max 256 characters",
                  characterLimit: 256,
                  showCharCount: true,
                },
              },
            },
          },
        },
      },
    },
    page2: {
      id: "page2",
      label: "Stats Configuration",
      enabled: true,
      order: 2,
      sections: {
        section1: {
          id: "section1",
          label: "Stats Display",
          enabled: true,
          order: 1,
          tabs: {
            tab1: {
              id: "tab1",
              label: "Table View",
              icon: "table",
              enabled: true,
              order: 1,
              fields: {
                field1: {
                  id: "field1",
                  label: "Default Data Source",
                  enabled: true,
                  required: true,
                  defaultValue: "both",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "flow", label: "UroLog" },
                    { value: "intake", label: "HydroLog" },
                    { value: "kegel", label: "KegelLog" },
                    { value: "both", label: "All" },
                  ],
                  helpText: "Select which data source to display by default in the table view",
                },
                field2: {
                  id: "field2",
                  label: "Default Time Period",
                  enabled: true,
                  required: true,
                  defaultValue: "all",
                  order: 2,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "week", label: "Last Week" },
                    { value: "month", label: "Last Month" },
                    { value: "year", label: "Last Year" },
                    { value: "all", label: "All Time" },
                  ],
                  helpText: "Select the default time period for the table view",
                },
                field3: {
                  id: "field3",
                  label: "Show UroLog Section",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 3,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Show HydroLog Section",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 4,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field5: {
                  id: "field5",
                  label: "Show KegelLog Section",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 5,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
              },
            },
            tab2: {
              id: "tab2",
              label: "Line Chart",
              icon: "line-chart",
              enabled: true,
              order: 2,
              fields: {
                field1: {
                  id: "field1",
                  label: "Default Metric",
                  enabled: true,
                  required: true,
                  defaultValue: "rate",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "rate", label: "Flow Rate" },
                    { value: "volume", label: "Volume" },
                    { value: "duration", label: "Duration" },
                    { value: "reps", label: "Kegel Reps" },
                    { value: "holdTime", label: "Hold Time" },
                    { value: "sets", label: "Sets" },
                    { value: "totalTime", label: "Total Time" },
                  ],
                  helpText: "Select which metric to display by default in the line chart",
                },
                field2: {
                  id: "field2",
                  label: "Default Data Source",
                  enabled: true,
                  required: true,
                  defaultValue: "flow",
                  order: 2,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "flow", label: "UroLog" },
                    { value: "intake", label: "HydroLog" },
                    { value: "kegel", label: "KegelLog" },
                    { value: "both", label: "All" },
                  ],
                  helpText: "Select which data source to display by default in the line chart",
                },
                field3: {
                  id: "field3",
                  label: "Show Data Points",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 3,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Show Min/Max Lines",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 4,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field5: {
                  id: "field5",
                  label: "Line Thickness",
                  enabled: true,
                  required: true,
                  defaultValue: "2",
                  min: 1,
                  max: 5,
                  order: 5,
                  type: "number",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  helpText: "Set the thickness of the line in pixels",
                },
              },
            },
            tab3: {
              id: "tab3",
              label: "Heatmap",
              icon: "grid",
              enabled: true,
              order: 3,
              fields: {
                field1: {
                  id: "field1",
                  label: "Default Data Source",
                  enabled: true,
                  required: true,
                  defaultValue: "flow",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "flow", label: "UroLog" },
                    { value: "intake", label: "HydroLog" },
                    { value: "kegel", label: "KegelLog" },
                  ],
                  helpText: "Select which data source to display by default in the heatmap",
                },
                field2: {
                  id: "field2",
                  label: "Default Metric",
                  enabled: true,
                  required: true,
                  defaultValue: "rate",
                  order: 2,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "rate", label: "Flow Rate" },
                    { value: "volume", label: "Volume" },
                    { value: "duration", label: "Duration" },
                  ],
                  helpText: "Select which metric to display by default in the heatmap",
                },
                field3: {
                  id: "field3",
                  label: "Show Values in Cells",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 3,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
              },
            },
            tab4: {
              id: "tab4",
              label: "Bar Chart",
              icon: "bar-chart",
              enabled: true,
              order: 4,
              fields: {
                field1: {
                  id: "field1",
                  label: "Default Data Source",
                  enabled: true,
                  required: true,
                  defaultValue: "both",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "flow", label: "UroLog" },
                    { value: "intake", label: "HydroLog" },
                    { value: "kegel", label: "KegelLog" },
                    { value: "both", label: "All" },
                  ],
                  helpText: "Select which data source to display by default in the bar chart",
                },
                field2: {
                  id: "field2",
                  label: "Group By",
                  enabled: true,
                  required: true,
                  defaultValue: "day",
                  order: 2,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "day", label: "Day" },
                    { value: "week", label: "Week" },
                    { value: "month", label: "Month" },
                    { value: "hour", label: "Hour of Day" },
                  ],
                  helpText: "Select how to group the data in the bar chart",
                },
                field3: {
                  id: "field3",
                  label: "Show Average Line",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 3,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
              },
            },
            tab5: {
              id: "tab5",
              label: "Pie Chart",
              icon: "pie-chart",
              enabled: true,
              order: 5,
              fields: {
                field1: {
                  id: "field1",
                  label: "Default Data Source",
                  enabled: true,
                  required: true,
                  defaultValue: "flow",
                  order: 1,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "flow", label: "UroLog" },
                    { value: "intake", label: "HydroLog" },
                    { value: "kegel", label: "KegelLog" },
                  ],
                  helpText: "Select which data source to display by default in the pie chart",
                },
                field2: {
                  id: "field2",
                  label: "Category",
                  enabled: true,
                  required: true,
                  defaultValue: "color",
                  order: 2,
                  type: "select",
                  measurementType: "type_na",
                  value_na: "Value_na",
                  options: [
                    { value: "color", label: "Urine Color" },
                    { value: "urgency", label: "Urgency Rating" },
                    { value: "concerns", label: "Concerns" },
                    { value: "beverage", label: "Beverage Type" },
                  ],
                  helpText: "Select which category to display in the pie chart",
                },
                field3: {
                  id: "field3",
                  label: "Show Legend",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 3,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
                field4: {
                  id: "field4",
                  label: "Show Percentages",
                  enabled: true,
                  required: false,
                  defaultValue: true,
                  order: 4,
                  type: "checkbox",
                  measurementType: "type_na",
                  value_na: "Value_na",
                },
              },
            },
          },
        },
      },
    },
  },
}

// Helper functions for configuration
export function getFieldConfig(
  pageId: string,
  sectionId: string,
  tabId: string,
  fieldId: string,
  config: AppConfig,
): FormFieldConfig | undefined {
  return config.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem("appConfig", JSON.stringify(config))
}

export function loadConfig(): AppConfig {
  const savedConfig = localStorage.getItem("appConfig")
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig) as AppConfig
    } catch (error) {
      console.error("Error parsing saved configuration:", error)
    }
  }
  return DEFAULT_CONFIG
}

export function mergeWithDefaultConfig(config: Partial<AppConfig>): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    appearance: {
      ...DEFAULT_CONFIG.appearance,
      ...(config.appearance || {}),
    },
    dataManagement: {
      ...DEFAULT_CONFIG.dataManagement,
      ...(config.dataManagement || {}),
    },
    application: {
      ...DEFAULT_CONFIG.application,
      ...(config.application || {}),
    },
    pages: {
      ...DEFAULT_CONFIG.pages,
      ...(config.pages || {}),
    },
  }
}

// Calculate field value based on formula
export function calculateFieldValue(
  formula: FormFieldConfig["calculationFormula"],
  fieldValues: Record<string, any>,
): number | null {
  if (!formula) return null

  // Check if all operands have values
  const operandValues = formula.operands.map((fieldId) => {
    const value = fieldValues[fieldId]
    return typeof value === "number" ? value : null
  })

  if (operandValues.some((value) => value === null)) return null

  // Perform calculation based on operator
  switch (formula.operator) {
    case "+":
      return operandValues.reduce((sum, value) => sum + value, 0)
    case "-":
      return operandValues.length === 2 ? operandValues[0] - operandValues[1] : null
    case "*":
      return operandValues.reduce((product, value) => product * value, 1)
    case "/":
      return operandValues.length === 2 && operandValues[1] !== 0 ? operandValues[0] / operandValues[1] : null
    case "custom":
      if (formula.customFormula) {
        try {
          // Create a safe evaluation context with only the field values
          const evalContext: Record<string, number> = {}
          formula.operands.forEach((fieldId, index) => {
            evalContext[fieldId] = operandValues[index]
          })

          // Replace field IDs with their values in the custom formula
          let evalFormula = formula.customFormula
          for (const fieldId of formula.operands) {
            evalFormula = evalFormula.replace(new RegExp(fieldId, "g"), evalContext[fieldId].toString())
          }

          // Use Function constructor for safer evaluation
          const result = new Function(`return ${evalFormula}`)()
          return typeof result === "number" ? result : null
        } catch (error) {
          console.error("Error evaluating custom formula:", error)
          return null
        }
      }
      return null
    default:
      return null
  }
}
