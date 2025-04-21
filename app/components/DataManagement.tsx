"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Trash2,
  BarChart,
  Droplet,
  Clock,
  Calendar,
  Coffee,
  Database,
  Trash,
  Share2,
} from "lucide-react"
import type { UroLog, HydroLog } from "../types"
import {
  bulkAddUroLogs,
  bulkAddHydroLogs,
  deleteAllUroLogs,
  deleteAllHydroLogs,
  deleteUroLog,
  deleteHydroLog,
} from "../services/db"
import { shareContent } from "../services/share"

// Add the title2 prop to the interface
interface DataManagementProps {
  title2?: React.ReactNode
}

interface MonthlyGroup {
  key: string
  label: string
  uroLogs: UroLog[]
  hydroLogs: HydroLog[]
  averageFlowRate: number
  averageVolume: number
  averageDuration: number
  averageFluidIntake: number
}

// Update the component definition
const DataManagement: React.FC<DataManagementProps> = ({ title2 }) => {
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
  const [shareTestResults, setShareTestResults] = useState<string | null>(null)
  const [dbCounts, setDbCounts] = useState<{
    uroLogs: number
    hydroLogs: number
  }>({ uroLogs: 0, hydroLogs: 0 })

  // Add new state variables for entries fetched directly from IndexedDB
  const [dbUroLogs, setDbUroLogs] = useState<UroLog[]>([])
  const [dbHydroLogs, setDbHydroLogs] = useState<HydroLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Declare monthlyGroups, toggleMonthExpand, and calculateAverage
  const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>([])

  const toggleMonthExpand = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }))
  }

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + val, 0)
    return sum / values.length
  }

  // Update the fetchDbCounts function
  const fetchDbCounts = async () => {
    try {
      const { db } = await import("../services/db")
      const uroCount = await db.uroLogs.count()
      const hydroCount = await db.hydroLogs.count()
      setDbCounts({
        uroLogs: uroCount,
        hydroLogs: hydroCount,
      })
    } catch (error) {
      console.error("Error fetching database counts:", error)
    }
  }

  // Update the fetchEntriesFromDb function
  const fetchEntriesFromDb = async () => {
    setIsLoading(true)
    try {
      const { db } = await import("../services/db")

      // Add error handling and fallbacks
      let uroLogs = []
      let hydroLogs = []

      try {
        // Check if the tables exist before calling toArray()
        if (db.uroLogs) {
          uroLogs = await db.uroLogs.toArray()
        }
      } catch (error) {
        console.error("Error fetching uroLogs:", error)
      }

      try {
        if (db.hydroLogs) {
          hydroLogs = await db.hydroLogs.toArray()
        }
      } catch (error) {
        console.error("Error fetching hydroLogs:", error)
      }

      setDbUroLogs(uroLogs)
      setDbHydroLogs(hydroLogs)

      // Update counts
      setDbCounts({
        uroLogs: uroLogs.length,
        hydroLogs: hydroLogs.length,
      })
    } catch (error) {
      console.error("Error fetching entries from database:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch database counts when component mounts or entries change
  useEffect(() => {
    fetchDbCounts()
  }, [])

  // Call fetchEntriesFromDb when component mounts and after operations that modify the database
  useEffect(() => {
    fetchEntriesFromDb()
  }, [])

  useEffect(() => {
    setMonthlyGroups(groupEntriesByMonth())
  }, [dbUroLogs, dbHydroLogs])

  // Update the generateDemoData function
  const generateDemoData = () => {
    if (!confirm("This will generate 3 months of mock data (3 entries per day). Continue?")) {
      return
    }

    const mockUroLogs: UroLog[] = []
    const mockHydroLogs: HydroLog[] = []
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

        const urgencies = [
          "Normal",
          "Hour < 60 min",
          "Hold < 15 min",
          "Hold < 5 minutes",
          "Had drips",
          "Couldn't hold it",
        ]

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

        // Create UroLog entry with additional fields
        mockUroLogs.push({
          timestamp: entryTime.toISOString(),
          volume,
          duration,
          flowRate: flowRateVariation,
          color,
          urgency,
          concerns,
          notes: "Mock data to be removed",
        })

        // Generate random fluid intake data
        const fluidTypes = ["Water", "Coffee", "Tea", "Juice", "Soda"] as const
        const fluidType = fluidTypes[Math.floor(Math.random() * fluidTypes.length)]
        const fluidAmount = Math.floor(Math.random() * 300) + 200 // 200-500 mL

        // Create HydroLog entry with same timestamp
        mockHydroLogs.push({
          timestamp: entryTime.toISOString(),
          type: fluidType,
          amount: fluidAmount,
          unit: "mL",
          notes: "Mock data to be removed",
        })
      }
    }

    // Update state and database
    try {
      bulkAddUroLogs(mockUroLogs)
      bulkAddHydroLogs(mockHydroLogs)
      // Refresh entries from DB
      fetchEntriesFromDb()
    } catch (error) {
      console.error("Error adding mock data to database:", error)
    }
  }

  // Update the delete functions
  const handleDeleteUroLog = async (timestamp: string) => {
    if (confirm("Are you sure you want to delete this UroLog entry?")) {
      try {
        // Delete from IndexedDB
        await deleteUroLog(timestamp)
        // Refresh entries from DB
        fetchEntriesFromDb()
      } catch (error) {
        console.error("Error deleting UroLog entry:", error)
      }
    }
  }

  const handleDeleteHydroLog = async (timestamp: string) => {
    if (confirm("Are you sure you want to delete this HydroLog entry?")) {
      try {
        // Delete from IndexedDB
        await deleteHydroLog(timestamp)
        // Refresh entries from DB
        fetchEntriesFromDb()
      } catch (error) {
        console.error("Error deleting HydroLog entry:", error)
      }
    }
  }

  // Update the deleteDemoData function
  const deleteDemoData = async () => {
    if (!confirm("This will delete all mock data entries. Continue?")) {
      return
    }

    const realUroLogs = dbUroLogs.filter((entry) => entry.notes !== "Mock data to be removed")
    const realHydroLogs = dbHydroLogs.filter((entry) => entry.notes !== "Mock data to be removed")

    try {
      // Delete all entries and re-add only the real ones
      await deleteAllUroLogs()
      await deleteAllHydroLogs()

      if (realUroLogs.length > 0) {
        await bulkAddUroLogs(realUroLogs)
      }

      if (realHydroLogs.length > 0) {
        await bulkAddHydroLogs(realHydroLogs)
      }

      // Refresh entries from DB
      fetchEntriesFromDb()
    } catch (error) {
      console.error("Error deleting mock data:", error)
    }
  }

  // Update the exportData function
  const exportData = () => {
    // Create combined entries for export
    const combinedEntries = dbUroLogs.map((uroLog) => {
      // Find matching HydroLog entry
      const matchingHydroLog = dbHydroLogs.find((hydroLog) => hydroLog.timestamp === uroLog.timestamp)

      if (matchingHydroLog) {
        return {
          ...uroLog,
          fluidIntake: {
            type: matchingHydroLog.type,
            customType: matchingHydroLog.customType,
            amount: matchingHydroLog.amount,
            unit: matchingHydroLog.unit,
            notes: matchingHydroLog.notes,
          },
        }
      }

      return uroLog
    })

    // Add hydro entries that don't have matching uro entries
    dbHydroLogs.forEach((hydroLog) => {
      const hasMatchingUroLog = dbUroLogs.some((uroLog) => uroLog.timestamp === hydroLog.timestamp)

      if (!hasMatchingUroLog) {
        combinedEntries.push({
          timestamp: hydroLog.timestamp,
          volume: 0,
          duration: 0,
          flowRate: 0,
          fluidIntake: {
            type: hydroLog.type,
            customType: hydroLog.customType,
            amount: hydroLog.amount,
            unit: hydroLog.unit,
            notes: hydroLog.notes,
          },
        })
      }
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Original Timestamp,Date,Time,Volume (mL),Duration (s),Flow Rate (mL/s),Color,Urgency,Concerns,Flow Notes,Fluid Type,Fluid Custom Type,Fluid Amount,Fluid Unit,Fluid Notes\n" +
      combinedEntries
        .map((e) => {
          const date = new Date(e.timestamp)
          const dateStr = date.toISOString().split("T")[0]
          const timeStr = date.toTimeString().substring(0, 8)

          // Handle fluid intake data
          const fluidType = e.fluidIntake?.type || ""
          const fluidCustomType = e.fluidIntake?.customType || ""
          const fluidAmount = e.fluidIntake?.amount || ""
          const fluidUnit = e.fluidIntake?.unit || ""
          const fluidNotes = e.fluidIntake?.notes || ""

          return `${e.timestamp},${dateStr},${timeStr},${e.volume},${e.duration},${e.flowRate},${e.color || ""},${
            e.urgency || ""
          },"${e.concerns ? e.concerns.join("; ") : ""}","${e.notes ? e.notes.replace(/"/g, '""') : ""}","${fluidType}","${fluidCustomType}","${fluidAmount}","${fluidUnit}","${
            fluidNotes ? fluidNotes.replace(/"/g, '""') : ""
          }"`
        })
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "my_uro_log_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Update the importData function
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split("\n")

          // Parse CSV, handling quoted fields properly
          const parseCSVLine = (line: string) => {
            const result = []
            let current = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]

              if (char === '"') {
                // Handle escaped quotes (two double quotes in a row)
                if (i + 1 < line.length && line[i + 1] === '"') {
                  current += '"'
                  i++ // Skip the next quote
                } else {
                  inQuotes = !inQuotes
                }
              } else if (char === "," && !inQuotes) {
                result.push(current)
                current = ""
              } else {
                current += char
              }
            }

            result.push(current) // Add the last field
            return result
          }

          // Check the header to determine the format
          const header = lines[0].toLowerCase()
          const hasOriginalTimestamp = header.includes("original timestamp")
          const isNewFormat = header.includes("date") && header.includes("time")

          // Get all existing timestamps directly from the database for duplicate checking
          const { db } = await import("../services/db")
          const existingUroTimestamps = new Set((await db.uroLogs.toArray()).map((entry) => entry.timestamp))
          const existingHydroTimestamps = new Set((await db.hydroLogs.toArray()).map((entry) => entry.timestamp))

          const newUroLogs: UroLog[] = []
          const newHydroLogs: HydroLog[] = []
          const skippedUroEntries: string[] = []
          const skippedHydroEntries: string[] = []

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
              const fields = parseCSVLine(line)

              // Determine timestamp based on format
              let timestamp: string

              if (hasOriginalTimestamp && fields[0] && fields[0].trim()) {
                // Use the original timestamp if available
                timestamp = fields[0].trim()
              } else if (isNewFormat) {
                // Parse date and time from separate fields
                const dateIndex = hasOriginalTimestamp ? 1 : 0
                const timeIndex = hasOriginalTimestamp ? 2 : 1

                const dateStr = fields[dateIndex].replace(/"/g, "").trim()
                const timeStr = fields[timeIndex].replace(/"/g, "").trim()

                // Create timestamp from date and time
                try {
                  // Try to parse the date in MM/DD/YY format
                  const dateParts = dateStr.split("/")
                  if (dateParts.length === 3) {
                    // Handle 2-digit year
                    if (dateParts[2].length === 2) {
                      dateParts[2] = "20" + dateParts[2]
                    }

                    // Format as YYYY-MM-DD for ISO date
                    const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(
                      2,
                      "0",
                    )}`

                    // Parse time - handle AM/PM format
                    let formattedTime = timeStr
                    if (timeStr.includes("AM") || timeStr.includes("PM")) {
                      // Convert 12-hour format to 24-hour format
                      const timeParts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/)
                      if (timeParts) {
                        let hours = Number.parseInt(timeParts[1])
                        const minutes = timeParts[2]
                        const ampm = timeParts[3]

                        if (ampm === "PM" && hours < 12) hours += 12
                        if (ampm === "AM" && hours === 12) hours = 0

                        formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`
                      }
                    }

                    timestamp = new Date(`${formattedDate}T${formattedTime}`).toISOString()
                  } else {
                    // Try direct parsing if not in MM/DD/YY format
                    timestamp = new Date(`${dateStr}T${timeStr}`).toISOString()
                  }
                } catch (error) {
                  console.error("Error parsing date/time:", dateStr, timeStr, error)
                  // Use current timestamp as fallback
                  timestamp = new Date().toISOString()
                }
              } else {
                // Old format - first field is the timestamp
                timestamp = fields[0]
              }

              // Calculate field indices based on format
              const offset = hasOriginalTimestamp ? 1 : 0
              const volumeIndex = isNewFormat ? 2 + offset : 1
              const durationIndex = isNewFormat ? 3 + offset : 2
              const flowRateIndex = isNewFormat ? 4 + offset : 3
              const colorIndex = isNewFormat ? 5 + offset : undefined
              const urgencyIndex = isNewFormat ? 6 + offset : undefined
              const concernsIndex = isNewFormat ? 7 + offset : undefined
              const flowNotesIndex = isNewFormat ? 8 + offset : undefined
              const fluidTypeIndex = isNewFormat ? 9 + offset : 4
              const fluidCustomTypeIndex = isNewFormat ? 10 + offset : undefined
              const fluidAmountIndex = isNewFormat ? 11 + offset : 5
              const fluidUnitIndex = isNewFormat ? 12 + offset : 6
              const fluidNotesIndex = isNewFormat ? 13 + offset : undefined

              // Parse UroLog fields
              const volume = Number.parseFloat(fields[volumeIndex] || "0")
              const duration = Number.parseFloat(fields[durationIndex] || "0")
              const flowRate = Number.parseFloat(fields[flowRateIndex] || "0")
              const color = colorIndex !== undefined ? fields[colorIndex] : undefined
              const urgency = urgencyIndex !== undefined ? fields[urgencyIndex] : undefined
              const concerns =
                concernsIndex !== undefined && fields[concernsIndex]
                  ? fields[concernsIndex].split(";").map((c) => c.trim())
                  : undefined
              const flowNotes = flowNotesIndex !== undefined ? fields[flowNotesIndex] : undefined

              // Create UroLog if we have valid data and it doesn't already exist
              if (volume > 0 && duration > 0 && flowRate > 0) {
                if (existingUroTimestamps.has(timestamp)) {
                  // Skip this entry as it already exists
                  skippedUroEntries.push(timestamp)
                } else {
                  newUroLogs.push({
                    timestamp,
                    volume,
                    duration,
                    flowRate,
                    color,
                    urgency,
                    concerns,
                    notes: flowNotes,
                  })
                  // Add to set to prevent duplicates within the import
                  existingUroTimestamps.add(timestamp)
                }
              }

              // Parse HydroLog fields
              const fluidType = fluidTypeIndex !== undefined ? fields[fluidTypeIndex] : ""
              const fluidCustomType = fluidCustomTypeIndex !== undefined ? fields[fluidCustomTypeIndex] : undefined
              const fluidAmount =
                fluidAmountIndex !== undefined ? Number.parseFloat(fields[fluidAmountIndex] || "0") : 0
              const fluidUnit = fluidUnitIndex !== undefined ? (fields[fluidUnitIndex] as "oz" | "mL") || "mL" : "mL"
              const fluidNotes = fluidNotesIndex !== undefined ? fields[fluidNotesIndex] : undefined

              // Create HydroLog if we have valid data and it doesn't already exist
              if (fluidType && fluidAmount > 0) {
                if (existingHydroTimestamps.has(timestamp)) {
                  // Skip this entry as it already exists
                  skippedHydroEntries.push(timestamp)
                } else {
                  newHydroLogs.push({
                    timestamp,
                    type: fluidType as any,
                    customType: fluidCustomType,
                    amount: fluidAmount,
                    unit: fluidUnit,
                    notes: fluidNotes,
                  })
                  // Add to set to prevent duplicates within the import
                  existingHydroTimestamps.add(timestamp)
                }
              }
            } catch (error) {
              console.error("Error parsing CSV line:", line, error)
              // Continue with next line
            }
          }

          // Add new entries to database
          if (newUroLogs.length > 0) {
            try {
              await bulkAddUroLogs(newUroLogs)
            } catch (error) {
              console.error("Error adding UroLogs to database:", error)
            }
          }

          if (newHydroLogs.length > 0) {
            try {
              await bulkAddHydroLogs(newHydroLogs)
            } catch (error) {
              console.error("Error adding HydroLogs to database:", error)
            }
          }

          // Refresh entries from database
          await fetchEntriesFromDb()

          // Create a detailed message about the restoration
          let message = `Restoration complete!\n\n`

          if (newUroLogs.length > 0 || newHydroLogs.length > 0) {
            message += `✅ Successfully added ${newUroLogs.length + newHydroLogs.length} new entries to database:\n`
            if (newUroLogs.length > 0) {
              message += `   • ${newUroLogs.length} UroLogs\n`
            }
            if (newHydroLogs.length > 0) {
              message += `   • ${newHydroLogs.length} HydroLogs\n`
            }
          } else {
            message += "❌ No new entries were added to the database.\n"
          }

          if (skippedUroEntries.length > 0 || skippedHydroEntries.length > 0) {
            message += `\n⚠️ Skipped ${skippedUroEntries.length + skippedHydroEntries.length} duplicate entries (already exist in database):\n`
            if (skippedUroEntries.length > 0) {
              message += `   • ${skippedUroEntries.length} UroLogs\n`
            }
            if (skippedHydroEntries.length > 0) {
              message += `   • ${skippedHydroEntries.length} HydroLogs\n`
            }
          }

          // Show alert with import results
          alert(message)

          // Add a confirmation to run storage tests
          if (newUroLogs.length > 0 || newHydroLogs.length > 0) {
            if (confirm("Would you like to run storage tests to verify no duplicates were created?")) {
              // Scroll to the Help section and open the Storage Tests section
              const helpButton = document.querySelector('button[aria-label="Help"]')
              if (helpButton) {
                ;(helpButton as HTMLButtonElement).click()

                // Wait for the Help section to load
                setTimeout(() => {
                  // Find and click the Development section
                  const developmentSection = Array.from(document.querySelectorAll("h2")).find((el) =>
                    el.textContent?.includes("Development"),
                  )
                  if (developmentSection) {
                    developmentSection.click()

                    // Find and click the Storage Tests section
                    setTimeout(() => {
                      const storageTestsSection = Array.from(document.querySelectorAll("h3")).find((el) =>
                        el.textContent?.includes("Storage Tests"),
                      )
                      if (storageTestsSection) {
                        storageTestsSection.click()

                        // Find and click the Run Tests button
                        setTimeout(() => {
                          const runTestsButton = Array.from(document.querySelectorAll("button")).find((el) =>
                            el.textContent?.includes("Run Tests"),
                          )
                          if (runTestsButton) {
                            ;(runTestsButton as HTMLButtonElement).click()
                          }
                        }, 300)
                      }
                    }, 300)
                  }
                }, 300)
              }
            }
          }
        } catch (error) {
          console.error("Error processing CSV file:", error)
          alert("Error processing your backup file. Please check that it's a valid backup file (CSV format).")
        }
      }
      reader.readAsText(file)
      // Reset the input
      event.target.value = ""
    }
  }

  // Update the groupEntriesByMonth function
  const groupEntriesByMonth = (): MonthlyGroup[] => {
    const groups: Record<
      string,
      {
        uroLogs: UroLog[]
        hydroLogs: HydroLog[]
      }
    > = {}

    // Process UroLogs
    dbUroLogs.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!groups[monthYear]) {
        groups[monthYear] = {
          uroLogs: [],
          hydroLogs: [],
        }
      }

      groups[monthYear].uroLogs.push(entry)
    })

    // Process HydroLogs
    dbHydroLogs.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!groups[monthYear]) {
        groups[monthYear] = {
          uroLogs: [],
          hydroLogs: [],
        }
      }

      groups[monthYear].hydroLogs.push(entry)
    })

    // Calculate averages for each month
    return Object.entries(groups)
      .map(([key, { uroLogs, hydroLogs }]) => {
        const date = new Date(uroLogs.length > 0 ? uroLogs[0].timestamp : hydroLogs[0].timestamp)
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]

        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

        // Calculate flow averages
        const averageFlowRate =
          uroLogs.length > 0 ? uroLogs.reduce((sum, entry) => sum + entry.flowRate, 0) / uroLogs.length : 0

        const averageVolume =
          uroLogs.length > 0 ? uroLogs.reduce((sum, entry) => sum + entry.volume, 0) / uroLogs.length : 0

        const averageDuration =
          uroLogs.length > 0 ? uroLogs.reduce((sum, entry) => sum + entry.duration, 0) / uroLogs.length : 0

        // Calculate fluid intake average
        const fluidIntakeAmounts = hydroLogs.map((entry) =>
          entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount,
        )

        const averageFluidIntake =
          fluidIntakeAmounts.length > 0
            ? fluidIntakeAmounts.reduce((sum, amount) => sum + amount, 0) / fluidIntakeAmounts.length
            : 0

        return {
          key,
          label,
          uroLogs,
          hydroLogs,
          averageFlowRate,
          averageVolume,
          averageDuration,
          averageFluidIntake,
        }
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        const dateA = new Date(a.key + "-01")
        const dateB = new Date(b.key + "-01")
        return dateB.getTime() - dateA.getTime()
      })
  }

  // Restore the formatDate and formatTime functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Restore the getColorClass and getUrgencyClass functions
  const getColorClassValue = (color?: string): string => {
    if (!color) return "text-gray-500 dark:text-gray-400"

    switch (color) {
      case "Light Yellow":
        return "text-yellow-600 dark:text-yellow-400"
      case "Clear":
        return "text-blue-500 dark:text-blue-300"
      case "Dark Yellow":
        return "text-amber-600 dark:text-amber-400"
      case "Amber or Honey":
        return "text-amber-700 dark:text-amber-500"
      case "Orange":
        return "text-orange-600 dark:text-orange-400"
      case "Pink or Red":
        return "text-red-600 dark:text-red-400"
      case "Blue or Green":
        return "text-teal-600 dark:text-teal-400"
      case "Brown or Cola-colored":
        return "text-brown-600 dark:text-amber-700"
      case "Cloudy or Murky":
        return "text-gray-600 dark:text-gray-400"
      case "Foamy or Bubbly":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getUrgencyClassValue = (urgency?: string): string => {
    if (!urgency) return "text-gray-500 dark:text-gray-400"

    switch (urgency) {
      case "Normal":
        return "text-green-600 dark:text-green-400"
      case "Hour < 60 min":
        return "text-blue-600 dark:text-blue-400"
      case "Hold < 15 min":
        return "text-amber-600 dark:text-amber-400"
      case "Hold < 5 minutes":
        return "text-orange-600 dark:text-orange-400"
      case "Had drips":
        return "text-red-500 dark:text-red-400"
      case "Couldn't hold it":
        return "text-red-600 dark:text-red-500 font-medium"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  // Restore the shareData function and related functions
  const shareData = (monthKey?: string) => {
    const { title, text } = generateShareData(monthKey)

    // Use our improved sharing function that bypasses Web Share API in problematic environments
    shareContent({
      title,
      text,
    })
  }

  // Update the generateShareData function
  const generateShareData = (monthKey?: string): { title: string; text: string } => {
    // Determine which entries to share
    let entriesToShare: UroLog[] = []
    let hydroLogsToShare: HydroLog[] = []
    let title = "My Uro Log Data"
    let monthsToInclude: MonthlyGroup[] = []

    if (monthKey) {
      // Share specific month
      const monthGroup = monthlyGroups.find((group) => group.key === monthKey)
      if (monthGroup) {
        entriesToShare = monthGroup.uroLogs
        hydroLogsToShare = monthGroup.hydroLogs
        title = `My Uro Log Data - ${monthGroup.label}`
        monthsToInclude = [monthGroup]
      }
    } else {
      // Share all data - no limits
      entriesToShare = dbUroLogs
      hydroLogsToShare = dbHydroLogs
      monthsToInclude = monthlyGroups
      title = `My Uro Log Complete Data Summary`
    }

    // Create a summary text
    let summary = ""
    summary += "=".repeat(title.length) + "\n"

    // Overall summary
    if (entriesToShare.length > 0) {
      summary += `Total UroLogs: ${entriesToShare.length}\n`
      const avgFlowRate = calculateAverage(entriesToShare.map((entry) => entry.flowRate))
      const avgVolume = calculateAverage(entriesToShare.map((entry) => entry.volume))
      const avgDuration = calculateAverage(entriesToShare.map((entry) => entry.duration))

      summary += `Overall Average Flow Rate: ${avgFlowRate.toFixed(1)} mL/s\n`
      summary += `Overall Average Volume: ${avgVolume.toFixed(0)} mL\n`
      summary += `Overall Average Duration: ${avgDuration.toFixed(1)} sec\n\n`
    }

    if (hydroLogsToShare.length > 0) {
      summary += `Total HydroLogs: ${hydroLogsToShare.length}\n`

      // Calculate average fluid intake
      const fluidIntakeAmounts = hydroLogsToShare.map((entry) =>
        entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount,
      )
      const avgFluidIntake = calculateAverage(fluidIntakeAmounts)

      summary += `Overall Average Fluid Intake: ${avgFluidIntake.toFixed(0)} mL (${(avgFluidIntake / 29.5735).toFixed(1)} oz)\n\n`
    }

    // Monthly summaries
    if (monthsToInclude.length > 1) {
      summary += "MONTHLY SUMMARIES\n"
      summary += "----------------\n\n"

      monthsToInclude.forEach((month) => {
        summary += `${month.label}:\n`
        if (month.uroLogs.length > 0) {
          summary += `  UroLogs: ${month.uroLogs.length}\n`
          summary += `  Avg Flow Rate: ${month.averageFlowRate.toFixed(1)} mL/s\n`
          summary += `  Avg Volume: ${month.averageVolume.toFixed(0)} mL\n`
          summary += `  Avg Duration: ${month.averageDuration.toFixed(1)} sec\n`
        }

        if (month.hydroLogs.length > 0) {
          summary += `  HydroLogs: ${month.hydroLogs.length}\n`
          summary += `  Avg Fluid Intake: ${month.averageFluidIntake.toFixed(0)} mL\n`
        }
        summary += "\n"
      })
    }

    return { title, text: summary }
  }

  // Update the UI labels
  return (
    <>
      <div className="mb-4">
        {dbUroLogs.length === 0 && dbHydroLogs.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No entries yet. Add your first UroLog entry or generate demo data.
            </p>
            <button
              onClick={generateDemoData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto shadow-sm font-medium"
            >
              <Database className="mr-2" size={18} /> Generate Demo Data
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <button
              onClick={deleteDemoData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center shadow-sm font-medium"
            >
              <Trash className="mr-2" size={18} /> Delete All Demo Data
            </button>
            <button
              onClick={() => shareData()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center shadow-sm font-medium"
            >
              <Share2 size={18} className="mr-2" /> Share All Data
            </button>

            <button
              onClick={generateDemoData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Database className="mr-2" size={18} /> Generate Demo Data
            </button>
          </div>
        )}
      </div>

      {shareTestResults && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border">
          <h4 className="font-bold mb-2">Share Test Results</h4>
          <pre className="whitespace-pre-wrap text-sm">{shareTestResults}</pre>
          <button
            onClick={() => setShareTestResults(null)}
            className="mt-2 px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Update the database counts display */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Entry Logs</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEntriesFromDb}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center"
          >
            <Database size={14} className="mr-1" /> Refresh from Database
          </button>
          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
            <span className="font-medium">Database:</span> {dbCounts.uroLogs + dbCounts.hydroLogs} entries
          </div>
        </div>
      </div>

      {/* Update the UroLog and HydroLog section titles */}
      {monthlyGroups.length === 0 ? (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400 border rounded-lg">
          No entries yet. Add your first UroLog entry above.
        </div>
      ) : (
        <div className="space-y-4">
          {monthlyGroups.map((group) => (
            <div key={group.key} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 flex justify-between items-center">
                <div
                  className="font-medium flex items-center cursor-pointer"
                  onClick={() => toggleMonthExpand(group.key)}
                >
                  <Calendar size={16} className="mr-2" />
                  {group.label} ({group.uroLogs.length + group.hydroLogs.length} entries)
                </div>
                <div className="flex items-center">
                  {group.uroLogs.length > 0 && (
                    <div className="text-blue-600 dark:text-blue-400 font-bold mr-4">
                      Avg: {group.averageFlowRate.toFixed(1)} mL/s
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      shareData(group.key)
                    }}
                    className="mr-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label={`Share data for ${group.label}`}
                  >
                    <Share2 size={18} />
                  </button>
                  <div className="cursor-pointer" onClick={() => toggleMonthExpand(group.key)}>
                    {expandedMonths[group.key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {expandedMonths[group.key] && (
                <div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800 border-b">
                    {group.uroLogs.length > 0 && (
                      <>
                        <div className="flex items-center">
                          <BarChart className="mr-2 text-blue-500" size={18} />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Flow Rate</div>
                            <div className="font-medium">{group.averageFlowRate.toFixed(1)} mL/s</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Droplet className="mr-2 text-green-500" size={18} />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Volume</div>
                            <div className="font-medium">{group.averageVolume.toFixed(0)} mL</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 text-purple-500" size={18} />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</div>
                            <div className="font-medium">{group.averageDuration.toFixed(1)} sec</div>
                          </div>
                        </div>
                      </>
                    )}
                    {group.hydroLogs.length > 0 && (
                      <div className="flex items-center">
                        <Coffee className="mr-2 text-cyan-500" size={18} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Fluid Intake</div>
                          <div className="font-medium">{group.averageFluidIntake.toFixed(0)} mL</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UroLogs */}
                  {group.uroLogs.length > 0 && (
                    <div className="mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b">
                        <h4 className="font-medium">UroLogs ({group.uroLogs.length})</h4>
                      </div>
                      <div className="divide-y">
                        {group.uroLogs
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((entry) => (
                            <div key={entry.timestamp} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start">
                                  <div className="mr-4">
                                    <div className="font-medium">{formatDate(entry.timestamp)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatTime(entry.timestamp)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="mr-4 text-right">
                                    <div className="font-bold text-blue-600 dark:text-blue-400">
                                      {entry.flowRate.toFixed(1)} mL/s
                                    </div>
                                    <div className="text-sm">
                                      {entry.volume} mL in {entry.duration.toFixed(1)}s
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteUroLog(entry.timestamp)
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    aria-label="Delete entry"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Color:</span>{" "}
                                  <span className={getColorClassValue(entry.color)}>
                                    {entry.color || "Not recorded"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Urgency:</span>{" "}
                                  <span className={getUrgencyClassValue(entry.urgency)}>
                                    {entry.urgency || "Not recorded"}
                                  </span>
                                </div>
                              </div>

                              {entry.concerns && entry.concerns.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    Concerns:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {entry.concerns.map((concern, i) => (
                                      <span
                                        key={i}
                                        className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-0.5 rounded"
                                      >
                                        {concern}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.notes && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Notes:</span>
                                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">{entry.notes}</div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* HydroLogs */}
                  {group.hydroLogs.length > 0 && (
                    <div>
                      <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border-b">
                        <h4 className="font-medium">HydroLogs ({group.hydroLogs.length})</h4>
                      </div>
                      <div className="divide-y">
                        {group.hydroLogs
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((entry) => (
                            <div key={entry.timestamp} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start">
                                  <div className="mr-4">
                                    <div className="font-medium">{formatDate(entry.timestamp)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatTime(entry.timestamp)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="mr-4 text-right">
                                    <div className="font-bold text-cyan-600 dark:text-cyan-400">
                                      {entry.type === "Other" && entry.customType ? entry.customType : entry.type}
                                    </div>
                                    <div className="text-sm">
                                      {entry.amount} {entry.unit}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteHydroLog(entry.timestamp)
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    aria-label="Delete entry"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              {entry.notes && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">{entry.notes}</div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3">Backup & Restore</h3>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <p>
          <strong>Backup:</strong> Creates a file with all your data that you can save to your device.
        </p>
        <p className="mt-1">
          <strong>Restore:</strong> Loads your data from a previously created backup file.
        </p>
      </div>

      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-4">
          <button
            onClick={exportData}
            className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center"
          >
            <Download className="mr-2" /> Backup My Data
          </button>
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="w-full p-3 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center cursor-pointer">
            <Upload className="mr-2" /> Restore My Data
            <input type="file" accept=".csv,.json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading entries from database...</p>
        </div>
      )}
    </>
  )
}

export default DataManagement
