import { getAllUroLogs, getAllHydroLogs, getAllKegelLogs } from "./db"

/**
 * Creates an automatic backup of the database and stores it in localStorage
 * This provides a safety net in case of database issues during development
 */
export async function createAutoBackup(): Promise<boolean> {
  try {
    // Get all data from the database
    const uroLogs = await getAllUroLogs()
    const hydroLogs = await getAllHydroLogs()
    const kegelLogs = await getAllKegelLogs()

    if (uroLogs.length === 0 && hydroLogs.length === 0 && kegelLogs.length === 0) {
      console.log("No data to backup")
      return false
    }

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      uroLogs,
      hydroLogs,
      kegelLogs,
    }

    // Store in localStorage as a safety net
    // This is just a temporary backup - the real data is still in IndexedDB
    localStorage.setItem("flowTrackerAutoBackup", JSON.stringify(backup))

    console.log(
      `Auto-backup created with ${uroLogs.length} uroLogs, ${hydroLogs.length} hydroLogs, and ${kegelLogs.length} kegelLogs`,
    )
    return true
  } catch (error) {
    console.error("Error creating auto-backup:", error)
    return false
  }
}

/**
 * Checks if there's a backup available in localStorage
 */
export function hasAutoBackup(): boolean {
  const backup = localStorage.getItem("flowTrackerAutoBackup")
  return backup !== null
}

/**
 * Restores data from the auto-backup if needed
 * This should only be used if the database is empty but a backup exists
 */
export async function restoreFromAutoBackup(): Promise<boolean> {
  try {
    const backupJson = localStorage.getItem("flowTrackerAutoBackup")
    if (!backupJson) return false

    const backup = JSON.parse(backupJson)

    // Import database functions
    const { bulkAddUroLogs, bulkAddHydroLogs, bulkAddKegelLogs, db } = await import("./db")

    // Check if database is empty
    const uroCount = await db.uroLogs.count()
    const hydroCount = await db.hydroLogs.count()
    const kegelCount = await db.kegelLogs.count()

    if (uroCount === 0 && hydroCount === 0 && kegelCount === 0) {
      console.log("Database is empty, restoring from auto-backup...")

      // Restore data
      if (backup.uroLogs && backup.uroLogs.length > 0) {
        await bulkAddUroLogs(backup.uroLogs)
      }

      if (backup.hydroLogs && backup.hydroLogs.length > 0) {
        await bulkAddHydroLogs(backup.hydroLogs)
      }

      if (backup.kegelLogs && backup.kegelLogs.length > 0) {
        await bulkAddKegelLogs(backup.kegelLogs)
      }

      console.log(
        `Restored ${backup.uroLogs.length} uroLogs, ${backup.hydroLogs.length} hydroLogs, and ${backup.kegelLogs.length} kegelLogs from auto-backup`,
      )
      return true
    } else {
      console.log("Database already has data, skipping auto-backup restoration")
      return false
    }
  } catch (error) {
    console.error("Error restoring from auto-backup:", error)
    return false
  }
}
