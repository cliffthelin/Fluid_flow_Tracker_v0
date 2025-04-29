// Default tracker data to use as fallback
const defaultTrackerData: Record<string, any[]> = {
  "Health Measurements": [
    {
      Name: "Urine Volume",
      Acronym: "UV",
      "Common Units": "mL, oz",
      "Common Units Full Name": "milliliters, ounces",
      "Entry Text": "Enter the volume of urine",
      IsActive: true,
    },
    {
      Name: "Void Time",
      Acronym: "VT",
      "Common Units": "sec, min",
      "Common Units Full Name": "seconds, minutes",
      "Entry Text": "Enter the time taken to void",
      IsActive: true,
    },
    {
      Name: "Urine Flow Rate",
      Acronym: "UFR",
      "Common Units": "mL/sec",
      "Common Units Full Name": "milliliters per second",
      "Entry Text": "Enter the urine flow rate",
      IsActive: true,
    },
  ],
  "Urethral Stricture Measurements": [
    {
      Name: "Stricture Length",
      Acronym: "SL",
      "Common Units": "cm, mm",
      "Common Units Full Name": "centimeters, millimeters",
      "Entry Text": "Enter the stricture length",
      IsActive: true,
    },
    {
      Name: "Stricture Location",
      Acronym: "SLOC",
      "Common Units": "position",
      "Common Units Full Name": "anatomical position",
      "Entry Text": "Enter the stricture location",
      IsActive: true,
    },
  ],
  "Sleep Tracking": [
    {
      Name: "Sleep Duration",
      Acronym: "SD",
      "Common Units": "hours",
      "Common Units Full Name": "hours of sleep",
      "Entry Text": "Enter the total hours of sleep",
      IsActive: true,
    },
    {
      Name: "Sleep Quality",
      Acronym: "SQ",
      "Common Units": "1-10",
      "Common Units Full Name": "scale from 1 to 10",
      "Entry Text": "Rate your sleep quality from 1 (poor) to 10 (excellent)",
      IsActive: true,
    },
  ],
  "Medication Tracking": [
    {
      Name: "Medication Name",
      Acronym: "MN",
      "Common Units": "text",
      "Common Units Full Name": "name of medication",
      "Entry Text": "Enter the name of the medication",
      IsActive: true,
    },
    {
      Name: "Dosage",
      Acronym: "DOS",
      "Common Units": "mg",
      "Common Units Full Name": "milligrams",
      "Entry Text": "Enter the dosage in milligrams",
      IsActive: true,
    },
  ],
  "ADHD Moment Tracking": [
    {
      Name: "Trigger",
      Acronym: "TRG",
      "Common Units": "text",
      "Common Units Full Name": "description of trigger",
      "Entry Text": "Describe what triggered the ADHD moment",
      IsActive: true,
    },
    {
      Name: "Duration",
      Acronym: "DUR",
      "Common Units": "minutes",
      "Common Units Full Name": "minutes",
      "Entry Text": "Enter how long the moment lasted",
      IsActive: true,
    },
    {
      Name: "Intensity",
      Acronym: "INT",
      "Common Units": "1-10",
      "Common Units Full Name": "scale from 1 to 10",
      "Entry Text": "Rate the intensity from 1 (mild) to 10 (severe)",
      IsActive: true,
    },
  ],
}

/**
 * Loads tracker data with priority: JSON file first, then localStorage additions
 */
export async function loadTrackerData(): Promise<Record<string, any[]>> {
  try {
    let baseData: Record<string, any[]> = {}
    let localData: Record<string, any[]> | null = null

    // First check if we have data in localStorage
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("trackerData")
      if (storedData) {
        try {
          localData = JSON.parse(storedData)
          console.log("Found tracker data in localStorage")
        } catch (e) {
          console.error("Error parsing stored tracker data:", e)
        }
      }
    }

    // If we already have local data, use it as the base
    if (localData) {
      baseData = localData
    } else {
      // If no local data, use the default data
      baseData = { ...defaultTrackerData }
      console.log("Using default tracker data as base")
    }

    // Store the data back to localStorage for future use
    if (typeof window !== "undefined") {
      localStorage.setItem("trackerData", JSON.stringify(baseData))
    }

    return baseData
  } catch (error) {
    console.error("Error in loadTrackerData:", error)
    return defaultTrackerData
  }
}

/**
 * Saves tracker data to localStorage
 */
export function saveTrackerData(data: Record<string, any[]>): boolean {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("trackerData", JSON.stringify(data))
      console.log("Tracker data saved successfully")
      return true
    }
    return false
  } catch (error) {
    console.error("Error saving tracker data:", error)
    return false
  }
}

/**
 * Resets tracker data to defaults
 */
export async function resetTrackerData(): Promise<Record<string, any[]>> {
  // Reset to default data
  if (typeof window !== "undefined") {
    localStorage.setItem("trackerData", JSON.stringify(defaultTrackerData))
  }
  return defaultTrackerData
}

/**
 * Gets all active trackers across all groups
 */
export function getActiveTrackers(): { group: string; items: any[] }[] {
  try {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("trackerData")
      if (storedData) {
        const data = JSON.parse(storedData)
        const activeTrackers: { group: string; items: any[] }[] = []

        Object.entries(data).forEach(([group, items]) => {
          const activeItems = (items as any[]).filter((item) => item.IsActive !== false)
          if (activeItems.length > 0) {
            activeTrackers.push({
              group,
              items: activeItems,
            })
          }
        })

        return activeTrackers
      }
    }
    return []
  } catch (error) {
    console.error("Error getting active trackers:", error)
    return []
  }
}

/**
 * Attempts to load tracker data from a JSON file
 * This is a separate function that can be called if needed
 * but is not used in the main loadTrackerData flow due to issues
 */
export async function loadTrackerDataFromFile(path: string): Promise<Record<string, any[]> | null> {
  try {
    if (typeof window !== "undefined") {
      console.log(`Attempting to load tracker data from ${path}...`)

      const response = await fetch(path, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
      }

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON but got ${contentType}`)
      }

      const data = await response.json()
      console.log(`Successfully loaded tracker data from ${path}`)
      return data
    }
    return null
  } catch (error) {
    console.error(`Error loading tracker data from ${path}:`, error)
    return null
  }
}
