"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Download, Upload, Trash2, Database, Share2, Check, AlertTriangle, RefreshCw, Plus } from "lucide-react"
import type { UroLog, HydroLog, KegelLog } from "../types"
import { isShareAvailable, safeShare } from "../services/share"
import AutoBackupSettings from "./AutoBackupSettings"

// Add the hasDemoDataState prop to the interface
interface DataManagementProps {
  title2?: React.ReactNode
  hasDemoDataState?: boolean
}

interface MonthlyGroup {
  key: string
  label: string
  uroLogs: UroLog[]
  hydroLogs: HydroLog[]
  kegelLogs: KegelLog[]
  averageFlowRate: number
  averageVolume: number
  averageDuration: number
  averageFluidIntake: number
  averageKegelReps: number
  averageKegelHoldTime: number
  averageKegelSets: number
  averageKegelTotalTime: number
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

// Function to group logs by month - fixed to use timestamp instead of time
export function groupLogsByMonth(uroLogs: UroLog[], hydroLogs: HydroLog[], kegelLogs: KegelLog[]): MonthlyGroup[] {
  const monthlyGroups: { [key: string]: MonthlyGroup } = {}

  // Helper function to process logs and update monthly groups
  const processLogs = (logs: (UroLog | HydroLog | KegelLog)[], logType: "uroLogs" | "hydroLogs" | "kegelLogs") => {
    logs.forEach((log: UroLog | HydroLog | KegelLog) => {
      const date = new Date(log.timestamp) // Fixed: use timestamp instead of time
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${month + 1}`
      const label = `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)} ${year}`

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = {
          key,
          label,
          uroLogs: [],
          hydroLogs: [],
          kegelLogs: [],
          averageFlowRate: 0,
          averageVolume: 0,
          averageDuration: 0,
          averageFluidIntake: 0,
          averageKegelReps: 0,
          averageKegelHoldTime: 0,
          averageKegelSets: 0,
          averageKegelTotalTime: 0,
        }
      }

      monthlyGroups[key][logType].push(log as any)
    })
  }

  // Process each type of log
  processLogs(uroLogs, "uroLogs")
  processLogs(hydroLogs, "hydroLogs")
  processLogs(kegelLogs, "kegelLogs")

  // Calculate averages for each month
  Object.values(monthlyGroups).forEach((group) => {
    if (group.uroLogs.length > 0) {
      group.averageFlowRate = group.uroLogs.reduce((sum, log) => sum + log.flowRate, 0) / group.uroLogs.length
      group.averageVolume = group.uroLogs.reduce((sum, log) => sum + log.volume, 0) / group.uroLogs.length
      group.averageDuration = group.uroLogs.reduce((sum, log) => sum + log.duration, 0) / group.uroLogs.length
    }

    if (group.hydroLogs.length > 0) {
      // Calculate average fluid intake - convert all to mL for consistency
      const totalIntake = group.hydroLogs.reduce((sum, log) => {
        const amount = log.unit === "oz" ? log.amount * 29.5735 : log.amount
        return sum + amount
      }, 0)
      group.averageFluidIntake = totalIntake / group.hydroLogs.length
    }

    if (group.kegelLogs.length > 0) {
      group.averageKegelReps = group.kegelLogs.reduce((sum, log) => sum + log.reps, 0) / group.kegelLogs.length
      group.averageKegelHoldTime = group.kegelLogs.reduce((sum, log) => sum + log.holdTime, 0) / group.kegelLogs.length
      group.averageKegelSets = group.kegelLogs.reduce((sum, log) => sum + log.sets, 0) / group.kegelLogs.length
      group.averageKegelTotalTime =
        group.kegelLogs.reduce((sum, log) => sum + log.totalTime, 0) / group.kegelLogs.length
    }
  })

  return Object.values(monthlyGroups).sort((a, b) => (a.key > b.key ? -1 : 1))
}

const DataManagement: React.FC<DataManagementProps> = ({ title2, hasDemoDataState }) => {
  const [uroLogs, setUroLogs] = useState<UroLog[]>([])
  const [hydroLogs, setHydroLogs] = useState<HydroLog[]>([])
  const [kegelLogs, setKegelLogs] = useState<KegelLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { getAllUroLogs, getAllHydroLogs, getAllKegelLogs } = await import("../services/db")
        const uroLogsData = await getAllUroLogs()
        const hydroLogsData = await getAllHydroLogs()
        const kegelLogsData = await getAllKegelLogs()

        setUroLogs(uroLogsData)
        setHydroLogs(hydroLogsData)
        setKegelLogs(kegelLogsData)

        // Group logs by month
        const groups = groupLogsByMonth(uroLogsData, hydroLogsData, kegelLogsData)
        setMonthlyGroups(groups)

        // Initialize expanded state for the first month
        if (groups.length > 0) {
          setExpandedMonths({ [groups[0].key]: true })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage({
          type: "error",
          text: "Failed to load data. Please try again.",
        })
      } finally {
        setIsLoading(false)
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
  const deleteEntry = async (type: "uroLog" | "hydroLog" | "kegelLog", timestamp: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const { deleteUroLog, deleteHydroLog, deleteKegelLog } = await import("../services/db")

      if (type === "uroLog") {
        await deleteUroLog(timestamp)
        setUroLogs((prev) => prev.filter((log) => log.timestamp !== timestamp))
      } else if (type === "hydroLog") {
        await deleteHydroLog(timestamp)
        setHydroLogs((prev) => prev.filter((log) => log.timestamp !== timestamp))
      } else if (type === "kegelLog") {
        await deleteKegelLog(timestamp)
        setKegelLogs((prev) => prev.filter((log) => log.timestamp !== timestamp))
      }

      // Update monthly groups
      const updatedGroups = groupLogsByMonth(
        type === "uroLog" ? uroLogs.filter((log) => log.timestamp !== timestamp) : uroLogs,
        type === "hydroLog" ? hydroLogs.filter((log) => log.timestamp !== timestamp) : hydroLogs,
        type === "kegelLog" ? kegelLogs.filter((log) => log.timestamp !== timestamp) : kegelLogs,
      )
      setMonthlyGroups(updatedGroups)

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

  // Export data as CSV
  const exportData = () => {
    try {
      // Create CSV content
      let csvContent = "Date,Time,Type,Volume (mL),Duration (s),Flow Rate (mL/s),Color,Urgency,Concerns,Notes\n"

      // Add UroLog entries
      uroLogs.forEach((log) => {
        const date = new Date(log.timestamp)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()
        const volume = log.volume
        const duration = log.duration
        const flowRate = log.flowRate
        const color = log.color || ""
        const urgency = log.urgency || ""
        const concerns = log.concerns ? log.concerns.join(", ") : ""
        const notes = log.notes || ""

        csvContent += `${dateStr},${timeStr},UroLog,${volume},${duration},${flowRate},"${color}","${urgency}","${concerns}","${notes}"\n`
      })

      // Add HydroLog entries
      hydroLogs.forEach((log) => {
        const date = new Date(log.timestamp)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()
        const type = log.type
        const customType = log.customType || ""
        const amount = log.amount
        const unit = log.unit
        const notes = log.notes || ""
        const volumeInMl = unit === "oz" ? amount * 29.5735 : amount

        csvContent += `${dateStr},${timeStr},HydroLog,${volumeInMl},,,,,,"${type}${
          customType ? ` (${customType})` : ""
        } - ${amount} ${unit} - ${notes}"\n`
      })

      // Add KegelLog entries
      kegelLogs.forEach((log) => {
        const date = new Date(log.timestamp)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()
        const reps = log.reps
        const holdTime = log.holdTime
        const sets = log.sets
        const totalTime = log.totalTime
        const completed = log.completed ? "Yes" : "No"
        const notes = log.notes || ""

        csvContent += `${dateStr},${timeStr},KegelLog,,${totalTime},,,,,"Reps: ${reps}, Hold: ${holdTime}s, Sets: ${sets}, Completed: ${completed} - ${notes}"\n`
      })

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `flow-tracker-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

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

  // Import data from CSV
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split("\n")

        // Skip header row
        const dataRows = lines.slice(1).filter((line) => line.trim() !== "")

        const newUroLogs: UroLog[] = []
        const newHydroLogs: HydroLog[] = []
        const newKegelLogs: KegelLog[] = []

        // Process each row
        for (const row of dataRows) {
          const columns = row.split(",")

          // Basic validation
          if (columns.length < 4) continue

          const dateStr = columns[0]
          const timeStr = columns[1]
          const type = columns[2]
          const date = new Date(`${dateStr} ${timeStr}`)
          const timestamp = date.toISOString()

          // Check if entry already exists
          const existingUroLog = uroLogs.find((log) => log.timestamp === timestamp)
          const existingHydroLog = hydroLogs.find((log) => log.timestamp === timestamp)
          const existingKegelLog = kegelLogs.find((log) => log.timestamp === timestamp)

          if (existingUroLog || existingHydroLog || existingKegelLog) {
            console.log(`Skipping duplicate entry at ${timestamp}`)
            continue
          }

          if (type === "UroLog") {
            const volume = Number.parseFloat(columns[3])
            const duration = Number.parseFloat(columns[4])
            const flowRate = Number.parseFloat(columns[5])
            const color = columns[6].replace(/"/g, "")
            const urgency = columns[7].replace(/"/g, "")
            const concerns = columns[8]
              .replace(/"/g, "")
              .split(", ")
              .filter((c) => c)
            const notes = columns[9].replace(/"/g, "")

            newUroLogs.push({
              timestamp,
              volume,
              duration,
              flowRate,
              color: color || undefined,
              urgency: urgency || undefined,
              concerns: concerns.length > 0 ? concerns : undefined,
              notes: notes || undefined,
            })
          } else if (type === "HydroLog") {
            // Parse the notes field to extract type, amount, and unit
            const notesField = columns[9].replace(/"/g, "")
            const typeMatch = notesField.match(/^(.+?)(?:\s+$$(.+?)$$)?\s+-\s+(\d+\.?\d*)\s+(mL|oz)/)

            if (typeMatch) {
              const fluidType = typeMatch[1].trim()
              const customType = typeMatch[2] ? typeMatch[2].trim() : undefined
              const amount = Number.parseFloat(typeMatch[3])
              const unit = typeMatch[4] as "mL" | "oz"
              const notes = notesField.split(" - ").slice(2).join(" - ").trim()

              newHydroLogs.push({
                timestamp,
                type: fluidType as any,
                customType,
                amount,
                unit,
                notes: notes || undefined,
              })
            }
          } else if (type === "KegelLog") {
            // Parse the notes field to extract reps, hold time, sets, and completed
            const notesField = columns[9].replace(/"/g, "")
            const kegelMatch = notesField.match(
              /Reps:\s+(\d+),\s+Hold:\s+(\d+)s,\s+Sets:\s+(\d+),\s+Completed:\s+(Yes|No)/,
            )

            if (kegelMatch) {
              const reps = Number.parseInt(kegelMatch[1])
              const holdTime = Number.parseInt(kegelMatch[2])
              const sets = Number.parseInt(kegelMatch[3])
              const completed = kegelMatch[4] === "Yes"
              const totalTime = Number.parseInt(columns[4])
              const notes = notesField.split(" - ").slice(1).join(" - ").trim()

              newKegelLogs.push({
                timestamp,
                reps,
                holdTime,
                sets,
                totalTime,
                completed,
                notes: notes || undefined,
              })
            }
          }
        }

        // Add new entries to the database
        const { bulkAddUroLogs, bulkAddHydroLogs, bulkAddKegelLogs } = await import("../services/db")

        if (newUroLogs.length > 0) {
          await bulkAddUroLogs(newUroLogs)
        }

        if (newHydroLogs.length > 0) {
          await bulkAddHydroLogs(newHydroLogs)
        }

        if (newKegelLogs.length > 0) {
          await bulkAddKegelLogs(newKegelLogs)
        }

        // Update state
        setUroLogs((prev) => [...prev, ...newUroLogs])
        setHydroLogs((prev) => [...prev, ...newHydroLogs])
        setKegelLogs((prev) => [...prev, ...newKegelLogs])

        // Update monthly groups
        const updatedGroups = groupLogsByMonth(
          [...uroLogs, ...newUroLogs],
          [...hydroLogs, ...newHydroLogs],
          [...kegelLogs, ...newKegelLogs],
        )
        setMonthlyGroups(updatedGroups)

        setMessage({
          type: "success",
          text: `Imported ${newUroLogs.length} UroLogs, ${newHydroLogs.length} HydroLogs, and ${newKegelLogs.length} KegelLogs.`,
        })

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } catch (error) {
        console.error("Error importing data:", error)
        setMessage({
          type: "error",
          text: "Failed to import data. Please check the file format and try again.",
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
    if (!confirm("This will generate demo data for testing. Continue?")) {
      return
    }

    setIsGeneratingData(true)
    try {
      generateDemoData()
      setMessage({
        type: "success",
        text: "Demo data generated successfully. Refresh the page to see the data.",
      })

      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
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

  // Share data
  const shareData = async () => {
    if (!isShareAvailable()) {
      alert("Sharing is not available on this device. Data will be copied to clipboard instead.")
    }

    try {
      // Create a summary of the data
      const summary = `Flow Tracker Data Summary
      
Total UroLogs: ${uroLogs.length}
Total HydroLogs: ${hydroLogs.length}
Total KegelLogs: ${kegelLogs.length}

Average Flow Rate: ${
        uroLogs.length > 0 ? (uroLogs.reduce((sum, log) => sum + log.flowRate, 0) / uroLogs.length).toFixed(2) : "N/A"
      } mL/s
Average Volume: ${
        uroLogs.length > 0 ? (uroLogs.reduce((sum, log) => sum + log.volume, 0) / uroLogs.length).toFixed(2) : "N/A"
      } mL
Average Duration: ${
        uroLogs.length > 0 ? (uroLogs.reduce((sum, log) => sum + log.duration, 0) / uroLogs.length).toFixed(2) : "N/A"
      } seconds

Data from ${new Date(Math.min(...uroLogs.map((log) => new Date(log.timestamp).getTime()))).toLocaleDateString()} to ${new Date().toLocaleDateString()}
`

      // Share the data
      await safeShare({
        title: "Flow Tracker Data Summary",
        text: summary,
      })

      setMessage({
        type: "success",
        text: "Data shared successfully.",
      })

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error sharing data:", error)
      setMessage({
        type: "error",
        text: "Failed to share data. Please try again.",
      })
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mr-2" />
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title2 && <div>{title2}</div>}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Download size={18} className="mr-2" />
          Export Data (CSV)
        </button>

        <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center cursor-pointer">
          <Upload size={18} className="mr-2" />
          Import Data (CSV)
          <input type="file" accept=".csv" onChange={importData} className="hidden" ref={fileInputRef} />
        </label>

        <button
          onClick={shareData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Share2 size={18} className="mr-2" />
          Share Summary
        </button>

        {!hasDemoDataState && (
          <button
            onClick={handleGenerateDemoData}
            disabled={isGeneratingData}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingData ? (
              <RefreshCw size={18} className="mr-2 animate-spin" />
            ) : (
              <Plus size={18} className="mr-2" />
            )}
            Generate Demo Data
          </button>
        )}
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check size={20} className="mr-2 flex-shrink-0" />
          ) : (
            <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Data summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium flex items-center">
              <Database size={16} className="mr-2 text-blue-500" />
              UroLogs
            </h4>
            <p className="text-2xl font-bold">{uroLogs.length}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium flex items-center">
              <Database size={16} className="mr-2 text-green-500" />
              HydroLogs
            </h4>
            <p className="text-2xl font-bold">{hydroLogs.length}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium flex items-center">
              <Database size={16} className="mr-2 text-purple-500" />
              KegelLogs
            </h4>
            <p className="text-2xl font-bold">{kegelLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Auto-backup settings */}
      <AutoBackupSettings triggerBackup={exportData} />

      {/* Monthly data */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Monthly Data</h3>

        {monthlyGroups.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p>No data available. Start tracking to see your data here.</p>
          </div>
        ) : (
          monthlyGroups.map((group) => (
            <div
              key={group.key}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => toggleMonth(group.key)}
              >
                <h4 className="font-medium">{group.label}</h4>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                    {group.uroLogs.length} UroLogs, {group.hydroLogs.length} HydroLogs, {group.kegelLogs.length}{" "}
                    KegelLogs
                  </span>
                  <svg
                    className={`h-5 w-5 transform transition-transform ${
                      expandedMonths[group.key] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedMonths[group.key] && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Month summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Flow Rate</h5>
                      <p className="text-xl font-bold">
                        {group.averageFlowRate > 0 ? group.averageFlowRate.toFixed(2) : "N/A"} mL/s
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Volume</h5>
                      <p className="text-xl font-bold">
                        {group.averageVolume > 0 ? group.averageVolume.toFixed(0) : "N/A"} mL
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Duration</h5>
                      <p className="text-xl font-bold">
                        {group.averageDuration > 0 ? group.averageDuration.toFixed(1) : "N/A"} sec
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Fluid Intake</h5>
                      <p className="text-xl font-bold">
                        {group.averageFluidIntake > 0 ? group.averageFluidIntake.toFixed(0) : "N/A"} mL
                      </p>
                    </div>
                  </div>

                  {/* Tabs for UroLogs, HydroLogs, and KegelLogs */}
                  <div className="mb-4">
                    <div className="flex border-b">
                      <button
                        className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        onClick={() => {}}
                      >
                        UroLogs ({group.uroLogs.length})
                      </button>
                      <button
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => {}}
                      >
                        HydroLogs ({group.hydroLogs.length})
                      </button>
                      <button
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => {}}
                      >
                        KegelLogs ({group.kegelLogs.length})
                      </button>
                    </div>
                  </div>

                  {/* UroLogs table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Date & Time
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Volume (mL)
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Duration (s)
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Flow Rate (mL/s)
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Color
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {group.uroLogs.slice(0, 5).map((log) => (
                          <tr key={log.timestamp}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {log.volume}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {log.duration.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {log.flowRate.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {log.color || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <button
                                onClick={() => deleteEntry("uroLog", log.timestamp)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {group.uroLogs.length > 5 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                              {group.uroLogs.length - 5} more entries...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DataManagement
