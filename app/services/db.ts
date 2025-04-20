import Dexie from "dexie"
import type { FlowEntry, FluidIntakeEntry, CustomResource } from "../types"

// Define the database
class FlowTrackerDatabase extends Dexie {
  flowEntries!: Dexie.Table<FlowEntry, string> // timestamp is the primary key
  fluidIntakeEntries!: Dexie.Table<FluidIntakeEntry, string> // timestamp is the primary key
  customResources!: Dexie.Table<CustomResource, string> // id is the primary key

  constructor() {
    super("FlowTrackerDB")

    // Define tables and schema
    this.version(2).stores({
      flowEntries: "timestamp, volume, duration, flowRate, color, urgency, *concerns",
      fluidIntakeEntries: "timestamp, type, amount, unit",
      customResources: "id, title, url, category",
      // The * before concerns indicates it's a multi-valued property (array)
    })
  }
}

// Create and export a database instance
export const db = new FlowTrackerDatabase()

// Flow Entry operations
export async function getAllFlowEntries(): Promise<FlowEntry[]> {
  return await db.flowEntries.toArray()
}

export async function addFlowEntry(entry: FlowEntry): Promise<string> {
  return await db.flowEntries.add(entry)
}

export async function updateFlowEntry(entry: FlowEntry): Promise<number> {
  return await db.flowEntries.update(entry.timestamp, entry)
}

export async function deleteFlowEntry(timestamp: string): Promise<void> {
  await db.flowEntries.delete(timestamp)
}

export async function deleteAllFlowEntries(): Promise<void> {
  await db.flowEntries.clear()
}

export async function bulkAddFlowEntries(entries: FlowEntry[]): Promise<void> {
  await db.flowEntries.bulkAdd(entries)
}

// Fluid Intake operations
export async function getAllFluidIntakeEntries(): Promise<FluidIntakeEntry[]> {
  return await db.fluidIntakeEntries.toArray()
}

export async function addFluidIntakeEntry(entry: FluidIntakeEntry): Promise<string> {
  return await db.fluidIntakeEntries.add(entry)
}

export async function updateFluidIntakeEntry(entry: FluidIntakeEntry): Promise<number> {
  return await db.fluidIntakeEntries.update(entry.timestamp, entry)
}

export async function deleteFluidIntakeEntry(timestamp: string): Promise<void> {
  await db.fluidIntakeEntries.delete(timestamp)
}

export async function deleteAllFluidIntakeEntries(): Promise<void> {
  await db.fluidIntakeEntries.clear()
}

export async function bulkAddFluidIntakeEntries(entries: FluidIntakeEntry[]): Promise<void> {
  await db.fluidIntakeEntries.bulkAdd(entries)
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

// Function to migrate data from localStorage to IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  const savedEntries = localStorage.getItem("flowEntries")

  if (savedEntries) {
    try {
      const entries = JSON.parse(savedEntries) as any[]

      // Only migrate if we have entries and the IndexedDB is empty
      const flowCount = await db.flowEntries.count()
      const fluidCount = await db.fluidIntakeEntries.count()

      if (entries.length > 0 && flowCount === 0 && fluidCount === 0) {
        // Separate flow entries and fluid intake entries
        const flowEntries: FlowEntry[] = []
        const fluidIntakeEntries: FluidIntakeEntry[] = []

        entries.forEach((entry) => {
          // Create flow entry
          const flowEntry: FlowEntry = {
            timestamp: entry.timestamp,
            volume: entry.volume,
            duration: entry.duration,
            flowRate: entry.flowRate,
            color: entry.color,
            urgency: entry.urgency,
            concerns: entry.concerns,
            notes: entry.notes,
          }

          flowEntries.push(flowEntry)

          // If the entry has fluid intake data, create a fluid intake entry
          if (entry.fluidIntake) {
            const fluidIntakeEntry: FluidIntakeEntry = {
              timestamp: entry.timestamp,
              type: entry.fluidIntake.type || "",
              customType: entry.fluidIntake.customType,
              amount: entry.fluidIntake.amount,
              unit: entry.fluidIntake.unit,
            }

            fluidIntakeEntries.push(fluidIntakeEntry)
          }
        })

        // Add entries to their respective tables
        if (flowEntries.length > 0) {
          await bulkAddFlowEntries(flowEntries)
        }

        if (fluidIntakeEntries.length > 0) {
          await bulkAddFluidIntakeEntries(fluidIntakeEntries)
        }

        console.log(
          `Migrated ${flowEntries.length} flow entries and ${fluidIntakeEntries.length} fluid intake entries from localStorage to IndexedDB`,
        )

        // Optionally clear localStorage after successful migration
        // localStorage.removeItem("flowEntries");
      }
    } catch (error) {
      console.error("Error migrating data from localStorage:", error)
    }
  }
}

// Get entries for a specific date range
export async function getEntriesInDateRange(
  startDate: Date,
  endDate: Date,
): Promise<{
  flowEntries: FlowEntry[]
  fluidIntakeEntries: FluidIntakeEntry[]
}> {
  const flowEntries = await db.flowEntries
    .where("timestamp")
    .between(startDate.toISOString(), endDate.toISOString())
    .toArray()

  const fluidIntakeEntries = await db.fluidIntakeEntries
    .where("timestamp")
    .between(startDate.toISOString(), endDate.toISOString())
    .toArray()

  return { flowEntries, fluidIntakeEntries }
}

// Get the most recent entries
export async function getRecentEntries(limit = 10): Promise<{
  flowEntries: FlowEntry[]
  fluidIntakeEntries: FluidIntakeEntry[]
}> {
  const flowEntries = await db.flowEntries.orderBy("timestamp").reverse().limit(limit).toArray()

  const fluidIntakeEntries = await db.fluidIntakeEntries.orderBy("timestamp").reverse().limit(limit).toArray()

  return { flowEntries, fluidIntakeEntries }
}
