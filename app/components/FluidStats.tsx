"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  BarChartIcon,
  Calendar,
  Clock,
  Droplet,
  AlertTriangle,
  Coffee,
  TrendingUp,
  TrendingDown,
  LineChart,
  Grid,
  ScatterChart,
  Filter,
  Share2,
} from "lucide-react"
import type { FlowEntry, FluidIntakeEntry } from "../types"
import { isShareAvailable, fallbackShare } from "../services/share"

interface FluidStatsProps {
  title2?: React.ReactNode
}

// Update the component definition to use the title2 prop
const FluidStats: React.FC<FluidStatsProps> = ({ title2 }) => {
  // Add these state variables at the top of the component
  const [flowEntries, setFlowEntries] = useState<FlowEntry[]>([])
  const [fluidIntakeEntries, setFluidIntakeEntries] = useState<FluidIntakeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"table" | "line" | "heatmap" | "scatter">("table")
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)
  const scatterRef = useRef<HTMLCanvasElement>(null)

  // Add filter state
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("all")
  const [dataTypeFilter, setDataTypeFilter] = useState<"flow" | "intake" | "both">("both")
  const [metricFilter, setMetricFilter] = useState<"volume" | "rate" | "color" | "urgency" | "concerns" | "beverage">(
    "rate",
  )
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Filter data based on selected time period
  const filterDataByTime = (entries: (FlowEntry | FluidIntakeEntry)[]) => {
    const now = new Date()
    let cutoffDate: Date

    switch (timeFilter) {
      case "week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return entries
    }

    return entries.filter((entry) => new Date(entry.timestamp) >= cutoffDate)
  }

  // Get filtered data
  const filteredFlowEntries = dataTypeFilter === "intake" ? [] : filterDataByTime(flowEntries)
  const filteredFluidIntakeEntries = dataTypeFilter === "flow" ? [] : filterDataByTime(fluidIntakeEntries)

  // Determine appropriate time filter based on data span
  useEffect(() => {
    // Combine all entries to find the oldest
    const allEntries = [...flowEntries, ...fluidIntakeEntries]
    if (allEntries.length === 0) return

    // Sort by timestamp
    allEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const oldestDate = new Date(allEntries[0].timestamp)
    const now = new Date()
    const daysDiff = (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)

    // Set default time filter based on data span
    if (daysDiff <= 7) {
      setTimeFilter("week")
    } else if (daysDiff <= 30) {
      setTimeFilter("month")
    } else if (daysDiff <= 365) {
      setTimeFilter("year")
    } else {
      setTimeFilter("all")
    }
  }, [flowEntries, fluidIntakeEntries])

  // Update metric filter when data type changes
  useEffect(() => {
    if (
      dataTypeFilter === "intake" &&
      (metricFilter === "rate" || metricFilter === "color" || metricFilter === "urgency" || metricFilter === "concerns")
    ) {
      setMetricFilter("volume")
    } else if (dataTypeFilter === "flow" && metricFilter === "beverage") {
      setMetricFilter("rate")
    }
  }, [dataTypeFilter, metricFilter])

  const calculateAverage = (values: number[]) => {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  const averageFlowRate = calculateAverage(filteredFlowEntries.map((entry) => entry.flowRate))
  const averageVolume = calculateAverage(filteredFlowEntries.map((entry) => entry.volume))
  const averageDuration = calculateAverage(filteredFlowEntries.map((entry) => entry.duration))

  // Get recent entries (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentFlowEntries = filteredFlowEntries.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
  const recentAverageFlowRate = calculateAverage(recentFlowEntries.map((entry) => entry.flowRate))

  // Get color distribution
  const entriesWithColor = filteredFlowEntries.filter((entry) => entry.color)
  const colorCounts: Record<string, number> = {}
  entriesWithColor.forEach((entry) => {
    if (entry.color) {
      colorCounts[entry.color] = (colorCounts[entry.color] || 0) + 1
    }
  })

  // Get most common color
  let mostCommonColor = ""
  let maxColorCount = 0
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count > maxColorCount) {
      mostCommonColor = color
      maxColorCount = count
    }
  })

  // Get urgency distribution
  const entriesWithUrgency = filteredFlowEntries.filter((entry) => entry.urgency)
  const urgencyCounts: Record<string, number> = {}
  entriesWithUrgency.forEach((entry) => {
    if (entry.urgency) {
      urgencyCounts[entry.urgency] = (urgencyCounts[entry.urgency] || 0) + 1
    }
  })

  // Get most common urgency
  let mostCommonUrgency = ""
  let maxUrgencyCount = 0
  Object.entries(urgencyCounts).forEach(([urgency, count]) => {
    if (count > maxUrgencyCount) {
      mostCommonUrgency = urgency
      maxUrgencyCount = count
    }
  })

  // Get concern distribution
  const concernCounts: Record<string, number> = {}
  filteredFlowEntries.forEach((entry) => {
    if (entry.concerns && entry.concerns.length > 0) {
      entry.concerns.forEach((concern) => {
        concernCounts[concern] = (concernCounts[concern] || 0) + 1
      })
    }
  })

  // Get most common concern
  let mostCommonConcern = ""
  let maxConcernCount = 0
  Object.entries(concernCounts).forEach(([concern, count]) => {
    if (count > maxConcernCount) {
      mostCommonConcern = concern
      maxConcernCount = count
    }
  })

  // Fluid intake statistics
  // Calculate average fluid intake
  const fluidIntakeAmounts = filteredFluidIntakeEntries.map((entry) => {
    // Convert all to mL for consistency
    return entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
  })

  const averageFluidIntake = calculateAverage(fluidIntakeAmounts)

  // Get fluid type distribution
  const fluidTypeCounts: Record<string, number> = {}
  filteredFluidIntakeEntries.forEach((entry) => {
    if (entry.type) {
      const type = entry.type === "Other" && entry.customType ? entry.customType : entry.type
      fluidTypeCounts[type] = (fluidTypeCounts[type] || 0) + 1
    }
  })

  // Get most common fluid type
  let mostCommonFluidType = ""
  let maxFluidTypeCount = 0
  Object.entries(fluidTypeCounts).forEach(([type, count]) => {
    if (count > maxFluidTypeCount) {
      mostCommonFluidType = type
      maxFluidTypeCount = count
    }
  })

  // Check if fluid intake is trending up or down
  let fluidIntakeTrend: "up" | "down" | "stable" = "stable"
  if (filteredFluidIntakeEntries.length >= 4) {
    const sortedEntries = [...filteredFluidIntakeEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const halfLength = Math.floor(sortedEntries.length / 2)
    const firstHalf = sortedEntries.slice(0, halfLength)
    const secondHalf = sortedEntries.slice(halfLength)

    const firstHalfAvg = calculateAverage(
      firstHalf.map((entry) => {
        return entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
      }),
    )

    const secondHalfAvg = calculateAverage(
      secondHalf.map((entry) => {
        return entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
      }),
    )

    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (percentChange > 5) {
      fluidIntakeTrend = "up"
    } else if (percentChange < -5) {
      fluidIntakeTrend = "down"
    }
  }

  // Add this useEffect to fetch data from IndexedDB
  useEffect(() => {
    const fetchEntries = async () => {
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

        setFlowEntries(uroLogs)
        setFluidIntakeEntries(hydroLogs)
      } catch (error) {
        console.error("Error fetching entries from database:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [])

  // Draw line chart
  useEffect(() => {
    if (activeTab === "line" && lineChartRef.current) {
      const canvas = lineChartRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Sort entries by date
      const sortedFlowEntries = [...filteredFlowEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

      const sortedFluidEntries = [...filteredFluidIntakeEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

      // Check if we have data to display
      if ((dataTypeFilter === "flow" || dataTypeFilter === "both") && sortedFlowEntries.length === 0) {
        ctx.fillStyle = "#666"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("No flow data available for the selected time period", canvas.width / 2, canvas.height / 2 - 20)
        if (dataTypeFilter === "both" && sortedFluidEntries.length === 0) {
          ctx.fillText(
            "No intake data available for the selected time period",
            canvas.width / 2,
            canvas.height / 2 + 20,
          )
        }
        return
      }

      if ((dataTypeFilter === "intake" || dataTypeFilter === "both") && sortedFluidEntries.length === 0) {
        ctx.fillStyle = "#666"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("No intake data available for the selected time period", canvas.width / 2, canvas.height / 2)
        return
      }

      // Prepare data based on metric filter
      let flowData: number[] = []
      let flowLabel = ""

      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        switch (metricFilter) {
          case "volume":
            flowData = sortedFlowEntries.map((entry) => entry.volume)
            flowLabel = "Volume (mL)"
            break
          case "rate":
          default:
            flowData = sortedFlowEntries.map((entry) => entry.flowRate)
            flowLabel = "Flow Rate (mL/s)"
            break
        }
      }

      let intakeData: number[] = []
      let intakeLabel = ""

      if (dataTypeFilter === "intake" || dataTypeFilter === "both") {
        intakeData = sortedFluidEntries.map((entry) => {
          return entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
        })
        intakeLabel = "Fluid Intake (mL)"
      }

      const flowDates = sortedFlowEntries.map((entry) => new Date(entry.timestamp).toLocaleDateString())
      const fluidDates = sortedFluidEntries.map((entry) => new Date(entry.timestamp).toLocaleDateString())

      // Set chart dimensions
      const padding = 40
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2

      // Find max values for scaling
      const maxFlowValue = flowData.length > 0 ? Math.max(...flowData, 1) * 1.1 : 1
      const maxIntakeValue = intakeData.length > 0 ? Math.max(...intakeData, 1) * 1.1 : 1000

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Get time period indicators
      const allDatesSet = [...new Set([...flowDates, ...fluidDates])].map((d) => new Date(d))
      allDatesSet.sort((a, b) => a.getTime() - b.getTime())

      if (allDatesSet.length > 0) {
        const firstDate = allDatesSet[0]
        const lastDate = allDatesSet[allDatesSet.length - 1]

        // Calculate week, month, and year markers
        const weekDate = new Date(lastDate)
        weekDate.setDate(weekDate.getDate() - 7)

        const monthDate = new Date(lastDate)
        monthDate.setMonth(monthDate.getMonth() - 1)

        const yearDate = new Date(lastDate)
        yearDate.setFullYear(yearDate.getFullYear() - 1)

        // Only show markers that fall within the data range
        const markers = []

        if (weekDate >= firstDate) {
          const weekPosition = (weekDate.getTime() - firstDate.getTime()) / (lastDate.getTime() - firstDate.getTime())
          markers.push({
            position: padding + weekPosition * width,
            label: "Week",
            color: "rgba(52, 152, 219, 0.5)",
            highlight: timeFilter === "week",
          })
        }

        if (monthDate >= firstDate) {
          const monthPosition = (monthDate.getTime() - firstDate.getTime()) / (lastDate.getTime() - firstDate.getTime())
          markers.push({
            position: padding + monthPosition * width,
            label: "Month",
            color: "rgba(155, 89, 182, 0.5)",
            highlight: timeFilter === "month",
          })
        }

        if (yearDate >= firstDate) {
          const yearPosition = (yearDate.getTime() - firstDate.getTime()) / (lastDate.getTime() - firstDate.getTime())
          markers.push({
            position: padding + yearPosition * width,
            label: "Year",
            color: "rgba(231, 76, 60, 0.5)",
            highlight: timeFilter === "year",
          })
        }

        // Draw time period markers
        markers.forEach((marker) => {
          ctx.beginPath()
          ctx.strokeStyle = marker.color
          ctx.lineWidth = marker.highlight ? 3 : 2
          ctx.setLineDash([5, 3])
          ctx.moveTo(marker.position, padding)
          ctx.lineTo(marker.position, canvas.height - padding)
          ctx.stroke()
          ctx.setLineDash([])

          // Draw label
          ctx.fillStyle = marker.color
          ctx.font = marker.highlight ? "bold 12px Arial" : "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(marker.label, marker.position, padding - 10)
        })
      }

      // Draw flow data line if data exists and should be shown
      if ((dataTypeFilter === "flow" || dataTypeFilter === "both") && flowData.length > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        flowData.forEach((value, i) => {
          const x = padding + (i / (flowData.length - 1 || 1)) * width
          const y = canvas.height - padding - (value / maxFlowValue) * height
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw flow data points
        flowData.forEach((value, i) => {
          const x = padding + (i / (flowData.length - 1 || 1)) * width
          const y = canvas.height - padding - (value / maxFlowValue) * height
          ctx.beginPath()
          ctx.fillStyle = "#3b82f6"
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Draw fluid intake line if data exists and should be shown
      if ((dataTypeFilter === "intake" || dataTypeFilter === "both") && intakeData.length > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 2

        let firstPoint = true
        intakeData.forEach((value, i) => {
          if (value > 0) {
            const x = padding + (i / (intakeData.length - 1 || 1)) * width
            const y = canvas.height - padding - (value / maxIntakeValue) * height

            if (firstPoint) {
              ctx.moveTo(x, y)
              firstPoint = false
            } else {
              ctx.lineTo(x, y)
            }
          }
        })
        ctx.stroke()

        // Draw fluid intake points
        intakeData.forEach((value, i) => {
          if (value > 0) {
            const x = padding + (i / (intakeData.length - 1 || 1)) * width
            const y = canvas.height - padding - (value / maxIntakeValue) * height
            ctx.beginPath()
            ctx.fillStyle = "#10b981"
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // X-axis labels (dates)
      // Combine and deduplicate dates
      const allDates = [...new Set([...flowDates, ...fluidDates])]
      allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

      if (allDates.length > 10) {
        // If too many dates, show fewer labels
        const step = Math.ceil(allDates.length / 10)
        for (let i = 0; i < allDates.length; i += step) {
          const x = padding + (i / (allDates.length - 1 || 1)) * width
          ctx.fillText(allDates[i], x, canvas.height - padding + 15)
        }
      } else {
        allDates.forEach((date, i) => {
          const x = padding + (i / (allDates.length - 1 || 1)) * width
          ctx.fillText(date, x, canvas.height - padding + 15)
        })
      }

      // Y-axis labels (flow value)
      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        ctx.textAlign = "right"
        for (let i = 0; i <= 5; i++) {
          const value = (maxFlowValue * i) / 5
          const y = canvas.height - padding - (value / maxFlowValue) * height
          ctx.fillStyle = "#3b82f6"
          ctx.fillText(value.toFixed(1) + (metricFilter === "rate" ? " mL/s" : " mL"), padding - 5, y + 4)
        }
      }

      // Y-axis labels (fluid intake)
      if (dataTypeFilter === "intake" || dataTypeFilter === "both") {
        ctx.textAlign = "left"
        for (let i = 0; i <= 5; i++) {
          const value = (maxIntakeValue * i) / 5
          const y = canvas.height - padding - (value / maxIntakeValue) * height
          ctx.fillStyle = "#10b981"
          ctx.fillText(value.toFixed(0) + " mL", canvas.width - padding + 5, y + 4)
        }
      }

      // Legend
      ctx.textAlign = "left"
      let legendX = padding

      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        ctx.fillStyle = "#3b82f6"
        ctx.fillRect(legendX, 15, 15, 15)
        ctx.fillStyle = "#000"
        ctx.fillText(flowLabel, legendX + 20, 25)
        legendX += 120
      }

      if (dataTypeFilter === "intake" || dataTypeFilter === "both") {
        ctx.fillStyle = "#10b981"
        ctx.fillRect(legendX, 15, 15, 15)
        ctx.fillStyle = "#000"
        ctx.fillText(intakeLabel, legendX + 20, 25)
      }

      // Time period indicator
      ctx.textAlign = "right"
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        canvas.width - padding,
        25,
      )
    }
  }, [activeTab, filteredFlowEntries, filteredFluidIntakeEntries, timeFilter, dataTypeFilter, metricFilter])

  // Draw heatmap
  useEffect(() => {
    if (activeTab === "heatmap" && heatmapRef.current && filteredFlowEntries.length > 0) {
      const canvas = heatmapRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Group entries by day and hour
      const heatmapData: Record<string, Record<number, number[]>> = {}

      filteredFlowEntries.forEach((entry) => {
        const date = new Date(entry.timestamp)
        const day = date.getDay() // 0-6 (Sunday-Saturday)
        const hour = date.getHours() // 0-23

        if (!heatmapData[day]) {
          heatmapData[day] = {}
        }

        if (!heatmapData[day][hour]) {
          heatmapData[day][hour] = []
        }

        // Add data based on metric filter
        switch (metricFilter) {
          case "volume":
            heatmapData[day][hour].push(entry.volume)
            break
          case "rate":
          default:
            heatmapData[day][hour].push(entry.flowRate)
            break
        }
      })

      // Set chart dimensions
      const padding = 40
      const cellWidth = (canvas.width - padding * 2) / 24 // 24 hours
      const cellHeight = (canvas.height - padding * 2) / 7 // 7 days

      // Draw grid
      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1

      // Vertical lines (hours)
      for (let i = 0; i <= 24; i++) {
        const x = padding + i * cellWidth
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvas.height - padding)
        ctx.stroke()
      }

      // Horizontal lines (days)
      for (let i = 0; i <= 7; i++) {
        const y = padding + i * cellHeight
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }

      // Draw heatmap cells
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const values = heatmapData[day]?.[hour] || []
          if (values.length > 0) {
            const avgValue = calculateAverage(values)

            // Color based on value (blue to red gradient)
            const maxValue = metricFilter === "volume" ? 300 : 20 // Adjust based on metric
            const intensity = Math.min(1, avgValue / maxValue) // Normalize to 0-1 range
            const r = Math.floor(intensity * 255)
            const g = Math.floor((1 - intensity) * 100)
            const b = Math.floor((1 - intensity) * 255)

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

            const x = padding + hour * cellWidth
            const y = padding + day * cellHeight
            ctx.fillRect(x, y, cellWidth, cellHeight)

            // Add text for average value
            ctx.fillStyle = intensity > 0.5 ? "white" : "black"
            ctx.font = "10px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(avgValue.toFixed(1), x + cellWidth / 2, y + cellHeight / 2)
          }
        }
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // Hour labels
      for (let i = 0; i < 24; i += 3) {
        const x = padding + (i + 0.5) * cellWidth
        ctx.fillText(`${i}:00`, x, canvas.height - padding + 15)
      }

      // Day labels
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      for (let i = 0; i < 7; i++) {
        const y = padding + (i + 0.5) * cellHeight
        ctx.textAlign = "right"
        ctx.fillText(days[i], padding - 5, y)
      }

      // Title
      ctx.textAlign = "center"
      ctx.font = "14px Arial"
      const metricLabel = metricFilter === "volume" ? "Volume (mL)" : "Flow Rate (mL/s)"
      ctx.fillText(`${metricLabel} by Day and Hour`, canvas.width / 2, 20)

      // Time period indicator
      ctx.textAlign = "right"
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        canvas.width - padding,
        40,
      )
    }
  }, [activeTab, filteredFlowEntries, timeFilter, metricFilter])

  // Draw scatter plot
  useEffect(() => {
    if (
      activeTab === "scatter" &&
      scatterRef.current &&
      filteredFlowEntries.length > 0 &&
      filteredFluidIntakeEntries.length > 0
    ) {
      const canvas = scatterRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Match flow entries with fluid intake entries by timestamp
      const matchedData = []

      for (const flowEntry of filteredFlowEntries) {
        // Find fluid intake entries from the same day
        const flowDate = new Date(flowEntry.timestamp)
        flowDate.setHours(0, 0, 0, 0)

        const matchingFluidEntries = filteredFluidIntakeEntries.filter((fluidEntry) => {
          const fluidDate = new Date(fluidEntry.timestamp)
          fluidDate.setHours(0, 0, 0, 0)
          return fluidDate.getTime() === flowDate.getTime()
        })

        if (matchingFluidEntries.length > 0) {
          // Calculate total fluid intake for the day
          let totalFluidIntake = 0
          matchingFluidEntries.forEach((entry) => {
            totalFluidIntake += entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
          })

          // Add data based on metric filter
          let flowValue = 0
          switch (metricFilter) {
            case "volume":
              flowValue = flowEntry.volume
              break
            case "rate":
            default:
              flowValue = flowEntry.flowRate
              break
          }

          matchedData.push({
            flowValue,
            fluidIntake: totalFluidIntake,
            timestamp: flowEntry.timestamp,
          })
        }
      }

      if (matchedData.length === 0) {
        ctx.fillStyle = "#666"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Not enough data for scatter plot", canvas.width / 2, canvas.height / 2)
        return
      }

      // Set chart dimensions
      const padding = 50
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2

      // Find max values for scaling
      const maxFlowValue = Math.max(...matchedData.map((d) => d.flowValue)) * 1.1
      const maxFluidIntake = Math.max(...matchedData.map((d) => d.fluidIntake)) * 1.1

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Draw scatter points
      matchedData.forEach((point) => {
        const x = padding + (point.fluidIntake / maxFluidIntake) * width
        const y = canvas.height - padding - (point.flowValue / maxFlowValue) * height

        // Calculate point color based on recency
        const date = new Date(point.timestamp)
        const now = new Date()
        const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        const opacity = Math.max(0.3, 1 - daysDiff / 30) // Fade over 30 days

        ctx.beginPath()
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw trend line if enough points
      if (matchedData.length >= 3) {
        // Simple linear regression
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumX2 = 0
        const n = matchedData.length

        matchedData.forEach((point) => {
          sumX += point.fluidIntake
          sumY += point.flowValue
          sumXY += point.fluidIntake * point.flowValue
          sumX2 += point.fluidIntake * point.fluidValue
        })

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        // Draw trend line
        ctx.beginPath()
        ctx.strokeStyle = "rgba(239, 68, 68, 0.7)"
        ctx.lineWidth = 2

        const x1 = padding
        const y1 = canvas.height - padding - (intercept / maxFlowValue) * height
        const x2 = canvas.width - padding
        const y2 = canvas.height - padding - ((slope * maxFluidIntake + intercept) / maxFlowValue) * height

        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw labels
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"

      // X-axis labels (fluid intake)
      ctx.textAlign = "center"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFluidIntake * i) / 5
        const x = padding + (value / maxFluidIntake) * width
        ctx.fillText(value.toFixed(0) + " mL", x, canvas.height - padding + 15)
      }

      // Y-axis labels (flow value)
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = (maxFlowValue * i) / 5
        const y = canvas.height - padding - (value / maxFlowValue) * height
        ctx.fillText(value.toFixed(1) + (metricFilter === "rate" ? " mL/s" : " mL"), padding - 5, y + 4)
      }

      // Axis titles
      ctx.textAlign = "center"
      ctx.font = "14px Arial"
      ctx.fillText("Fluid Intake (mL)", canvas.width / 2, canvas.height - 10)

      ctx.save()
      ctx.translate(15, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      const yAxisLabel = metricFilter === "volume" ? "Volume (mL)" : "Flow Rate (mL/s)"
      ctx.fillText(yAxisLabel, 0, 0)
      ctx.restore()

      // Chart title
      ctx.textAlign = "center"
      ctx.font = "16px Arial"
      const titleMetric = metricFilter === "volume" ? "Volume" : "Flow Rate"
      ctx.fillText(`${titleMetric} vs. Fluid Intake`, canvas.width / 2, 20)

      // Time period indicator
      ctx.textAlign = "right"
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        canvas.width - padding,
        40,
      )
    }
  }, [activeTab, filteredFlowEntries, filteredFluidIntakeEntries, timeFilter, metricFilter])

  // Share functionality
  const shareChart = async (chartType: string, chartRef: React.RefObject<HTMLCanvasElement>) => {
    try {
      const canvas = chartRef.current
      if (!canvas) {
        throw new Error("Chart not available")
      }

      // Create a title based on the chart type
      const title = `Flow Tracker - ${chartType} Chart`

      // Create a text summary of the chart data
      let summary = `${title}\n\n`

      // Add relevant stats based on chart type
      if (chartType === "Flow Rate") {
        summary += `Average Flow Rate: ${averageFlowRate.toFixed(1)} mL/s\n`
        summary += `Entries: ${flowEntries.length}\n`
      } else if (chartType === "Volume") {
        summary += `Average Volume: ${averageVolume.toFixed(0)} mL\n`
        summary += `Entries: ${flowEntries.length}\n`
      }

      // Check if Web Share API is likely to work
      if (isShareAvailable()) {
        try {
          await navigator.share({
            title,
            text: summary,
          })
        } catch (error) {
          console.error("Web Share API failed:", error)
          // Fall back to clipboard
          fallbackShare(title, summary)
        }
      } else {
        // Skip trying Web Share API and go straight to fallback
        fallbackShare(title, summary)
      }
    } catch (error) {
      console.error("Error sharing chart:", error)
      alert("Failed to share chart. Using clipboard instead.")

      // Always fall back to clipboard if anything goes wrong
      fallbackShare(
        "Flow Tracker Chart",
        "There was an error sharing the chart. A text summary has been copied to your clipboard instead.",
      )
    }
  }

  // Update the shareSummaryData function similarly
  const shareSummaryData = async () => {
    try {
      // Create text summary
      let summary = "Flow Tracker Summary\n-------------------\n\n"

      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        summary += `Time period: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}\n`
        summary += `Average Flow Rate: ${averageFlowRate.toFixed(2)} mL/s\n`
        summary += `Average Volume: ${averageVolume.toFixed(0)} mL\n`
        summary += `Average Duration: ${averageDuration.toFixed(1)} sec\n`
        summary += `Total Entries: ${filteredFlowEntries.length}\n\n`
      }

      if ((dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredFluidIntakeEntries.length > 0) {
        summary += "Fluid Intake Stats\n"
        summary += `Average Fluid Intake: ${averageFluidIntake.toFixed(0)} mL (${(averageFluidIntake / 29.5735).toFixed(1)} oz)\n`
        summary += `Fluid Intake Trend: ${fluidIntakeTrend === "up" ? "Increasing" : fluidIntakeTrend === "down" ? "Decreasing" : "Stable"}\n`
        if (mostCommonFluidType) {
          summary += `Most Common Beverage: ${mostCommonFluidType}\n`
        }
      }

      const title = "Flow Tracker Summary"

      // Check if Web Share API is likely to work
      if (isShareAvailable()) {
        try {
          await navigator.share({
            title,
            text: summary,
          })
        } catch (error) {
          console.error("Web Share API failed:", error)
          // Fall back to clipboard
          fallbackShare(title, summary)
        }
      } else {
        // Skip trying Web Share API and go straight to fallback
        fallbackShare(title, summary)
      }
    } catch (error) {
      console.error("Error sharing:", error)
      fallbackShare(
        "Flow Tracker Summary",
        "Failed to share summary data. This text has been copied to your clipboard instead.",
      )
    }
  }

  // Add this right after the return statement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 font-medium flex items-center ${
                activeTab === "table"
                  ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setActiveTab("table")}
              aria-selected={activeTab === "table"}
              role="tab"
              aria-controls="table-panel"
            >
              <BarChartIcon size={18} className="mr-2" />
              Summary
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === "line"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("line")}
            >
              <LineChart size={16} className="mr-2" />
              Line Chart
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === "heatmap"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("heatmap")}
            >
              <Grid size={16} className="mr-2" />
              Heat Map
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === "scatter"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("scatter")}
            >
              <ScatterChart size={16} className="mr-2" />
              Scatter Plot
            </button>
          </div>
          <div className="flex">
            {activeTab === "table" && (
              <button
                onClick={shareSummaryData}
                className="ml-2 flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Share summary data"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            )}

            {activeTab === "line" && (
              <button
                onClick={() => shareChart("line", lineChartRef)}
                className="ml-2 flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Share line chart"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            )}

            {activeTab === "heatmap" && (
              <button
                onClick={() => shareChart("heatmap", heatmapRef)}
                className="ml-2 flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Share heatmap"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            )}

            {activeTab === "scatter" && (
              <button
                onClick={() => shareChart("scatter", scatterRef)}
                className="ml-2 flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Share scatter plot"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            )}
          </div>
          <button
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Filter panel */}
        {showFilterPanel && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time period filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Time Period</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      timeFilter === "week"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setTimeFilter("week")}
                  >
                    Week
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      timeFilter === "month"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setTimeFilter("month")}
                  >
                    Month
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      timeFilter === "year"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setTimeFilter("year")}
                  >
                    Year
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      timeFilter === "all"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setTimeFilter("all")}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* Data type filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Data Type</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      dataTypeFilter === "flow"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setDataTypeFilter("flow")}
                  >
                    Flow
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      dataTypeFilter === "intake"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setDataTypeFilter("intake")}
                  >
                    Intake
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      dataTypeFilter === "both"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setDataTypeFilter("both")}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Metric filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Metric</h4>
                <div className="flex flex-wrap gap-2">
                  {(dataTypeFilter === "flow" || dataTypeFilter === "both") && (
                    <>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${
                          metricFilter === "rate"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        }`}
                        onClick={() => setMetricFilter("rate")}
                      >
                        Flow Rate
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${
                          metricFilter === "volume"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        }`}
                        onClick={() => setMetricFilter("volume")}
                      >
                        Volume
                      </button>
                    </>
                  )}
                  {dataTypeFilter === "intake" && (
                    <button
                      className={`px-3 py-1 text-xs rounded-full ${
                        metricFilter === "beverage"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      }`}
                      onClick={() => setMetricFilter("beverage")}
                    >
                      Beverage Type
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time period indicator for all views */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end">
        <Calendar className="mr-1" size={14} />
        <span>
          Showing:{" "}
          {timeFilter === "all"
            ? "All Time"
            : timeFilter === "week"
              ? "Last Week"
              : timeFilter === "month"
                ? "Last Month"
                : "Last Year"}
        </span>
      </div>

      {activeTab === "table" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(dataTypeFilter === "flow" || dataTypeFilter === "both") && (
              <>
                <div className="stats-card flex items-center p-4">
                  <BarChartIcon className="mr-4 text-blue-600 dark:text-blue-400" size={28} />
                  <div>
                    <p className="stats-label text-gray-600 dark:text-gray-300">Average Flow Rate</p>
                    <p className="stats-value text-blue-600 dark:text-blue-400">{averageFlowRate.toFixed(2)} mL/s</p>
                    {recentFlowEntries.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Last 7 days: {recentAverageFlowRate.toFixed(2)} mL/s
                      </p>
                    )}
                  </div>
                </div>
                <div className="stats-card flex items-center p-4">
                  <Droplet className="mr-4 text-green-600 dark:text-green-400" size={28} />
                  <div>
                    <p className="stats-label text-gray-600 dark:text-gray-300">Average Volume</p>
                    <p className="stats-value text-green-600 dark:text-green-400">{averageVolume.toFixed(0)} mL</p>
                  </div>
                </div>
                <div className="stats-card flex items-center p-4">
                  <Clock className="mr-4 text-purple-600 dark:text-purple-400" size={28} />
                  <div>
                    <p className="stats-label text-gray-600 dark:text-gray-300">Average Duration</p>
                    <p className="stats-value text-purple-600 dark:text-purple-400">{averageDuration.toFixed(1)} sec</p>
                  </div>
                </div>
                <div className="stats-card flex items-center p-4">
                  <Calendar className="mr-4 text-amber-600 dark:text-amber-400" size={28} />
                  <div>
                    <p className="stats-label text-gray-600 dark:text-gray-300">Total Entries</p>
                    <p className="stats-value text-amber-600 dark:text-amber-400">{filteredFlowEntries.length}</p>
                    {recentFlowEntries.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Last 7 days: {recentFlowEntries.length}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {(dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredFluidIntakeEntries.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Fluid Intake Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Coffee className="mr-3 text-cyan-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Average Fluid Intake</p>
                    <p className="text-xl font-bold">{averageFluidIntake.toFixed(0)} mL</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      ({(averageFluidIntake / 29.5735).toFixed(1)} oz)
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  {fluidIntakeTrend === "up" ? (
                    <TrendingUp className="mr-3 text-green-500" size={24} />
                  ) : fluidIntakeTrend === "down" ? (
                    <TrendingDown className="mr-3 text-red-500" size={24} />
                  ) : (
                    <Coffee className="mr-3 text-indigo-500" size={24} />
                  )}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Fluid Intake Trend</p>
                    <p className="text-xl font-bold">
                      {fluidIntakeTrend === "up" ? "Increasing" : fluidIntakeTrend === "down" ? "Decreasing" : "Stable"}
                    </p>
                    {mostCommonFluidType && (
                      <p className="text-xs text-gray-600 dark:text-gray-300">Most common: {mostCommonFluidType}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(dataTypeFilter === "flow" || dataTypeFilter === "both") && (
            <div className="mt-6 space-y-4">
              {entriesWithColor.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Color Distribution</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Droplet className="mr-2" />
                      <span className="font-medium">Most common color: </span>
                      <span className="ml-2">{mostCommonColor}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(colorCounts).map(([color, count]) => (
                        <div
                          key={color}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{color}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {entriesWithUrgency.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Urgency Distribution</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Clock className="mr-2" />
                      <span className="font-medium">Most common urgency: </span>
                      <span className="ml-2">{mostCommonUrgency}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(urgencyCounts).map(([urgency, count]) => (
                        <div
                          key={urgency}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{urgency}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(concernCounts).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reported Concerns</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    {maxConcernCount > 0 && (
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="mr-2" />
                        <span className="font-medium">Most common concern: </span>
                        <span className="ml-2">{mostCommonConcern}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(concernCounts).map(([concern, count]) => (
                        <div
                          key={concern}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <span>{concern}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredFluidIntakeEntries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Fluid Type Distribution</h3>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                <div className="flex items-center mb-2">
                  <Coffee className="mr-2" />
                  <span className="font-medium">Most common beverage: </span>
                  <span className="ml-2">{mostCommonFluidType}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(fluidTypeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span>{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "line" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={lineChartRef} width={800} height={400} className="w-full h-auto" />
          {((dataTypeFilter === "flow" || dataTypeFilter === "both") && filteredFlowEntries.length === 0) ||
            ((dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredFluidIntakeEntries.length === 0 && (
              <div className="text-center p-4 text-gray-600 dark:text-gray-300">
                No data available for the selected filters. Try adjusting your filter settings.
              </div>
            ))}
        </div>
      )}

      {activeTab === "heatmap" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={heatmapRef} width={800} height={400} className="w-full h-auto" />
          {filteredFlowEntries.length === 0 && (
            <div className="text-center p-4 text-gray-600 dark:text-gray-300">
              No flow data available for the selected time period. Try adjusting your filter settings.
            </div>
          )}
        </div>
      )}

      {activeTab === "scatter" && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <canvas ref={scatterRef} width={800} height={400} className="w-full h-auto" />
          {(filteredFlowEntries.length === 0 || filteredFluidIntakeEntries.length === 0) && (
            <div className="text-center p-4 text-gray-600 dark:text-gray-300">
              Not enough data available for scatter plot. Add both flow and fluid intake entries or adjust your filter
              settings.
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default FluidStats
