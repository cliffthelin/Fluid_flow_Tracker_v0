import { db } from "./index"
import type { TrackerRepo } from "~/types/tracker"
import { loadJsonFile } from "../utils/loadJsonFile"

/**
 * Adds tracker groups and entries into Dexie.
 * Avoids duplicates by checking name+group combo.
 */
export async function loadDefaultsToDexie(data: TrackerRepo) {
  for (const group of Object.keys(data)) {
    const entries = data[group]

    for (const entry of entries) {
      const exists = await db.customTrackers.where({ group, Name: entry.Name }).first()

      if (!exists) {
        await db.customTrackers.add({ ...entry, group })
      }
    }
  }
}

/**
 * Loads tracker data from the specified JSON file
 * @param path Path to the JSON file
 * @returns Parsed tracker data
 */
export async function loadTrackerData(path = "/data/Tracker_List.json") {
  try {
    // Check if we have a saved custom path
    let savedPaths: { [key: string]: string } = {}
    try {
      const pathsJson = localStorage.getItem("trackerDataPaths")
      if (pathsJson) {
        savedPaths = JSON.parse(pathsJson)
      }
    } catch (e) {
      console.error("Error loading saved paths:", e)
    }

    // Use saved path if available
    const primaryPath = savedPaths["Tracker_List.json"] || path
    const backupPath = savedPaths["Tracker_List_backup.json"] || "/data/Tracker_List_backup.json"

    // Use our utility function to load the JSON file
    try {
      const data = await loadJsonFile(primaryPath)
      if (data) {
        console.log(`Successfully loaded tracker data from ${primaryPath}`)
        return data
      }
    } catch (error) {
      console.error(`Error loading tracker data from ${primaryPath}:`, error)
      console.log("Attempting to load from backup...")
    }

    // If loading from the main file fails, try the backup
    try {
      const backupData = await loadJsonFile(backupPath)
      if (backupData) {
        console.log(`Successfully loaded tracker data from backup: ${backupPath}`)
        return backupData
      }
    } catch (backupError) {
      console.error(`Error loading tracker data from backup ${backupPath}:`, backupError)
    }

    // If both fail, return empty object
    console.warn("Failed to load tracker data from any source, returning empty object")
    return {}
  } catch (error) {
    console.error(`Unexpected error in loadTrackerData:`, error)
    return {}
  }
}

/**
 * Loads default trackers from the main JSON file
 */
export async function loadDefaultTrackers() {
  return loadTrackerData()
}
