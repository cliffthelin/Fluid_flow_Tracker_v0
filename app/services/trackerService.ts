import type { TrackerCategory } from "../types"

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
 * Loads tracker data from the specified path or uses default data
 */
export async function loadTrackerData(): Promise<Record<string, TrackerCategory[]>> {
  try {
    // Try to load from localStorage first if available
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("trackerData")
      if (storedData) {
        try {
          return JSON.parse(storedData)
        } catch (e) {
          console.error("Error parsing stored tracker data:", e)
          // Continue to fetch from file if localStorage parsing fails
        }
      }
    }

    // Try to fetch from file - use the correct path relative to public directory
    try {
      // Use a relative path from the root of the site, not from the app directory
      const response = await fetch("/data/Tracker_List.json")

      // Check if the response is OK and is actually JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON but got ${contentType}`)
      }

      const text = await response.text()

      // Validate JSON before parsing
      try {
        const data = JSON.parse(text)
        // Store valid data in localStorage for future use
        if (typeof window !== "undefined") {
          localStorage.setItem("trackerData", JSON.stringify(data))
        }
        return data
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error(`Invalid JSON: ${parseError.message}`)
      }
    } catch (fetchError) {
      console.error("Error fetching tracker data:", fetchError)
      console.log("Using default tracker data instead")

      // Always use the defaultTrackerData when fetch fails
      return defaultTrackerData
    }
  } catch (error) {
    console.error("Error in loadTrackerData:", error)
    return defaultTrackerData
  }
}

/**
 * Saves tracker data to localStorage
 */
export function saveTrackerData(data: Record<string, TrackerCategory[]>): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("trackerData", JSON.stringify(data))
    }
  } catch (error) {
    console.error("Error saving tracker data:", error)
  }
}

/**
 * Resets tracker data to defaults
 */
export function resetTrackerData(): Record<string, any[]> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("trackerData")
  }
  return defaultTrackerData
}
