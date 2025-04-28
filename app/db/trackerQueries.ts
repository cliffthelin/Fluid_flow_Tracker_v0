import { db } from "./index"
import type { TrackerEntryDB } from "./index"
import { openDB } from "idb"
import type { BaseEntry } from "@/app/types"

/**
 * Gets all tracker entries for a given group (e.g., "Sleep Tracking").
 */
export async function getTrackersByGroup(group: string): Promise<TrackerEntryDB[]> {
  return db.customTrackers.where("group").equals(group).toArray()
}
export async function getAllGroups(): Promise<string[]> {
  const all = await db.customTrackers.toArray()
  return [...new Set(all.map((entry) => entry.group))]
}

// Update the addEntry function to include isDemo
export async function addEntry<T extends BaseEntry>(
  storeName: string,
  entry: Omit<T, "id"> & { isDemo?: boolean },
): Promise<T> {
  const db = await openDB()
  const id = crypto.randomUUID()
  const newEntry = { ...entry, id } as T

  // Ensure isDemo is set (default to false if not provided)
  if (newEntry.isDemo === undefined) {
    newEntry.isDemo = false
  }

  await db.add(storeName, newEntry)
  return newEntry
}

// Update the updateEntry function to preserve isDemo
export async function updateEntry<T extends BaseEntry>(
  storeName: string,
  id: string,
  updates: Partial<T>,
): Promise<T | null> {
  const db = await openDB()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)

  const entry = (await store.get(id)) as T
  if (!entry) return null

  const updatedEntry = { ...entry, ...updates } as T
  await store.put(updatedEntry)
  await tx.done

  return updatedEntry
}

// Add a function to toggle the isDemo status
export async function toggleDemoStatus(storeName: string, id: string): Promise<boolean> {
  const db = await openDB()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)

  const entry = await store.get(id)
  if (!entry) return false

  entry.isDemo = !entry.isDemo
  await store.put(entry)
  await tx.done

  return entry.isDemo
}

// Add a function to get all demo entries
export async function getDemoEntries(storeName: string): Promise<BaseEntry[]> {
  const db = await openDB()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)

  const entries = await store.getAll()
  return entries.filter((entry) => entry.isDemo === true)
}

// Add a function to get all non-demo entries
export async function getNonDemoEntries(storeName: string): Promise<BaseEntry[]> {
  const db = await openDB()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)

  const entries = await store.getAll()
  return entries.filter((entry) => entry.isDemo !== true)
}
