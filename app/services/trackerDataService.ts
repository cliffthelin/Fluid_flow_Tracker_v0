import { sanitizeJson } from "../utils/sanitizeJson"

/**
 * Service for handling tracker data operations
 */
export const TrackerDataService = {
  /**
   * Loads tracker data from the specified file
   * @param path Path to the JSON file
   * @returns Parsed tracker data
   */
  async loadTrackerData(path = "/data/Tracker_List.json") {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
      }

      const jsonText = await response.text()
      const sanitizedJson = sanitizeJson(jsonText)

      try {
        return JSON.parse(sanitizedJson)
      } catch (parseError) {
        console.error(`Error parsing ${path}:`, parseError)
        throw new Error(`Failed to parse ${path}: ${parseError.message}`)
      }
    } catch (error) {
      console.error(`Error loading tracker data from ${path}:`, error)

      // Try loading from backup if main file fails
      if (path === "/data/Tracker_List.json") {
        console.log("Attempting to load from backup...")
        return this.loadTrackerData("/data/Tracker_List_backup.json")
      }

      // If both fail, return empty object
      return {}
    }
  },

  /**
   * Saves tracker data to localStorage (since we can't write to files directly)
   * @param data The tracker data to save
   * @param key The localStorage key to use
   */
  saveTrackerData(data: any, key = "trackerData") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error("Error saving tracker data:", error)
      return false
    }
  },

  /**
   * Gets tracker data from localStorage
   * @param key The localStorage key to use
   * @returns The parsed tracker data or null if not found
   */
  getTrackerData(key = "trackerData") {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error getting tracker data:", error)
      return null
    }
  },
}
