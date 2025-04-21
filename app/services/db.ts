import Dexie from "dexie"
import type { UroLog, HydroLog, CustomResource } from "../types"

// Define the database
class FlowTrackerDatabase extends Dexie {
  // Update table names to match the new naming convention
  uroLogs!: Dexie.Table<UroLog, string> // renamed from flowEntries
  hydroLogs!: Dexie.Table<HydroLog, string> // renamed from fluidIntakeEntries
  customResources!: Dexie.Table<CustomResource, string>

  constructor() {
    super("FlowTrackerDB")

    // Define tables and schema - increment version number to trigger schema migration
    this.version(3).stores({
      uroLogs: "timestamp, volume, duration, flowRate, color, urgency, *concerns",
      hydroLogs: "timestamp, type, amount, unit",
      customResources: "id, title, url, category",
      // The * before concerns indicates it's a multi-valued property (array)
    })

    // Add migration from old table names to new ones
    this.on("ready", async () => {
      // We can access the current version using this.verno instead of db.version()
      try {
        // Check if we need to migrate data from old table names
        // Only attempt migration if we're on version 3 (the first version with new table names)
        if (this.verno === 3) {
          console.log("Checking for data migration needs...")

          // Check if the new tables are empty
          const uroCount = await this.table("uroLogs").count()
          const hydroCount = await this.table("hydroLogs").count()

          if (uroCount === 0 && hydroCount === 0) {
            // Check if old tables exist in the database schema
            const tableNames = this.tables.map((table) => table.name)

            // Migrate data from old tables if they exist
            if (tableNames.includes("flowEntries")) {
              try {
                const oldFlowEntries = await this.table("flowEntries").toArray()
                if (oldFlowEntries.length > 0) {
                  await this.table("uroLogs").bulkAdd(oldFlowEntries)
                  console.log(`Migrated ${oldFlowEntries.length} entries from flowEntries to uroLogs`)
                }
              } catch (error) {
                console.error("Error migrating flowEntries:", error)
              }
            }

            if (tableNames.includes("fluidIntakeEntries")) {
              try {
                const oldFluidEntries = await this.table("fluidIntakeEntries").toArray()
                if (oldFluidEntries.length > 0) {
                  await this.table("hydroLogs").bulkAdd(oldFluidEntries)
                  console.log(`Migrated ${oldFluidEntries.length} entries from fluidIntakeEntries to hydroLogs`)
                }
              } catch (error) {
                console.error("Error migrating fluidIntakeEntries:", error)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during table migration:", error)
      }
    })
  }
}

// Create and export a database instance
export const db = new FlowTrackerDatabase()

// UroLog operations
export async function getAllUroLogs(): Promise<UroLog[]> {
  return await db.uroLogs.toArray()
}

export async function addUroLog(entry: UroLog): Promise<string> {
  return await db.uroLogs.add(entry)
}

export async function updateUroLog(entry: UroLog): Promise<number> {
  return await db.uroLogs.update(entry.timestamp, entry)
}

export async function deleteUroLog(timestamp: string): Promise<void> {
  await db.uroLogs.delete(timestamp)
}

export async function deleteAllUroLogs(): Promise<void> {
  await db.uroLogs.clear()
}

export async function bulkAddUroLogs(entries: UroLog[]): Promise<void> {
  await db.uroLogs.bulkAdd(entries)
}

// HydroLog operations
export async function getAllHydroLogs(): Promise<HydroLog[]> {
  return await db.hydroLogs.toArray()
}

export async function addHydroLog(entry: HydroLog): Promise<string> {
  return await db.hydroLogs.add(entry)
}

export async function updateHydroLog(entry: HydroLog): Promise<number> {
  return await db.hydroLogs.update(entry.timestamp, entry)
}

export async function deleteHydroLog(timestamp: string): Promise<void> {
  await db.hydroLogs.delete(timestamp)
}

export async function deleteAllHydroLogs(): Promise<void> {
  await db.hydroLogs.clear()
}

export async function bulkAddHydroLogs(entries: HydroLog[]): Promise<void> {
  await db.hydroLogs.bulkAdd(entries)
}

// Custom Resource operations
export async function getCustomResources(): Promise<CustomResource[]> {
  return await db.customResources.toArray()
}

export async function addCustomResource(resource: CustomResource): Promise<string> {
  return await db.customResources.put(resource) // Use put to handle both add and update
}

export async function deleteCustomResource(id: string): Promise<void> {
  await db.customResources.delete(id)
}

// Add this function to get database counts
export async function getDatabaseCounts(): Promise<{ uroLogs: number; hydroLogs: number }> {
  const uroCount = await db.uroLogs.count()
  const hydroCount = await db.hydroLogs.count()
  return {
    uroLogs: uroCount,
    hydroLogs: hydroCount,
  }
}

// Update the migrateFromLocalStorage function to ensure it doesn't create duplicates

export async function migrateFromLocalStorage(): Promise<void> {
  // Check for any localStorage data that needs migration
  const keysToCheck = ["uroLogs", "hydroLogs", "customResources"]

  let migratedData = false

  for (const key of keysToCheck) {
    const savedData = localStorage.getItem(key)
    if (savedData) {
      try {
        console.log(`Found data in localStorage for "${key}", attempting to migrate...`)

        if (key === "uroLogs") {
          const entries = JSON.parse(savedData) as any[]

          // Only migrate if we have entries and the IndexedDB is empty
          const uroCount = await db.uroLogs.count()

          if (entries.length > 0 && uroCount === 0) {
            // Separate uro logs and hydro logs entries
            const uroLogs: UroLog[] = []
            const hydroLogs: HydroLog[] = []

            // Track timestamps to ensure uniqueness
            const existingTimestamps = new Set<string>()

            entries.forEach((entry) => {
              // Ensure timestamp is unique
              let timestamp = entry.timestamp
              const originalTimestamp = timestamp
              let counter = 0

              while (existingTimestamps.has(timestamp)) {
                // Add milliseconds to make the timestamp unique
                const date = new Date(originalTimestamp)
                date.setMilliseconds(date.getMilliseconds() + counter)
                timestamp = date.toISOString()
                counter++
              }

              existingTimestamps.add(timestamp)

              // Create uro log entry
              const uroLog: UroLog = {
                timestamp: timestamp,
                volume: entry.volume,
                duration: entry.duration,
                flowRate: entry.flowRate,
                color: entry.color,
                urgency: entry.urgency,
                concerns: entry.concerns,
                notes: entry.notes,
              }

              uroLogs.push(uroLog)

              // If the entry has fluid intake data, create a hydro log entry
              if (entry.fluidIntake) {
                const hydroLog: HydroLog = {
                  timestamp: timestamp,
                  type: entry.fluidIntake.type || "",
                  customType: entry.fluidIntake.customType,
                  amount: entry.fluidIntake.amount,
                  unit: entry.fluidIntake.unit,
                }

                hydroLogs.push(hydroLog)
              }
            })

            // Add entries to their respective tables
            if (uroLogs.length > 0) {
              await bulkAddUroLogs(uroLogs)
            }

            if (hydroLogs.length > 0) {
              await bulkAddHydroLogs(hydroLogs)
            }

            console.log(
              `Migrated ${uroLogs.length} uro logs and ${hydroLogs.length} hydro logs from localStorage to IndexedDB`,
            )
            migratedData = true
          }
        }

        // Remove localStorage data after migration attempt
        localStorage.removeItem(key)
        console.log(`Removed "${key}" from localStorage to prevent duplication`)
      } catch (error) {
        console.error(`Error migrating ${key} from localStorage:`, error)
      }
    }
  }

  if (migratedData) {
    console.log("Successfully migrated data from localStorage to IndexedDB")
  } else {
    console.log("No data migration needed")
  }
}

// Add this function to check database integrity
export async function checkDatabaseIntegrity(): Promise<{
  hasDuplicates: boolean
  uroDuplicates: number
  hydroDuplicates: number
}> {
  // Get all entries
  const allUroLogs = await db.uroLogs.toArray()
  const allHydroLogs = await db.hydroLogs.toArray()

  // Check for duplicate timestamps in uro logs
  const uroTimestamps = allUroLogs.map((entry) => entry.timestamp)
  const uniqueUroTimestamps = new Set(uroTimestamps)
  const uroDuplicates = uroTimestamps.length - uniqueUroTimestamps.size

  // Check for duplicate timestamps in hydro logs
  const hydroTimestamps = allHydroLogs.map((entry) => entry.timestamp)
  const uniqueHydroTimestamps = new Set(hydroTimestamps)
  const hydroDuplicates = hydroTimestamps.length - uniqueHydroTimestamps.size

  return {
    hasDuplicates: uroDuplicates > 0 || hydroDuplicates > 0,
    uroDuplicates,
    hydroDuplicates,
  }
}

// Get entries for a specific date range
export async function getEntriesInDateRange(
  startDate: Date,
  endDate: Date,
): Promise<{
  uroLogs: UroLog[]
  hydroLogs: HydroLog[]
}> {
  const uroLogs = await db.uroLogs.where("timestamp").between(startDate.toISOString(), endDate.toISOString()).toArray()

  const hydroLogs = await db.hydroLogs
    .where("timestamp")
    .between(startDate.toISOString(), endDate.toISOString())
    .toArray()

  return { uroLogs, hydroLogs }
}

// Get the most recent entries
export async function getRecentEntries(limit = 10): Promise<{
  uroLogs: UroLog[]
  hydroLogs: HydroLog[]
}> {
  const uroLogs = await db.uroLogs.orderBy("timestamp").reverse().limit(limit).toArray()

  const hydroLogs = await db.hydroLogs.orderBy("timestamp").reverse().limit(limit).toArray()

  return { uroLogs, hydroLogs }
}

// Add this function to the existing db.ts file, near the other database utility functions

/**
 * Resets the database by clearing all data or optionally deleting and recreating the database
 * @param options Configuration options for the reset
 * @returns A promise that resolves when the reset is complete
 */
export async function resetDatabase(options: {
  clearData?: boolean
  deleteDatabase?: boolean
  onProgress?: (message: string) => void
}): Promise<{ success: boolean; message: string }> {
  const { clearData = true, deleteDatabase = false, onProgress = console.log } = options

  try {
    // If we're just clearing data but not deleting the database
    if (clearData && !deleteDatabase) {
      onProgress("Clearing all data from database tables...")

      // Close any open connections first
      if (db.isOpen()) {
        await db.close()
        onProgress("Closed existing database connection")
      }

      // Reopen the database
      await db.open()
      onProgress("Reopened database connection")

      // Clear all tables
      await db.transaction("rw", db.tables, async () => {
        for (const table of db.tables) {
          await table.clear()
          onProgress(`Cleared table: ${table.name}`)
        }
      })

      onProgress("All data has been cleared from the database")
      return {
        success: true,
        message: "Database reset successful. All data has been cleared while preserving the database structure.",
      }
    }

    // If we're deleting the entire database
    if (deleteDatabase) {
      onProgress("Preparing to delete the entire database...")

      // Close any open connections first
      if (db.isOpen()) {
        await db.close()
        onProgress("Closed existing database connection")
      }

      // Delete the database
      await Dexie.delete("FlowTrackerDB")
      onProgress("Database deleted successfully")

      // Create a new database instance
      onProgress("Creating new database...")

      // We need to recreate the database instance
      // This is a bit tricky since we're modifying the exported db instance
      // We'll create a new instance with the same schema
      const newDb = new FlowTrackerDatabase()
      await newDb.open()

      // Replace the old db with the new one
      Object.assign(db, newDb)

      onProgress("New database created successfully")
      return {
        success: true,
        message:
          "Database has been completely deleted and recreated. The application will now start with a fresh database.",
      }
    }

    return {
      success: false,
      message: "No reset action was performed. Please specify either clearData or deleteDatabase option.",
    }
  } catch (error) {
    console.error("Error resetting database:", error)
    return {
      success: false,
      message: `Failed to reset database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Gets information about the current database
 * @returns Database information including version, table names, and entry counts
 */
export async function getDatabaseInfo(): Promise<{
  version: number
  isOpen: boolean
  tableNames: string[]
  entryCounts: Record<string, number>
}> {
  try {
    const isOpen = db.isOpen()
    let version = 0
    let tableNames: string[] = []
    const entryCounts: Record<string, number> = {}

    if (isOpen) {
      version = db.verno
      tableNames = db.tables.map((table) => table.name)

      // Get entry counts for each table
      for (const table of db.tables) {
        entryCounts[table.name] = await table.count()
      }
    } else {
      // Try to open the database to get information
      try {
        await db.open()
        version = db.verno
        tableNames = db.tables.map((table) => table.name)

        // Get entry counts for each table
        for (const table of db.tables) {
          entryCounts[table.name] = await table.count()
        }
      } catch (error) {
        console.error("Error opening database to get info:", error)
      }
    }

    return {
      version,
      isOpen,
      tableNames,
      entryCounts,
    }
  } catch (error) {
    console.error("Error getting database info:", error)
    return {
      version: 0,
      isOpen: false,
      tableNames: [],
      entryCounts: {},
    }
  }
}
