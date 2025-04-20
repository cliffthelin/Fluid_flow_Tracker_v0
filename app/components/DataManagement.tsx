"use client"

import type React from "react"
import { useState } from "react"
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
import type { FlowEntry, FluidIntakeEntry } from "../types"
// Import the database functions at the top of the file
import {
  deleteFlowEntry as dbDeleteFlowEntry,
  deleteFluidIntakeEntry as dbDeleteFluidIntakeEntry,
  deleteAllFlowEntries,
  deleteAllFluidIntakeEntries,
  bulkAddFlowEntries,
  bulkAddFluidIntakeEntries,
} from "../services/db"
// Import the share utilities at the top:
import { shareContent, isShareAvailable } from "../services/share"

// Add the title2 prop to the interface
interface DataManagementProps {
  flowEntries: FlowEntry[]
  fluidIntakeEntries: FluidIntakeEntry[]
  setFlowEntries: (entries: FlowEntry[]) => void
  setFluidIntakeEntries: (entries: FluidIntakeEntry[]) => void
  title2?: React.ReactNode
}

interface MonthlyGroup {
  key: string
  label: string
  flowEntries: FlowEntry[]
  fluidIntakeEntries: FluidIntakeEntry[]
  averageFlowRate: number
  averageVolume: number
  averageDuration: number
  averageFluidIntake: number
}

// Update the component definition to use the title2 prop
const DataManagement: React.FC<DataManagementProps> = ({
  flowEntries,
  fluidIntakeEntries,
  setFlowEntries,
  setFluidIntakeEntries,
  title2,
}) => {
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
  const [shareTestResults, setShareTestResults] = useState<string | null>(null)

  const generateMockData = () => {
    if (!confirm("This will generate 3 months of mock data (3 entries per day). Continue?")) {
      return
    }

    const mockFlowEntries: FlowEntry[] = []
    const mockFluidIntakeEntries: FluidIntakeEntry[] = []
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

        // Create flow entry with additional fields
        mockFlowEntries.push({
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

        // Create fluid intake entry with same timestamp
        mockFluidIntakeEntries.push({
          timestamp: entryTime.toISOString(),
          type: fluidType,
          amount: fluidAmount,
          unit: "mL",
          notes: "Mock data to be removed",
        })
      }
    }

    // Update state and database
    setFlowEntries([...flowEntries, ...mockFlowEntries])
    setFluidIntakeEntries([...fluidIntakeEntries, ...mockFluidIntakeEntries])

    // Add to database
    try {
      bulkAddFlowEntries(mockFlowEntries)
      bulkAddFluidIntakeEntries(mockFluidIntakeEntries)
    } catch (error) {
      console.error("Error adding mock data to database:", error)
    }
  }

  // Then update the deleteEntry function in the component
  const deleteFlowEntry = async (timestamp: string) => {
    if (confirm("Are you sure you want to delete this flow entry?")) {
      try {
        // Delete from IndexedDB
        await dbDeleteFlowEntry(timestamp)
        // Update state
        setFlowEntries(flowEntries.filter((entry) => entry.timestamp !== timestamp))
      } catch (error) {
        console.error("Error deleting flow entry:", error)
        // Still update state even if DB operation fails
        setFlowEntries(flowEntries.filter((entry) => entry.timestamp !== timestamp))
      }
    }
  }

  const deleteFluidIntakeEntry = async (timestamp: string) => {
    if (confirm("Are you sure you want to delete this fluid intake entry?")) {
      try {
        // Delete from IndexedDB
        await dbDeleteFluidIntakeEntry(timestamp)
        // Update state
        setFluidIntakeEntries(fluidIntakeEntries.filter((entry) => entry.timestamp !== timestamp))
      } catch (error) {
        console.error("Error deleting fluid intake entry:", error)
        // Still update state even if DB operation fails
        setFluidIntakeEntries(fluidIntakeEntries.filter((entry) => entry.timestamp !== timestamp))
      }
    }
  }

  // Update the deleteMockData function
  const deleteMockData = async () => {
    if (!confirm("This will delete all mock data entries. Continue?")) {
      return
    }

    const realFlowEntries = flowEntries.filter((entry) => entry.notes !== "Mock data to be removed")
    const realFluidIntakeEntries = fluidIntakeEntries.filter((entry) => entry.notes !== "Mock data to be removed")

    try {
      // Delete all entries and re-add only the real ones
      await deleteAllFlowEntries()
      await deleteAllFluidIntakeEntries()

      if (realFlowEntries.length > 0) {
        await bulkAddFlowEntries(realFlowEntries)
      }

      if (realFluidIntakeEntries.length > 0) {
        await bulkAddFluidIntakeEntries(realFluidIntakeEntries)
      }

      setFlowEntries(realFlowEntries)
      setFluidIntakeEntries(realFluidIntakeEntries)
    } catch (error) {
      console.error("Error deleting mock data:", error)
      // Still update state even if DB operation fails
      setFlowEntries(realFlowEntries)
      setFluidIntakeEntries(realFluidIntakeEntries)
    }
  }

  // Check if we have any mock data
  const hasMockData =
    flowEntries.some((entry) => entry.notes === "Mock data to be removed") ||
    fluidIntakeEntries.some((entry) => entry.notes === "Mock data to be removed")

  const exportData = () => {
    // Create combined entries for export
    const combinedEntries = flowEntries.map((flowEntry) => {
      // Find matching fluid intake entry
      const matchingFluidEntry = fluidIntakeEntries.find((fluidEntry) => fluidEntry.timestamp === flowEntry.timestamp)

      if (matchingFluidEntry) {
        return {
          ...flowEntry,
          fluidIntake: {
            type: matchingFluidEntry.type,
            customType: matchingFluidEntry.customType,
            amount: matchingFluidEntry.amount,
            unit: matchingFluidEntry.unit,
            notes: matchingFluidEntry.notes,
          },
        }
      }

      return flowEntry
    })

    // Add fluid entries that don't have matching flow entries
    fluidIntakeEntries.forEach((fluidEntry) => {
      const hasMatchingFlowEntry = flowEntries.some((flowEntry) => flowEntry.timestamp === fluidEntry.timestamp)

      if (!hasMatchingFlowEntry) {
        combinedEntries.push({
          timestamp: fluidEntry.timestamp,
          volume: 0,
          duration: 0,
          flowRate: 0,
          fluidIntake: {
            type: fluidEntry.type,
            customType: fluidEntry.customType,
            amount: fluidEntry.amount,
            unit: fluidEntry.unit,
            notes: fluidEntry.notes,
          },
        })
      }
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Time,Volume (mL),Duration (s),Flow Rate (mL/s),Color,Urgency,Concerns,Flow Notes,Fluid Type,Fluid Custom Type,Fluid Amount,Fluid Unit,Fluid Notes\n" +
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

          return `${dateStr},${timeStr},${e.volume},${e.duration},${e.flowRate},${e.color || ""},${
            e.urgency || ""
          },"${e.concerns ? e.concerns.join("; ") : ""}","${e.notes ? e.notes.replace(/"/g, '""') : ""}","${fluidType}","${fluidCustomType}","${fluidAmount}","${fluidUnit}","${
            fluidNotes ? fluidNotes.replace(/"/g, '""') : ""
          }"`
        })
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "flow_tracker_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
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
          const isNewFormat = header.includes("date") && header.includes("time")

          const newFlowEntries: FlowEntry[] = []
          const newFluidIntakeEntries: FluidIntakeEntry[] = []

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            try {
              const fields = parseCSVLine(line)

              if (isNewFormat) {
                // Handle the new format with separate flow and fluid intake data
                // Parse date and time
                const dateStr = fields[0].replace(/"/g, "").trim()
                const timeStr = fields[1].replace(/"/g, "").trim()

                // Create timestamp - handle various date formats
                let timestamp
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

                // Parse flow entry fields
                const volume = Number.parseFloat(fields[2] || "0")
                const duration = Number.parseFloat(fields[3] || "0")
                const flowRate = Number.parseFloat(fields[4] || "0")
                const color = fields[5] || undefined
                const urgency = fields[6] || undefined
                const concerns = fields[7] ? fields[7].split(";").map((c) => c.trim()) : undefined
                const flowNotes = fields[8] || undefined

                // Create flow entry if we have valid data
                if (volume > 0 && duration > 0 && flowRate > 0) {
                  newFlowEntries.push({
                    timestamp,
                    volume,
                    duration,
                    flowRate,
                    color,
                    urgency,
                    concerns,
                    notes: flowNotes,
                  })
                }

                // Parse fluid intake fields
                const fluidType = fields[9] || ""
                const fluidCustomType = fields[10] || undefined
                const fluidAmount = Number.parseFloat(fields[11] || "0")
                const fluidUnit = (fields[12] as "oz" | "mL") || "mL"
                const fluidNotes = fields[13] || undefined

                // Create fluid intake entry if we have valid data
                if (fluidType && fluidAmount > 0) {
                  newFluidIntakeEntries.push({
                    timestamp,
                    type: fluidType as any,
                    customType: fluidCustomType,
                    amount: fluidAmount,
                    unit: fluidUnit,
                    notes: fluidNotes,
                  })
                }
              } else {
                // Handle the old format (combined entries)
                const timestamp = fields[0]
                const volume = Number.parseFloat(fields[1] || "0")
                const duration = Number.parseFloat(fields[2] || "0")
                const flowRate = Number.parseFloat(fields[3] || "0")

                // Create flow entry
                if (volume > 0 && duration > 0 && flowRate > 0) {
                  newFlowEntries.push({
                    timestamp,
                    volume,
                    duration,
                    flowRate,
                  })
                }

                // Check if there's fluid intake data
                if (fields.length > 4 && fields[4]) {
                  const fluidType = fields[4]
                  const fluidAmount = Number.parseFloat(fields[5] || "0")
                  const fluidUnit = (fields[6] as "oz" | "mL") || "mL"

                  if (fluidType && fluidAmount > 0) {
                    newFluidIntakeEntries.push({
                      timestamp,
                      type: fluidType as any,
                      amount: fluidAmount,
                      unit: fluidUnit,
                    })
                  }
                }
              }
            } catch (error) {
              console.error("Error parsing CSV line:", line, error)
              // Continue with next line
            }
          }

          // Add new entries to state and database
          if (newFlowEntries.length > 0) {
            setFlowEntries([...flowEntries, ...newFlowEntries])
            try {
              bulkAddFlowEntries(newFlowEntries)
            } catch (error) {
              console.error("Error adding flow entries to database:", error)
            }
          }

          if (newFluidIntakeEntries.length > 0) {
            setFluidIntakeEntries([...fluidIntakeEntries, ...newFluidIntakeEntries])
            try {
              bulkAddFluidIntakeEntries(newFluidIntakeEntries)
            } catch (error) {
              console.error("Error adding fluid intake entries to database:", error)
            }
          }

          alert(
            `Imported ${newFlowEntries.length} flow entries and ${newFluidIntakeEntries.length} fluid intake entries.`,
          )
        } catch (error) {
          console.error("Error processing CSV file:", error)
          alert("Error processing CSV file. Please check the format.")
        }
      }
      reader.readAsText(file)
      // Reset the input
      event.target.value = ""
    }
  }

  const toggleMonthExpand = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }))
  }

  // Group entries by month and year
  const groupEntriesByMonth = (): MonthlyGroup[] => {
    const groups: Record<
      string,
      {
        flowEntries: FlowEntry[]
        fluidIntakeEntries: FluidIntakeEntry[]
      }
    > = {}

    // Process flow entries
    flowEntries.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!groups[monthYear]) {
        groups[monthYear] = {
          flowEntries: [],
          fluidIntakeEntries: [],
        }
      }

      groups[monthYear].flowEntries.push(entry)
    })

    // Process fluid intake entries
    fluidIntakeEntries.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!groups[monthYear]) {
        groups[monthYear] = {
          flowEntries: [],
          fluidIntakeEntries: [],
        }
      }

      groups[monthYear].fluidIntakeEntries.push(entry)
    })

    // Calculate averages for each month
    return Object.entries(groups)
      .map(([key, { flowEntries, fluidIntakeEntries }]) => {
        const date = new Date(flowEntries.length > 0 ? flowEntries[0].timestamp : fluidIntakeEntries[0].timestamp)
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
          flowEntries.length > 0 ? flowEntries.reduce((sum, entry) => sum + entry.flowRate, 0) / flowEntries.length : 0

        const averageVolume =
          flowEntries.length > 0 ? flowEntries.reduce((sum, entry) => sum + entry.volume, 0) / flowEntries.length : 0

        const averageDuration =
          flowEntries.length > 0 ? flowEntries.reduce((sum, entry) => sum + entry.duration, 0) / flowEntries.length : 0

        // Calculate fluid intake average
        const fluidIntakeAmounts = fluidIntakeEntries.map((entry) =>
          entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount,
        )

        const averageFluidIntake =
          fluidIntakeAmounts.length > 0
            ? fluidIntakeAmounts.reduce((sum, amount) => sum + amount, 0) / fluidIntakeAmounts.length
            : 0

        return {
          key,
          label,
          flowEntries,
          fluidIntakeEntries,
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

  // Generate the data to be shared
  const generateShareData = (monthKey?: string): { title: string; text: string } => {
    // Determine which entries to share
    let entriesToShare: FlowEntry[] = []
    let fluidEntriesToShare: FluidIntakeEntry[] = []
    let title = "Flow Tracker Data"
    let monthsToInclude: MonthlyGroup[] = []

    if (monthKey) {
      // Share specific month
      const monthGroup = monthlyGroups.find((group) => group.key === monthKey)
      if (monthGroup) {
        entriesToShare = monthGroup.flowEntries
        fluidEntriesToShare = monthGroup.fluidIntakeEntries
        title = `Flow Tracker Data - ${monthGroup.label}`
        monthsToInclude = [monthGroup]
      }
    } else {
      // Share all data - no limits
      entriesToShare = flowEntries
      fluidEntriesToShare = fluidIntakeEntries
      monthsToInclude = monthlyGroups
      title = `Flow Tracker Complete Data Summary`
    }

    // Create a summary text
    let summary = ""
    summary += "=".repeat(title.length) + "\n\n"

    // Overall summary
    if (entriesToShare.length > 0) {
      summary += `Total Flow Entries: ${entriesToShare.length}\n`
      const avgFlowRate = calculateAverage(entriesToShare.map((entry) => entry.flowRate))
      const avgVolume = calculateAverage(entriesToShare.map((entry) => entry.volume))
      const avgDuration = calculateAverage(entriesToShare.map((entry) => entry.duration))

      summary += `Overall Average Flow Rate: ${avgFlowRate.toFixed(1)} mL/s\n`
      summary += `Overall Average Volume: ${avgVolume.toFixed(0)} mL\n`
      summary += `Overall Average Duration: ${avgDuration.toFixed(1)} sec\n\n`
    }

    if (fluidEntriesToShare.length > 0) {
      summary += `Total Fluid Intake Entries: ${fluidEntriesToShare.length}\n`

      // Calculate average fluid intake
      const fluidIntakeAmounts = fluidEntriesToShare.map((entry) =>
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
        if (month.flowEntries.length > 0) {
          summary += `  Flow Entries: ${month.flowEntries.length}\n`
          summary += `  Avg Flow Rate: ${month.averageFlowRate.toFixed(1)} mL/s\n`
          summary += `  Avg Volume: ${month.averageVolume.toFixed(0)} mL\n`
          summary += `  Avg Duration: ${month.averageDuration.toFixed(1)} sec\n`
        }

        if (month.fluidIntakeEntries.length > 0) {
          summary += `  Fluid Entries: ${month.fluidIntakeEntries.length}\n`
          summary += `  Avg Fluid Intake: ${month.averageFluidIntake.toFixed(0)} mL\n`
        }
        summary += "\n"
      })
    }

    // Add detailed logs - include ALL entries regardless of count
    if (entriesToShare.length > 0) {
      summary += "DETAILED FLOW LOGS\n"
      summary += "----------------\n\n"

      // Sort entries by date (newest first)
      const sortedEntries = [...entriesToShare].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      sortedEntries.forEach((entry, index) => {
        const date = new Date(entry.timestamp)
        summary += `${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`
        summary += `   Volume: ${entry.volume} mL, Duration: ${entry.duration.toFixed(1)}s, Flow Rate: ${entry.flowRate.toFixed(1)} mL/s\n`

        if (entry.color) {
          summary += `   Color: ${entry.color}\n`
        }

        if (entry.urgency) {
          summary += `   Urgency: ${entry.urgency}\n`
        }

        if (entry.concerns && entry.concerns.length > 0) {
          summary += `   Concerns: ${entry.concerns.join(", ")}\n`
        }

        if (entry.notes) {
          summary += `   Notes: ${entry.notes}\n`
        }

        summary += "\n"
      })
    }

    // Add fluid intake logs - include ALL entries regardless of count
    if (fluidEntriesToShare.length > 0) {
      summary += "FLUID INTAKE LOGS\n"
      summary += "----------------\n\n"

      // Sort entries by date (newest first)
      const sortedFluidEntries = [...fluidEntriesToShare].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      sortedFluidEntries.forEach((entry, index) => {
        const date = new Date(entry.timestamp)
        const fluidType = entry.type === "Other" && entry.customType ? entry.customType : entry.type
        summary += `${index + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`
        summary += `   Type: ${fluidType}, Amount: ${entry.amount} ${entry.unit}\n`

        if (entry.notes) {
          summary += `   Notes: ${entry.notes}\n`
        }

        summary += "\n"
      })
    }

    // Add footer with count verification
    summary += "\nSUMMARY VERIFICATION\n"
    summary += "-------------------\n"
    summary += `Total Flow Entries: ${entriesToShare.length}\n`
    summary += `Total Fluid Intake Entries: ${fluidEntriesToShare.length}\n`
    summary += `Total Combined Entries: ${entriesToShare.length + fluidEntriesToShare.length}\n\n`

    summary += "Generated by Flow Tracker App\n"
    summary += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`

    return { title, text: summary }
  }

  // Share data functionality - completely revised
  const shareData = (monthKey?: string) => {
    const { title, text } = generateShareData(monthKey)

    // Use our improved sharing function that bypasses Web Share API in problematic environments
    shareContent({
      title,
      text,
    })
  }

  // Run a test to verify sharing works across platforms
  const runShareTest = () => {
    // Generate test data
    const testData = generateShareData()

    // Check if Web Share API is available
    const shareApiAvailable = isShareAvailable()

    // Verify data integrity
    const totalEntries = flowEntries.length + fluidIntakeEntries.length
    const dataIncludesAllEntries = testData.text.includes(`Total Combined Entries: ${totalEntries}`)

    // Determine platform
    const platform = detectPlatform()

    // Create test results
    let results = `Share Functionality Test Results:\n\n`
    results += `Platform: ${platform}\n`
    results += `Web Share API Available: ${shareApiAvailable ? "Yes" : "No"}\n`
    results += `Data Includes All Entries: ${dataIncludesAllEntries ? "Yes" : "No"}\n`
    results += `Total Entries: ${totalEntries}\n`
    results += `Flow Entries: ${flowEntries.length}\n`
    results += `Fluid Intake Entries: ${fluidIntakeEntries.length}\n\n`

    if (shareApiAvailable) {
      results += `Share Method: Native Web Share API\n`
      results += `Fallback: Clipboard copy if sharing fails\n`
    } else {
      results += `Share Method: Clipboard copy\n`
      results += `Reason: Web Share API not available on this platform/environment\n`
    }

    // Set test results to display
    setShareTestResults(results)
  }

  // Helper function to detect platform
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return "iOS"
    }

    // Android detection
    if (/android/i.test(userAgent)) {
      return "Android"
    }

    // Windows detection
    if (/Win/.test(navigator.platform)) {
      return "Windows"
    }

    // macOS detection
    if (/Mac/.test(navigator.platform)) {
      return "macOS"
    }

    // Linux detection
    if (/Linux/.test(navigator.platform)) {
      return "Linux"
    }

    return "Unknown"
  }

  // Helper function for calculating averages
  const calculateAverage = (values: number[]) => {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  const monthlyGroups = groupEntriesByMonth()

  // Add these helper functions for styling color and urgency values
  const getColorClass = (color?: string): string => {
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

  const getUrgencyClass = (urgency?: string): string => {
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

  return (
    <>
      <div className="mb-4">
        {flowEntries.length === 0 && fluidIntakeEntries.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No entries yet. Add your first flow entry or generate mock data.
            </p>
            <button
              onClick={generateMockData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto shadow-sm font-medium"
            >
              <Database className="mr-2" size={18} /> Generate Mock Data
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            {hasMockData && (
              <button
                onClick={deleteMockData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center shadow-sm font-medium"
              >
                <Trash className="mr-2" size={18} /> Delete All Mock Data
              </button>
            )}
            <button
              onClick={() => shareData()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center shadow-sm font-medium"
            >
              <Share2 size={18} className="mr-2" /> Share All Data
            </button>
            <button
              onClick={runShareTest}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-sm font-medium"
            >
              Test Share
            </button>
            <button
              onClick={generateMockData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Database className="mr-2" size={18} /> Generate Mock Data
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

      <h3 className="text-xl font-bold mb-4">Entry Logs</h3>

      {monthlyGroups.length === 0 ? (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400 border rounded-lg">
          No entries yet. Add your first flow entry above.
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
                  {group.label} ({group.flowEntries.length + group.fluidIntakeEntries.length} entries)
                </div>
                <div className="flex items-center">
                  {group.flowEntries.length > 0 && (
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
                    {group.flowEntries.length > 0 && (
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
                    {group.fluidIntakeEntries.length > 0 && (
                      <div className="flex items-center">
                        <Coffee className="mr-2 text-cyan-500" size={18} />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Fluid Intake</div>
                          <div className="font-medium">{group.averageFluidIntake.toFixed(0)} mL</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flow Entries */}
                  {group.flowEntries.length > 0 && (
                    <div className="mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b">
                        <h4 className="font-medium">Flow Entries ({group.flowEntries.length})</h4>
                      </div>
                      <div className="divide-y">
                        {group.flowEntries
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
                                      deleteFlowEntry(entry.timestamp)
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
                                  <span className={getColorClass(entry.color)}>{entry.color || "Not recorded"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">Urgency:</span>{" "}
                                  <span className={getUrgencyClass(entry.urgency)}>
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

                  {/* Fluid Intake Entries */}
                  {group.fluidIntakeEntries.length > 0 && (
                    <div>
                      <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border-b">
                        <h4 className="font-medium">Fluid Intake Entries ({group.fluidIntakeEntries.length})</h4>
                      </div>
                      <div className="divide-y">
                        {group.fluidIntakeEntries
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
                                      deleteFluidIntakeEntry(entry.timestamp)
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

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Backup & Restore</h3>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <p>
            <strong>Backup:</strong> Creates a file with all your data that you can save to your device.
          </p>
          <p className="mt-1">
            <strong>Restore:</strong> Loads data from a previously created backup file.
          </p>
        </div>

        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4">
            <button
              onClick={exportData}
              className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center"
            >
              <Download className="mr-2" /> Export Data
            </button>
          </div>
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="w-full p-3 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center cursor-pointer">
              <Upload className="mr-2" /> Import Data
              <input type="file" accept=".csv,.json" onChange={importData} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default DataManagement
