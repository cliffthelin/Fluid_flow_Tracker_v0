import Dexie from "dexie"
import type { UroLog, HydroLog, CustomResource, KegelLog } from "../types"

// Define the database
class FlowTrackerDatabase extends Dexie {
  uroLogs!: Dexie.Table<UroLog, string>
  hydroLogs!: Dexie.Table<HydroLog, string>
  customResources!: Dexie.Table<CustomResource, string>
  kegelLogs!: Dexie.Table<KegelLog, string>

  constructor() {
    super("FlowTrackerDB")

    this.version(4).stores({
      uroLogs: "timestamp, volume, duration, flowRate, color, urgency, *concerns, isDemo",
      hydroLogs: "timestamp, type, amount, unit, isDemo",
      customResources: "id, title, url, category",
      kegelLogs: "timestamp, reps, holdTime, sets, totalTime, completed, isDemo",
    })

    this.on("ready", async () => {
      try {
        console.log("Database ready, checking for migration needs...")

        const uroCount = await this.table("uroLogs").count()
        const hydroCount = await this.table("hydroLogs").count()
        const kegelCount = await this.table("kegelLogs").count()

        if (uroCount === 0 && hydroCount === 0 && kegelCount === 0) {
          console.log("New tables are empty, checking for data to migrate...")

          const tableNames = this.tables.map((table) => table.name)

          let migratedData = false

          if (tableNames.includes("flowEntries")) {
            try {
              const oldFlowEntries = await this.table("flowEntries").toArray()
              if (oldFlowEntries.length > 0) {
                console.log(`Found ${oldFlowEntries.length} entries in flowEntries, migrating...`)
                await this.table("uroLogs").bulkAdd(oldFlowEntries)
                console.log(`Migrated ${oldFlowEntries.length} entries from flowEntries to uroLogs`)
                migratedData = true
              }
            } catch (error) {
              console.error("Error migrating flowEntries:", error)
            }
          }

          if (tableNames.includes("fluidIntakeEntries")) {
            try {
              const oldFluidEntries = await this.table("fluidIntakeEntries").toArray()
              if (oldFluidEntries.length > 0) {
                console.log(`Found ${oldFluidEntries.length} entries in fluidIntakeEntries, migrating...`)
                await this.table("hydroLogs").bulkAdd(oldFluidEntries)
                console.log(`Migrated ${oldFluidEntries.length} entries from fluidIntakeEntries to hydroLogs`)
                migratedData = true
              }
            } catch (error) {
              console.error("Error migrating fluidIntakeEntries:", error)
            }
          }

          const legacyTableMappings = {
            flowLogs: "uroLogs",
            urinaryLogs: "uroLogs",
            fluidLogs: "hydroLogs",
            hydrationLogs: "hydroLogs",
          }

          for (const [oldTable, newTable] of Object.entries(legacyTableMappings)) {
            if (tableNames.includes(oldTable)) {
              try {
                const oldEntries = await this.table(oldTable).toArray()
                if (oldEntries.length > 0) {
                  console.log(`Found ${oldEntries.length} entries in ${oldTable}, migrating...`)
                  await this.table(newTable).bulkAdd(oldEntries)
                  console.log(`Migrated ${oldEntries.length} entries from ${oldTable} to ${newTable}`)
                  migratedData = true
                }
              } catch (error) {
                console.error(`Error migrating ${oldTable}:`, error)
              }
            }
          }

          if (migratedData) {
            console.log("Successfully migrated data from old tables to new schema")
          } else {
            console.log("No legacy data found to migrate")
          }
        } else {
          console.log(`Database already contains data: ${uroCount} uroLogs and ${hydroCount} hydroLogs`)
        }
      } catch (error) {
        console.error("Error during database initialization:", error)
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

// KegelLog operations
export async function getAllKegelLogs(): Promise<KegelLog[]> {
  return await db.kegelLogs.toArray()
}

export async function addKegelLog(entry: KegelLog): Promise<string> {
  return await db.kegelLogs.add(entry)
}

export async function updateKegelLog(entry: KegelLog): Promise<number> {
  return await db.kegelLogs.update(entry.timestamp, entry)
}

export async function deleteKegelLog(timestamp: string): Promise<void> {
  await db.kegelLogs.delete(timestamp)
}

export async function deleteAllKegelLogs(): Promise<void> {
  await db.kegelLogs.clear()
}

export async function bulkAddKegelLogs(entries: KegelLog[]): Promise<void> {
  await db.kegelLogs.bulkAdd(entries)
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
export async function getDatabaseCounts(): Promise<{ uroLogs: number; hydroLogs: number; kegelLogs: number }> {
  const uroCount = await db.uroLogs.count()
  const hydroCount = await db.hydroLogs.count()
  const kegelCount = await db.kegelLogs.count()
  return {
    uroLogs: uroCount,
    hydroLogs: hydroCount,
    kegelLogs: kegelCount,
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
                isDemo: false, // Mark as not demo data
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
                  notes: entry.notes,
                  isDemo: false, // Mark as not demo data
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

// Update the export function to include isDemo
export async function exportData(): Promise<string> {
  try {
    // Get all data from all stores
    const data: Record<string, any[]> = {}

    for (const table of db.tables) {
      data[table.name] = await table.toArray()
    }

    // Get app configuration for display order and active status
    const appConfig = localStorage.getItem("appConfig")
    let displayOrder = {}
    let activeStatus = {}

    if (appConfig) {
      try {
        const parsedConfig = JSON.parse(appConfig)

        // Extract display order and active status
        displayOrder = {
          tabs: getTabDisplayOrder(parsedConfig),
          sections: getSectionDisplayOrder(parsedConfig),
          fields: getFieldDisplayOrder(parsedConfig),
        }

        activeStatus = {
          tabs: getTabActiveStatus(parsedConfig),
          sections: getSectionActiveStatus(parsedConfig),
          fields: getFieldActiveStatus(parsedConfig),
        }
      } catch (error) {
        console.error("Error parsing app configuration:", error)
      }
    }

    return JSON.stringify({
      data,
      metadata: {
        displayOrder,
        activeStatus,
      },
      exportDate: new Date().toISOString(),
      version: "3.0", // Increment version to indicate display order and active status support
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    throw new Error("Failed to export data")
  }
}

// Helper functions to extract display order and active status
function getTabDisplayOrder(config: any) {
  const tabOrder = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          if (section.tabs) {
            Object.entries(section.tabs).forEach(([tabId, tab]) => {
              tabOrder[`${pageId}.${sectionId}.${tabId}`] = tab.order
            })
          }
        })
      }
    })
  }

  return tabOrder
}

function getSectionDisplayOrder(config: any) {
  const sectionOrder = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          sectionOrder[`${pageId}.${sectionId}`] = section.order
        })
      }
    })
  }

  return sectionOrder
}

function getFieldDisplayOrder(config: any) {
  const fieldOrder = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          if (section.tabs) {
            Object.entries(section.tabs).forEach(([tabId, tab]) => {
              if (tab.fields) {
                Object.entries(tab.fields).forEach(([fieldId, field]) => {
                  fieldOrder[`${pageId}.${sectionId}.${tabId}.${fieldId}`] = field.order
                })
              }
            })
          }
        })
      }
    })
  }

  return fieldOrder
}

function getTabActiveStatus(config: any) {
  const tabStatus = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          if (section.tabs) {
            Object.entries(section.tabs).forEach(([tabId, tab]) => {
              tabStatus[`${pageId}.${sectionId}.${tabId}`] = tab.enabled
            })
          }
        })
      }
    })
  }

  return tabStatus
}

function getSectionActiveStatus(config: any) {
  const sectionStatus = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          sectionStatus[`${pageId}.${sectionId}`] = section.enabled
        })
      }
    })
  }

  return sectionStatus
}

function getFieldActiveStatus(config: any) {
  const fieldStatus = {}

  if (config.pages) {
    Object.entries(config.pages).forEach(([pageId, page]) => {
      if (page.sections) {
        Object.entries(page.sections).forEach(([sectionId, section]) => {
          if (section.tabs) {
            Object.entries(section.tabs).forEach(([tabId, tab]) => {
              if (tab.fields) {
                Object.entries(tab.fields).forEach(([fieldId, field]) => {
                  fieldStatus[`${pageId}.${sectionId}.${tabId}.${fieldId}`] = field.enabled
                })
              }
            })
          }
        })
      }
    })
  }

  return fieldStatus
}

// Update the import function to handle isDemo
export async function importData(jsonData: string): Promise<void> {
  try {
    const parsedData = JSON.parse(jsonData)
    const { data, metadata, /*config,*/ version } = parsedData

    // Validate the data
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data format")
    }

    // Import data to each store
    for (const [storeName, entries] of Object.entries(data)) {
      if (!Array.isArray(entries)) continue

      // Check if the store exists
      const tableNames = db.tables.map((table) => table.name)
      if (!tableNames.includes(storeName)) {
        console.warn(`Store ${storeName} does not exist, skipping`)
        continue
      }

      const table = db.table(storeName)

      // Clear existing data
      await table.clear()

      // Add each entry, ensuring isDemo is set
      for (const entry of entries) {
        // For older exports without isDemo, set it to false by default
        if (entry.isDemo === undefined) {
          entry.isDemo = false
        }
        await table.add(entry)
      }
    }

    // Import display order and active status if available
    if (metadata && (metadata.displayOrder || metadata.activeStatus)) {
      try {
        // Get current app config
        const appConfig = localStorage.getItem("appConfig")
        if (appConfig) {
          const parsedConfig = JSON.parse(appConfig)
          let configUpdated = false

          // Update tab display order and active status
          if (metadata.displayOrder?.tabs && metadata.activeStatus?.tabs) {
            Object.entries(metadata.displayOrder.tabs).forEach(([path, order]) => {
              const [pageId, sectionId, tabId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
                parsedConfig.pages[pageId].sections[sectionId].tabs[tabId].order = order
                configUpdated = true
              }
            })

            Object.entries(metadata.activeStatus.tabs).forEach(([path, enabled]) => {
              const [pageId, sectionId, tabId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
                parsedConfig.pages[pageId].sections[sectionId].tabs[tabId].enabled = enabled
                configUpdated = true
              }
            })
          }

          // Update section display order and active status
          if (metadata.displayOrder?.sections && metadata.activeStatus?.sections) {
            Object.entries(metadata.displayOrder.sections).forEach(([path, order]) => {
              const [pageId, sectionId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]) {
                parsedConfig.pages[pageId].sections[sectionId].order = order
                configUpdated = true
              }
            })

            Object.entries(metadata.activeStatus.sections).forEach(([path, enabled]) => {
              const [pageId, sectionId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]) {
                parsedConfig.pages[pageId].sections[sectionId].enabled = enabled
                configUpdated = true
              }
            })
          }

          // Update field display order and active status
          if (metadata.displayOrder?.fields && metadata.activeStatus?.fields) {
            Object.entries(metadata.displayOrder.fields).forEach(([path, order]) => {
              const [pageId, sectionId, tabId, fieldId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
                parsedConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].order = order
                configUpdated = true
              }
            })

            Object.entries(metadata.activeStatus.fields).forEach(([path, enabled]) => {
              const [pageId, sectionId, tabId, fieldId] = path.split(".")
              if (parsedConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
                parsedConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].enabled = enabled
                configUpdated = true
              }
            })
          }

          // Save updated config if changes were made
          if (configUpdated) {
            localStorage.setItem("appConfig", JSON.stringify(parsedConfig))
            console.log("Display order and active status imported successfully")
          }
        }
      } catch (error) {
        console.error("Error importing display order and active status:", error)
      }
    }

    // Import configuration if available
    // if (config) {
    //   await setAppConfiguration(config); // Assuming this is not needed for Dexie
    // }

    return
  } catch (error) {
    console.error("Error importing data:", error)
    throw new Error("Failed to import data")
  }
}
