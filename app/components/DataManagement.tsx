"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { UroLog, HydroLog, KegelLog } from "../types"
import { loadConfig, saveConfig, DEFAULT_CONFIG, type AppConfig } from "../types/config"
import { toggleDemoStatus } from "../db/trackerQueries"
import { useToast } from "@/components/ui/use-toast"

// Define a more flexible entry type that can accommodate any field structure
interface DynamicEntry {
  timestamp: string
  entryType: string
  fields: Record<string, any>
  config?: {
    fieldDefinitions: Record<
      string,
      {
        id: string
        label: string
        type: string
        required?: boolean
        options?: { value: string; label: string }[]
      }
    >
    tabConfig?: {
      id: string
      label: string
      icon?: string
    }
  }
  isDemo?: boolean
}

// Mock data for testing
const mockUroLogs: UroLog[] = [
  {
    timestamp: new Date().toISOString(),
    flowRate: 10.5,
    volume: 300,
    duration: 30,
    color: "Light Yellow",
    urgency: "Normal",
  },
  {
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    flowRate: 9.8,
    volume: 280,
    duration: 28,
    color: "Clear",
    urgency: "Normal",
  },
]

const mockHydroLogs: HydroLog[] = [
  {
    timestamp: new Date().toISOString(),
    type: "Water",
    amount: 250,
    unit: "mL",
  },
  {
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    type: "Coffee",
    amount: 180,
    unit: "mL",
  },
]

const mockKegelLogs: KegelLog[] = [
  {
    timestamp: new Date().toISOString(),
    reps: 15,
    holdTime: 5,
    sets: 3,
    totalTime: 225,
    completed: true,
  },
  {
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    reps: 12,
    holdTime: 4,
    sets: 2,
    totalTime: 96,
    completed: true,
  },
]

// Add the hasDemoDataState prop to the interface
interface DataManagementProps {
  title2?: React.ReactNode
  hasDemoDataState?: boolean
}

interface MonthlyGroup {
  key: string
  label: string
  entries: Record<string, DynamicEntry[]>
  averages: Record<string, Record<string, number>>
}

// Export the generateDemoData function so it can be used in other components
export function generateDemoData() {
  const mockUroLogs: UroLog[] = []
  const mockHydroLogs: HydroLog[] = []
  const mockKegelLogs: KegelLog[] = []
  const today = new Date()
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(today.getMonth() - 3)

  // Base flow rate that will change by +/- 1 ml/s each day
  let baseFlowRate = 10.0 // Starting at 10 ml/s

  // Loop through each day in the 3-month period
  for (
    let currentDate = new Date(threeMonthsAgo);
    currentDate <= today;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    // Adjust the base flow rate by +/- 1 ml/s each day
    // Use a simple algorithm to make it look natural but predictable
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000,
    )
    const direction = dayOfYear % 2 === 0 ? 1 : -1 // Alternate between up and down
    baseFlowRate += direction * 1.0 // Change by exactly 1 ml/s

    // Keep the flow rate within reasonable bounds
    baseFlowRate = Math.max(5.0, Math.min(15.0, baseFlowRate))

    // Create 3 entries for each day
    for (let i = 0; i < 3; i++) {
      const entryTime = new Date(currentDate)

      // Set different times for the 3 entries
      if (i === 0) {
        entryTime.setHours(7, Math.floor(Math.random() * 60), 0) // Morning
      } else if (i === 1) {
        entryTime.setHours(13, Math.floor(Math.random() * 60), 0) // Afternoon
      } else {
        entryTime.setHours(20, Math.floor(Math.random() * 60), 0) // Evening
      }

      // Small random variation for each entry within the day
      const flowRateVariation = baseFlowRate + (Math.random() * 0.6 - 0.3) // +/- 0.3 ml/s variation

      // Generate random flow data based on the flow rate
      const duration = Math.floor(Math.random() * 10) + 30 // 30-40 seconds
      const volume = Math.floor(flowRateVariation * duration) // Volume based on flow rate and duration

      // Define possible colors, urgencies, and concerns
      const colors = [
        "Light Yellow",
        "Clear",
        "Dark Yellow",
        "Amber or Honey",
        "Orange",
        "Pink or Red",
        "Blue or Green",
        "Brown or Cola-colored",
        "Cloudy or Murky",
        "Foamy or Bubbly",
      ]

      const urgencies = ["Normal", "Hour < 60 min", "Hold < 15 min", "Had drips", "Couldn't hold it"]

      const possibleConcerns = [
        "Straining",
        "Dribbling",
        "Frequent urges",
        "Incomplete emptying",
        "Waking just to pee",
        "Pain",
        "Burning",
        "Blood",
      ]

      // Randomly select color and urgency
      const color = colors[Math.floor(Math.random() * colors.length)]
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)]

      // Add concerns occasionally (about 20% of entries)
      let concerns: string[] | undefined = undefined
      if (Math.random() < 0.2) {
        // Add 1-2 random concerns
        const numConcerns = Math.floor(Math.random() * 2) + 1
        concerns = []
        for (let j = 0; j < numConcerns; j++) {
          const concern = possibleConcerns[Math.floor(Math.random() * possibleConcerns.length)]
          if (!concerns.includes(concern)) {
            concerns.push(concern)
          }
        }
      }

      // Create a UroLog entry
      mockUroLogs.push({
        timestamp: entryTime.toISOString(),
        flowRate: Number.parseFloat(flowRateVariation.toFixed(2)),
        volume,
        duration,
        color,
        urgency,
        concerns,
        isDemo: true, // Mark as demo data
      })

      // Generate random hydro log data
      const fluidIntake = Math.floor(Math.random() * 300) + 100 // 100-400 ml
      const fluidType = ["Water", "Coffee", "Tea", "Juice"][Math.floor(Math.random() * 4)]

      // Create a HydroLog entry
      mockHydroLogs.push({
        timestamp: entryTime.toISOString(),
        type: fluidType,
        amount: fluidIntake,
        unit: "mL",
        isDemo: true, // Mark as demo data
      })

      // Generate random kegel log data
      const kegelReps = Math.floor(Math.random() * 20) + 10 // 10-30 reps
      const kegelHoldTime = Math.floor(Math.random() * 5) + 5 // 5-10 seconds hold
      const kegelSets = Math.floor(Math.random() * 5) + 1 // 1-5 sets
      const kegelTotalTime = kegelReps * kegelHoldTime * kegelSets // Total time

      mockKegelLogs.push({
        timestamp: entryTime.toISOString(),
        reps: kegelReps,
        holdTime: kegelHoldTime,
        sets: kegelSets,
        totalTime: kegelTotalTime,
        completed: true,
        isDemo: true, // Mark as demo data
      })
    }
  }

  // Add the demo data to the database
  const addDemoData = async () => {
    try {
      const { bulkAddUroLogs, bulkAddHydroLogs, bulkAddKegelLogs } = await import("../services/db")
      await bulkAddUroLogs(mockUroLogs)
      await bulkAddHydroLogs(mockHydroLogs)
      await bulkAddKegelLogs(mockKegelLogs)
      console.log("Demo data added successfully")
    } catch (error) {
      console.error("Error adding demo data:", error)
    }
  }

  // Call the function to add the demo data
  addDemoData()

  return { uroLogs: mockUroLogs, hydroLogs: mockHydroLogs, kegelLogs: mockKegelLogs }
}

// Function to check if demo data exists
export async function hasDemoData(): Promise<boolean> {
  try {
    const { db } = await import("../services/db")

    // Get all entries and filter them in memory
    const uroLogs = await db.uroLogs.toArray()
    const hydroLogs = await db.hydroLogs.toArray()

    // Check if any entry has isDemo set to true
    const hasDemoUroLogs = uroLogs.some((log) => log.isDemo === true)
    const hasDemoHydroLogs = hydroLogs.some((log) => log.isDemo === true)

    return hasDemoUroLogs || hasDemoHydroLogs
  } catch (error) {
    console.error("Error checking for demo data:", error)
    return false
  }
}

// Function to delete all demo data
export async function deleteDemoData(): Promise<void> {
  try {
    const { db } = await import("../services/db")

    // Get all entries
    const uroLogs = await db.uroLogs.toArray()
    const hydroLogs = await db.hydroLogs.toArray()
    const kegelLogs = await db.kegelLogs.toArray()

    // Filter out demo entries and get their keys
    const demoUroLogKeys = uroLogs.filter((log) => log.isDemo === true).map((log) => log.timestamp)
    const demoHydroLogKeys = hydroLogs.filter((log) => log.isDemo === true).map((log) => log.timestamp)
    const demoKegelLogKeys = kegelLogs.filter((log) => log.isDemo === true).map((log) => log.timestamp)

    // Delete entries by key
    if (demoUroLogKeys.length > 0) {
      await db.uroLogs.bulkDelete(demoUroLogKeys)
    }

    if (demoHydroLogKeys.length > 0) {
      await db.hydroLogs.bulkDelete(demoHydroLogKeys)
    }

    if (demoKegelLogKeys.length > 0) {
      await db.kegelLogs.bulkDelete(demoKegelLogKeys)
    }

    console.log("Demo data deleted successfully")
  } catch (error) {
    console.error("Error deleting demo data:", error)
    throw error
  }
}

// Convert legacy logs to dynamic entries
function convertToEntries(
  uroLogs: UroLog[],
  hydroLogs: HydroLog[],
  kegelLogs: KegelLog[],
  appConfig: AppConfig,
): DynamicEntry[] {
  const entries: DynamicEntry[] = []

  // Get field definitions from config
  const getUroLogFieldDefinitions = () => {
    const tabConfig = appConfig.pages.page1?.sections.section1?.tabs.tab1
    if (!tabConfig) return {}

    const fieldDefinitions: Record<string, any> = {}
    Object.entries(tabConfig.fields).forEach(([_, field]) => {
      fieldDefinitions[field.id] = {
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
      }
    })
    return fieldDefinitions
  }

  const getHydroLogFieldDefinitions = () => {
    const tabConfig = appConfig.pages.page1?.sections.section1?.tabs.tab2
    if (!tabConfig) return {}

    const fieldDefinitions: Record<string, any> = {}
    Object.entries(tabConfig.fields).forEach(([_, field]) => {
      fieldDefinitions[field.id] = {
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
      }
    })
    return fieldDefinitions
  }

  const getKegelLogFieldDefinitions = () => {
    const tabConfig = appConfig.pages.page1?.sections.section1?.tabs.tab3
    if (!tabConfig) return {}

    const fieldDefinitions: Record<string, any> = {}
    Object.entries(tabConfig.fields).forEach(([_, field]) => {
      fieldDefinitions[field.id] = {
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
      }
    })
    return fieldDefinitions
  }

  // Convert UroLogs
  uroLogs.forEach((log) => {
    entries.push({
      timestamp: log.timestamp,
      entryType: "UroLog",
      fields: {
        volume: log.volume,
        duration: log.duration,
        flowRate: log.flowRate,
        color: log.color,
        urgency: log.urgency,
        concerns: log.concerns,
        notes: log.notes,
      },
      config: {
        fieldDefinitions: getUroLogFieldDefinitions(),
        tabConfig: {
          id: "tab1",
          label: "UroLog",
          icon: "droplet",
        },
      },
      isDemo: log.isDemo,
    })
  })

  // Convert HydroLogs
  hydroLogs.forEach((log) => {
    entries.push({
      timestamp: log.timestamp,
      entryType: "HydroLog",
      fields: {
        type: log.type,
        customType: log.customType,
        amount: log.amount,
        unit: log.unit,
        notes: log.notes,
      },
      config: {
        fieldDefinitions: getHydroLogFieldDefinitions(),
        tabConfig: {
          id: "tab2",
          label: "HydroLog",
          icon: "coffee",
        },
      },
      isDemo: log.isDemo,
    })
  })

  // Convert KegelLogs
  kegelLogs.forEach((log) => {
    entries.push({
      timestamp: log.timestamp,
      entryType: "KegelLog",
      fields: {
        reps: log.reps,
        holdTime: log.holdTime,
        sets: log.sets,
        totalTime: log.totalTime,
        completed: log.completed,
        notes: log.notes,
      },
      config: {
        fieldDefinitions: getKegelLogFieldDefinitions(),
        tabConfig: {
          id: "tab3",
          label: "KegelLog",
          icon: "dumbbell",
        },
      },
      isDemo: log.isDemo,
    })
  })

  return entries
}

// Function to group entries by month
function groupEntriesByMonth(entries: DynamicEntry[]): MonthlyGroup[] {
  const monthlyGroups: { [key: string]: MonthlyGroup } = {}

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${month + 1}`
    const label = `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)} ${year}`

    if (!monthlyGroups[key]) {
      monthlyGroups[key] = {
        key,
        label,
        entries: {},
        averages: {},
      }
    }

    // Initialize entry type array if it doesn't exist
    if (!monthlyGroups[key].entries[entry.entryType]) {
      monthlyGroups[key].entries[entry.entryType] = []
    }

    // Add entry to the appropriate type array
    monthlyGroups[key].entries[entry.entryType].push(entry)
  })

  // Calculate averages for each entry type and field
  Object.values(monthlyGroups).forEach((group) => {
    Object.entries(group.entries).forEach(([entryType, entries]) => {
      if (!group.averages[entryType]) {
        group.averages[entryType] = {}
      }

      // Get all numeric fields from the first entry
      if (entries.length > 0) {
        const firstEntry = entries[0]
        Object.entries(firstEntry.fields).forEach(([fieldName, value]) => {
          if (typeof value === "number") {
            // Calculate average for this numeric field
            const sum = entries.reduce((total, entry) => {
              const fieldValue = entry.fields[fieldName]
              return typeof fieldValue === "number" ? total + fieldValue : total
            }, 0)
            group.averages[entryType][fieldName] = sum / entries.length
          }
        })
      }
    })
  })

  return Object.values(monthlyGroups).sort((a, b) => (a.key > b.key ? -1 : 1))
}

const EntryRow = ({ entry, onDelete, onToggleDemo }) => {
  // Existing code...

  return (
    <tr className={entry.isDemo ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
      {/* Existing columns... */}

      <td className="px-4 py-2 text-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={entry.isDemo || false}
            onChange={() => onToggleDemo(entry.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2">{entry.isDemo ? "Demo" : "Real"}</span>
        </div>
      </td>

      <td className="px-4 py-2 text-sm">{/* Existing delete button... */}</td>
    </tr>
  )
}

function DataManagement(props: DataManagementProps) {
  // Existing state...
  const [showDemoEntries, setShowDemoEntries] = useState<boolean>(true)
  const [uroLogs, setUroLogs] = useState<UroLog[]>([])
  const [hydroLogs, setHydroLogs] = useState<HydroLog[]>([])
  const [kegelLogs, setKegelLogs] = useState<KegelLog[]>([])
  const [dynamicEntries, setDynamicEntries] = useState<DynamicEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [entryTypes, setEntryTypes] = useState<string[]>([])
  const [entryTypeCounts, setEntryTypeCounts] = useState<Record<string, number>>({})
  const { toast } = useToast()

  // Add these state variables inside the DataManagement component
  const [nonDemoStats, setNonDemoStats] = useState<Record<string, number>>({})
  const [demoStats, setDemoStats] = useState<Record<string, number>>({})
  const [lastExportDate, setLastExportDate] = useState<string | null>(null)
  const [notBackedUpCount, setNotBackedUpCount] = useState<number>(0)

  // Fixed: Properly initialize monthlyStats state
  const [monthlyStats, setMonthlyStats] = useState<{
    [key: string]: Record<string, number>
  }>({})

  const [activeTab, setActiveTab] = useState<string>("tab1")
  const { title2 } = props

  // Add this function inside the DataManagement component
  const calculateDataStats = () => {
    console.log("Calculating stats for entries:", dynamicEntries.length)

    // Count entries by type
    const entryCounts: Record<string, number> = {}
    const nonDemoCounts: Record<string, number> = {}
    const demoCounts: Record<string, number> = {}

    dynamicEntries.forEach((entry) => {
      // Update total counts
      entryCounts[entry.entryType] = (entryCounts[entry.entryType] || 0) + 1

      // Update demo/non-demo counts
      if (entry.isDemo) {
        demoCounts[entry.entryType] = (demoCounts[entry.entryType] || 0) + 1
      } else {
        nonDemoCounts[entry.entryType] = (nonDemoCounts[nonDemoCounts.entryType] || 0) + 1
      }
    })

    setEntryTypeCounts(entryCounts)
    setNonDemoStats(nonDemoCounts)
    setDemoStats(demoCounts)

    // Get last export date from localStorage
    const lastExport = localStorage.getItem("lastDataExport")
    setLastExportDate(lastExport)

    // Calculate records not backed up (assuming last export date as backup date)
    let notBackedUp = 0
    if (lastExport) {
      const lastExportTime = new Date(lastExport).getTime()
      notBackedUp = dynamicEntries.filter((entry) => new Date(entry.timestamp).getTime() > lastExportTime).length
    } else {
      notBackedUp = dynamicEntries.length
    }
    setNotBackedUpCount(notBackedUp)

    // Calculate monthly stats
    const monthly: { [key: string]: Record<string, number> } = {}

    // Process each entry for monthly stats
    dynamicEntries.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${month + 1}`

      if (!monthly[key]) {
        monthly[key] = {}
      }

      monthly[key][entry.entryType] = (monthly[key][entry.entryType] || 0) + 1
    })

    setMonthlyStats(monthly)
    console.log("Monthly stats calculated:", monthly)
  }

  const handleToggleDemo = async (id: string) => {
    try {
      const isDemo = await toggleDemoStatus(activeTab, id)

      // Update the entries in state
      setDynamicEntries((prevEntries) => prevEntries.map((entry) => (entry.id === id ? { ...entry, isDemo } : entry)))

      toast({
        title: `Entry marked as ${isDemo ? "demo" : "real"}`,
        description: `The entry has been updated.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error toggling demo status:", error)
      toast({
        title: "Error",
        description: "Failed to update entry demo status.",
        variant: "destructive",
      })
    }
  }

  // Fetch data from the database
  useEffect(() => {
    // Load app configuration
    const config = loadConfig()
    setAppConfig(config)

    // Try to fetch real data
    const fetchData = async () => {
      try {
        const { getAllUroLogs, getAllHydroLogs, getAllKegelLogs } = await import("../services/db")

        // Fetch all data from the database
        const uroLogsData = await getAllUroLogs()
        const hydroLogsData = await getAllHydroLogs()
        const kegelLogsData = await getAllKegelLogs()

        console.log("Fetched data:", {
          uroLogs: uroLogsData.length,
          hydroLogs: hydroLogsData.length,
          kegelLogs: kegelLogsData.length,
        })

        // Update state with fetched data
        setUroLogs(uroLogsData)
        setHydroLogs(hydroLogsData)
        setKegelLogs(kegelLogsData)

        // Convert to dynamic entries
        const entries = convertToEntries(uroLogsData, hydroLogsData, kegelLogsData, config)
        setDynamicEntries(entries)

        // Extract unique entry types
        const types = Array.from(new Set(entries.map((entry) => entry.entryType)))
        setEntryTypes(types)

        // Group entries by month
        const groups = groupEntriesByMonth(entries)
        setMonthlyGroups(groups)

        // Initialize expanded state for the first month
        if (groups.length > 0) {
          setExpandedMonths({ [groups[0].key]: true })
        }

        // Calculate data statistics
        setTimeout(() => {
          calculateDataStats()
          setIsLoading(false)
        }, 0)
      } catch (error) {
        console.error("Error fetching data:", error)

        // Use mock data as fallback
        const mockEntries = convertToEntries(mockUroLogs, mockHydroLogs, mockKegelLogs, config)
        setDynamicEntries(mockEntries)

        // Extract unique entry types
        const types = Array.from(new Set(mockEntries.map((entry) => entry.entryType)))
        setEntryTypes(types)

        // Group entries by month
        const groups = groupEntriesByMonth(mockEntries)
        setMonthlyGroups(groups)

        // Initialize expanded state for the first month
        if (groups.length > 0) {
          setExpandedMonths({ [groups[0].key]: true })
        }

        // Calculate data statistics
        setTimeout(() => {
          calculateDataStats()
          setIsLoading(false)
        }, 0)
      }
    }

    fetchData()
  }, [])

  // Toggle month expansion
  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Delete an entry
  const deleteEntry = async (entryType: string, timestamp: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      // Map entry type to legacy type for database operations
      let deleteFunction
      if (entryType === "UroLog") {
        const { deleteUroLog } = await import("../services/db")
        deleteFunction = deleteUroLog
      } else if (entryType === "HydroLog") {
        const { deleteHydroLog } = await import("../services/db")
        deleteFunction = deleteHydroLog
      } else if (entryType === "KegelLog") {
        const { deleteKegelLog } = await import("../services/db")
        deleteFunction = deleteKegelLog
      } else {
        // For custom entry types, we would need a different approach
        throw new Error(`Deletion not implemented for entry type: ${entryType}`)
      }

      // Delete from database
      await deleteFunction(timestamp)

      // Update state
      setDynamicEntries((prev) =>
        prev.filter((entry) => !(entry.timestamp === timestamp && entry.entryType === entryType)),
      )

      // Update monthly groups
      const updatedGroups = groupEntriesByMonth(
        dynamicEntries.filter((entry) => !(entry.timestamp === timestamp && entry.entryType === entryType)),
      )
      setMonthlyGroups(updatedGroups)

      // Update statistics after deletion
      calculateDataStats()

      setMessage({
        type: "success",
        text: "Entry deleted successfully.",
      })

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error deleting entry:", error)
      setMessage({
        type: "error",
        text: "Failed to delete entry. Please try again.",
      })
    }
  }

  // Export data as JSON with configuration
  const exportData = () => {
    try {
      // Get app configuration for display order and active status
      const appConfig = localStorage.getItem("appConfig")
      let displayOrder = {}
      let activeStatus = {}

      if (appConfig) {
        try {
          const parsedConfig = JSON.parse(appConfig)

          // Extract display order
          displayOrder = {
            tabs: getTabDisplayOrder(parsedConfig),
            sections: getSectionDisplayOrder(parsedConfig),
            fields: getFieldDisplayOrder(parsedConfig),
          }

          // Extract active status
          activeStatus = {
            tabs: getTabActiveStatus(parsedConfig),
            sections: getSectionActiveStatus(parsedConfig),
            fields: getFieldActiveStatus(parsedConfig),
          }
        } catch (error) {
          console.error("Error parsing app configuration:", error)
        }
      }

      // Create export object with configuration, entries, and metadata
      const exportData = {
        version: "3.0",
        exportDate: new Date().toISOString(),
        configuration: appConfig ? JSON.parse(appConfig) : {},
        entries: dynamicEntries,
        metadata: {
          displayOrder,
          activeStatus,
        },
      }

      // Convert to JSON
      const jsonContent = JSON.stringify(exportData, null, 2)

      // Create a blob and download link
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `flow-tracker-export-${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Save the export date to localStorage
      const now = new Date().toISOString()
      localStorage.setItem("lastDataExport", now)
      setLastExportDate(now)

      // Update not backed up count
      setNotBackedUpCount(0)

      setMessage({
        type: "success",
        text: "Data exported successfully.",
      })

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error exporting data:", error)
      setMessage({
        type: "error",
        text: "Failed to export data. Please try again.",
      })
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

  // Update the import functionality to handle display order and active status
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        // Validate import format
        if (!importData.entries || !Array.isArray(importData.entries)) {
          throw new Error("Invalid import format: missing entries array")
        }

        // Extract entries
        const importedEntries = importData.entries as DynamicEntry[]

        // Extract configuration if available
        const importedConfig = importData.configuration as AppConfig | undefined

        // Extract metadata if available
        const metadata = importData.metadata

        // Merge imported configuration with current configuration
        if (importedConfig) {
          // Create a merged configuration that preserves existing settings
          // but adds any new entry types from the import
          const mergedConfig = { ...appConfig }

          // Merge page1 section1 tabs (entry types)
          if (importedConfig.pages?.page1?.sections?.section1?.tabs) {
            const importedTabs = importedConfig.pages.page1.sections.section1.tabs

            // Add any new tabs from the import
            Object.entries(importedTabs).forEach(([tabId, tabConfig]) => {
              if (!mergedConfig.pages.page1.sections.section1.tabs[tabId]) {
                mergedConfig.pages.page1.sections.section1.tabs[tabId] = tabConfig
              }
            })
          }

          // Save the merged configuration
          saveConfig(mergedConfig)
          setAppConfig(mergedConfig)
        }

        // Apply display order and active status if available
        if (metadata && (metadata.displayOrder || metadata.activeStatus)) {
          try {
            // Get current app config
            const currentConfig = { ...appConfig }
            let configUpdated = false

            // Update tab display order and active status
            if (metadata.displayOrder?.tabs && metadata.activeStatus?.tabs) {
              Object.entries(metadata.displayOrder.tabs).forEach(([path, order]) => {
                const [pageId, sectionId, tabId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
                  currentConfig.pages[pageId].sections[sectionId].tabs[tabId].order = order as number
                  configUpdated = true
                }
              })

              Object.entries(metadata.activeStatus.tabs).forEach(([path, enabled]) => {
                const [pageId, sectionId, tabId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
                  currentConfig.pages[pageId].sections[sectionId].tabs[tabId].enabled = enabled as boolean
                  configUpdated = true
                }
              })
            }

            // Update section display order and active status
            if (metadata.displayOrder?.sections && metadata.activeStatus?.sections) {
              Object.entries(metadata.displayOrder.sections).forEach(([path, order]) => {
                const [pageId, sectionId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]) {
                  currentConfig.pages[pageId].sections[sectionId].order = order as number
                  configUpdated = true
                }
              })

              Object.entries(metadata.activeStatus.sections).forEach(([path, enabled]) => {
                const [pageId, sectionId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]) {
                  currentConfig.pages[pageId].sections[sectionId].enabled = enabled as boolean
                  configUpdated = true
                }
              })
            }

            // Update field display order and active status
            if (metadata.displayOrder?.fields && metadata.activeStatus?.fields) {
              Object.entries(metadata.displayOrder.fields).forEach(([path, order]) => {
                const [pageId, sectionId, tabId, fieldId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
                  currentConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].order = order as number
                  configUpdated = true
                }
              })

              Object.entries(metadata.activeStatus.fields).forEach(([path, enabled]) => {
                const [pageId, sectionId, tabId, fieldId] = path.split(".")
                if (currentConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
                  currentConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].enabled =
                    enabled as boolean
                  configUpdated = true
                }
              })
            }

            // Save updated config if changes were made
            if (configUpdated) {
              saveConfig(currentConfig)
              setAppConfig(currentConfig)
              console.log("Display order and active status imported successfully")
            }
          } catch (error) {
            console.error("Error importing display order and active status:", error)
          }
        }

        // Check for duplicates
        const existingTimestamps = new Set(dynamicEntries.map((entry) => `${entry.entryType}_${entry.timestamp}`))
        const newEntries: DynamicEntry[] = []
        const skippedEntries: DynamicEntry[] = []

        importedEntries.forEach((entry) => {
          const entryKey = `${entry.entryType}_${entry.timestamp}`
          if (!existingTimestamps.has(entryKey)) {
            newEntries.push(entry)
            existingTimestamps.add(entryKey)
          } else {
            skippedEntries.push(entry)
          }
        })

        // Add new entries to the database
        if (newEntries.length > 0) {
          // Group entries by type
          const entriesByType: Record<string, any[]> = {}

          newEntries.forEach((entry) => {
            if (!entriesByType[entry.entryType]) {
              entriesByType[entry.entryType] = []
            }

            // Convert dynamic entry back to legacy format for database
            if (entry.entryType === "UroLog") {
              entriesByType[entry.entryType].push({
                timestamp: entry.timestamp,
                volume: entry.fields.volume,
                duration: entry.fields.duration,
                flowRate: entry.fields.flowRate,
                color: entry.fields.color,
                urgency: entry.fields.urgency,
                concerns: entry.fields.concerns,
                notes: entry.fields.notes,
                isDemo: entry.isDemo,
              })
            } else if (entry.entryType === "HydroLog") {
              entriesByType[entry.entryType].push({
                timestamp: entry.timestamp,
                type: entry.fields.type,
                customType: entry.fields.customType,
                amount: entry.fields.amount,
                unit: entry.fields.unit,
                notes: entry.fields.notes,
                isDemo: entry.isDemo,
              })
            } else if (entry.entryType === "KegelLog") {
              entriesByType[entry.entryType].push({
                timestamp: entry.timestamp,
                reps: entry.fields.reps,
                holdTime: entry.fields.holdTime,
                sets: entry.fields.sets,
                totalTime: entry.fields.totalTime,
                completed: entry.fields.completed,
                notes: entry.fields.notes,
                isDemo: entry.isDemo,
              })
            }
            // For custom entry types, we would need to handle them differently
          })

          // Add entries to database by type
          const { bulkAddUroLogs, bulkAddHydroLogs, bulkAddKegelLogs } = await import("../services/db")

          if (entriesByType["UroLog"] && entriesByType["UroLog"].length > 0) {
            await bulkAddUroLogs(entriesByType["UroLog"])
          }

          if (entriesByType["HydroLog"] && entriesByType["HydroLog"].length > 0) {
            await bulkAddHydroLogs(entriesByType["HydroLog"])
          }

          if (entriesByType["KegelLog"] && entriesByType["KegelLog"].length > 0) {
            await bulkAddKegelLogs(entriesByType["KegelLog"])
          }

          // Update state
          setDynamicEntries((prev) => [...prev, ...newEntries])

          // Extract unique entry types
          const allEntries = [...dynamicEntries, ...newEntries]
          const types = Array.from(new Set(allEntries.map((entry) => entry.entryType)))
          setEntryTypes(types)

          // Update monthly groups
          const updatedGroups = groupEntriesByMonth(allEntries)
          setMonthlyGroups(updatedGroups)

          // Update statistics
          calculateDataStats()
        }

        // Show success message
        setMessage({
          type: "success",
          text: `Import successful. Added ${newEntries.length} entries. Skipped ${skippedEntries.length} duplicates.`,
        })

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } catch (error) {
        console.error("Error importing data:", error)
        setMessage({
          type: "error",
          text: `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    reader.readAsText(file)
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Generate demo data
  const handleGenerateDemoData = async () => {
    if (!confirm("This will generate demo data for testing. Continue?")) return

    setIsGeneratingData(true)
    try {
      // Generate demo data
      const demoData = generateDemoData()

      // Update state with demo data
      setUroLogs((prev) => [...prev, ...demoData.uroLogs])
      setHydroLogs((prev) => [...prev, ...demoData.hydroLogs])
      setKegelLogs((prev) => [...prev, ...demoData.kegelLogs])

      // Convert to dynamic entries and update state
      const newEntries = convertToEntries(demoData.uroLogs, demoData.hydroLogs, demoData.kegelLogs, appConfig)
      setDynamicEntries((prev) => [...prev, ...newEntries])

      // Update monthly groups
      const updatedGroups = groupEntriesByMonth([...dynamicEntries, ...newEntries])
      setMonthlyGroups(updatedGroups)

      // Update statistics
      calculateDataStats()

      setMessage({
        type: "success",
        text: `Generated ${demoData.uroLogs.length + demoData.hydroLogs.length + demoData.kegelLogs.length} demo entries.`,
      })

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error("Error generating demo data:", error)
      setMessage({
        type: "error",
        text: "Failed to generate demo data. Please try again.",
      })
    } finally {
      setIsGeneratingData(false)
    }
  }

  // Delete all demo data
  const handleDeleteDemoData = async () => {
    if (!confirm("This will delete all demo data. This action cannot be undone. Continue?")) return

    try {
      // Delete demo data from database
      await deleteDemoData()

      // Update state by filtering out demo entries
      setDynamicEntries((prev) => prev.filter((entry) => !entry.isDemo))
      setUroLogs((prev) => prev.filter((log) => !log.isDemo))
      setHydroLogs((prev) => prev.filter((log) => !log.isDemo))
      setKegelLogs((prev) => prev.filter((log) => !log.isDemo))

      // Update monthly groups
      const updatedGroups = groupEntriesByMonth(dynamicEntries.filter((entry) => !entry.isDemo))
      setMonthlyGroups(updatedGroups)

      // Update statistics
      calculateDataStats()

      setMessage({
        type: "success",
        text: "All demo data deleted successfully.",
      })

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error("Error deleting demo data:", error)
      setMessage({
        type: "error",
        text: "Failed to delete demo data. Please try again.",
      })
    }
  }

  // Toggle showing demo entries
  const handleToggleShowDemoEntries = () => {
    setShowDemoEntries((prev) => !prev)
  }

  // Render the component
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title2 || "Data Management"}</h1>

      {/* Message display */}
      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Data statistics */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total entries */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Total Entries</h3>
          <p className="text-3xl font-bold">{dynamicEntries.length}</p>
          <div className="mt-2 text-sm">
            {Object.entries(entryTypeCounts).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span>{type}:</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo vs. Real */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Demo vs. Real</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Demo Entries</p>
              <p className="text-2xl font-bold">{dynamicEntries.filter((entry) => entry.isDemo).length}</p>
            </div>
            <div>
              <p className="text-sm">Real Entries</p>
              <p className="text-2xl font-bold">{dynamicEntries.filter((entry) => !entry.isDemo).length}</p>
            </div>
          </div>
        </div>

        {/* Backup status */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Backup Status</h3>
          <p className="text-sm">Last Export</p>
          <p className="text-lg font-bold">{lastExportDate ? new Date(lastExportDate).toLocaleString() : "Never"}</p>
          <p className="text-sm mt-2">
            {notBackedUpCount} {notBackedUpCount === 1 ? "entry" : "entries"} not backed up
          </p>
        </div>

        {/* Monthly breakdown */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Breakdown</h3>
          <div className="text-sm max-h-32 overflow-y-auto">
            {Object.entries(monthlyStats)
              .sort(([a], [b]) => (a > b ? -1 : 1))
              .slice(0, 5)
              .map(([month, counts]) => {
                const [year, monthNum] = month.split("-")
                const monthName = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1).toLocaleString(
                  "default",
                  {
                    month: "short",
                  },
                )
                const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

                return (
                  <div key={month} className="flex justify-between">
                    <span>
                      {monthName} {year}:
                    </span>
                    <span>{total}</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Export data */}
        <button onClick={exportData} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Export Data
        </button>

        {/* Import data */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
          >
            Import Data
          </button>
          <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
        </div>

        {/* Generate demo data */}
        <button
          onClick={handleGenerateDemoData}
          disabled={isGeneratingData}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {isGeneratingData ? "Generating..." : "Generate Demo Data"}
        </button>

        {/* Delete demo data */}
        <button onClick={handleDeleteDemoData} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
          Delete Demo Data
        </button>
      </div>

      {/* Toggle demo entries */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="showDemoEntries"
          checked={showDemoEntries}
          onChange={handleToggleShowDemoEntries}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showDemoEntries" className="ml-2 text-sm">
          Show demo entries
        </label>
      </div>

      {/* Monthly groups */}
      {isLoading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : monthlyGroups.length === 0 ? (
        <div className="text-center py-8">No data available. Try generating demo data or importing data.</div>
      ) : (
        <div className="space-y-6">
          {monthlyGroups.map((group) => (
            <div key={group.key} className="border rounded-lg overflow-hidden">
              {/* Month header */}
              <div
                className="bg-gray-100 dark:bg-gray-700 p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleMonth(group.key)}
              >
                <h3 className="text-lg font-semibold">{group.label}</h3>
                <div className="flex items-center">
                  <span className="mr-4">
                    {Object.values(group.entries).reduce((sum, entries) => sum + entries.length, 0)} entries
                  </span>
                  <svg
                    className={`w-5 h-5 transform ${expandedMonths[group.key] ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Month content */}
              {expandedMonths[group.key] && (
                <div className="p-4">
                  {/* Entry type tabs */}
                  <div className="mb-4 border-b">
                    <div className="flex overflow-x-auto">
                      {Object.entries(group.entries).map(([entryType, entries]) => (
                        <button
                          key={entryType}
                          className={`px-4 py-2 whitespace-nowrap ${
                            activeTab === entryType
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                          onClick={() => setActiveTab(entryType)}
                        >
                          {entryType} ({entries.length})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entry type content */}
                  {Object.entries(group.entries).map(
                    ([entryType, entries]) =>
                      activeTab === entryType && (
                        <div key={entryType} className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Date & Time
                                </th>
                                {entries.length > 0 &&
                                  Object.keys(entries[0].fields).map((fieldName) => (
                                    <th
                                      key={fieldName}
                                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                      {fieldName}
                                    </th>
                                  ))}
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Demo
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {entries
                                .filter((entry) => showDemoEntries || !entry.isDemo)
                                .map((entry) => (
                                  <tr
                                    key={entry.timestamp}
                                    className={entry.isDemo ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {formatDate(entry.timestamp)}
                                    </td>
                                    {Object.entries(entry.fields).map(([fieldName, value]) => (
                                      <td key={fieldName} className="px-4 py-2 whitespace-nowrap text-sm">
                                        {Array.isArray(value)
                                          ? value.join(", ")
                                          : typeof value === "boolean"
                                            ? value
                                              ? "Yes"
                                              : "No"
                                            : String(value)}
                                      </td>
                                    ))}
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={entry.isDemo || false}
                                          onChange={() => handleToggleDemo(entry.timestamp)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      <button
                                        onClick={() => deleteEntry(entry.entryType, entry.timestamp)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataManagement
