import { openDB } from "idb"
import { generateUroLogDemoData } from "./uroLogService"
import { generateHydroLogDemoData } from "./hydroLogService"
import { generateKegelLogDemoData } from "./kegelLogService"

export async function generateDemoData(): Promise<void> {
  try {
    // Generate UroLog demo data
    const uroLogs = generateUroLogDemoData(30) // Generate 30 demo entries

    // Generate HydroLog demo data
    const hydroLogs = generateHydroLogDemoData(40) // Generate 40 demo entries

    // Generate KegelLog demo data
    const kegelLogs = generateKegelLogDemoData(20) // Generate 20 demo entries

    // Save all demo data to the database
    const db = await openDB()

    // UroLogs
    const uroTx = db.transaction("uroLogs", "readwrite")
    const uroStore = uroTx.objectStore("uroLogs")
    for (const log of uroLogs) {
      await uroStore.add({ ...log, isDemo: true }) // Mark as demo
    }
    await uroTx.done

    // HydroLogs
    const hydroTx = db.transaction("hydroLogs", "readwrite")
    const hydroStore = hydroTx.objectStore("hydroLogs")
    for (const log of hydroLogs) {
      await hydroStore.add({ ...log, isDemo: true }) // Mark as demo
    }
    await hydroTx.done

    // KegelLogs
    const kegelTx = db.transaction("kegelLogs", "readwrite")
    const kegelStore = kegelTx.objectStore("kegelLogs")
    for (const log of kegelLogs) {
      await kegelStore.add({ ...log, isDemo: true }) // Mark as demo
    }
    await kegelTx.done

    return
  } catch (error) {
    console.error("Error generating demo data:", error)
    throw new Error("Failed to generate demo data")
  }
}

// Add a function to clear only demo data
export async function clearDemoData(): Promise<void> {
  try {
    const db = await openDB()

    // Clear demo data from all stores
    for (const storeName of db.objectStoreNames) {
      const tx = db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)

      // Get all entries
      const entries = await store.getAll()

      // Delete only demo entries
      for (const entry of entries) {
        if (entry.isDemo === true) {
          await store.delete(entry.id)
        }
      }

      await tx.done
    }

    return
  } catch (error) {
    console.error("Error clearing demo data:", error)
    throw new Error("Failed to clear demo data")
  }
}

// Update the template generation to include display order and active status
export function generateTemplateData() {
  return {
    version: 3.0,
    timestamp: new Date().toISOString(),
    entries: [], // This would contain actual entries
    metadata: {
      displayOrder: {
        tabs: {
          "page1.section1.tab1": 1,
          "page1.section1.tab2": 2,
          "page1.section1.tab3": 3,
          "page1.section1.tab4": 4,
          "page1.section1.tab5": 5,
          "page2.section1.tab1": 1,
          "page2.section1.tab2": 2,
          "page2.section1.tab3": 3,
          "page2.section1.tab4": 4,
          "page2.section1.tab5": 5,
        },
        sections: {
          "page1.section1": 1,
          "page2.section1": 1,
        },
        fields: {
          "page1.section1.tab1.field1": 1,
          "page1.section1.tab1.field2": 2,
          "page1.section1.tab1.field3": 3,
          "page1.section1.tab1.field4": 4,
          "page1.section1.tab1.field5": 5,
          "page1.section1.tab1.field6": 6,
          "page1.section1.tab1.field7": 7,
          "page1.section1.tab1.field8": 8,
          "page1.section1.tab1.field9": 9,
          // Add more fields as needed
        },
      },
      activeStatus: {
        tabs: {
          "page1.section1.tab1": true,
          "page1.section1.tab2": true,
          "page1.section1.tab3": true,
          "page1.section1.tab4": true,
          "page1.section1.tab5": true,
          "page2.section1.tab1": true,
          "page2.section1.tab2": true,
          "page2.section1.tab3": true,
          "page2.section1.tab4": true,
          "page2.section1.tab5": true,
        },
        sections: {
          "page1.section1": true,
          "page2.section1": true,
        },
        fields: {
          "page1.section1.tab1.field1": true,
          "page1.section1.tab1.field2": true,
          "page1.section1.tab1.field3": true,
          "page1.section1.tab1.field4": true,
          "page1.section1.tab1.field5": true,
          "page1.section1.tab1.field6": true,
          "page1.section1.tab1.field7": true,
          "page1.section1.tab1.field8": true,
          "page1.section1.tab1.field9": true,
          // Add more fields as needed
        },
      },
    },
  }
}
