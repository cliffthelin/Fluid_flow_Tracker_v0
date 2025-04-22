"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Clock, Droplet, AlertTriangle, Coffee, TrendingUp, TrendingDown, Filter, Share2 } from "lucide-react"
import type { UroLog, HydroLog } from "../types"
import { isShareAvailable } from "../services/share"

interface FluidStatsProps {
  title2?: React.ReactNode
}

// Change the component name from FluidStats to Stats
const Stats: React.FC<FluidStatsProps> = ({ title2 }) => {
  // Add these state variables at the top of the component
  const [flowEntries, setFlowEntries] = useState<UroLog[]>([])
  const [fluidIntakeEntries, setFluidIntakeEntries] = useState<HydroLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"table" | "line" | "heatmap" | "bar" | "pie">("table")
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)
  const scatterRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)

  // Add filter state
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("all")
  const [dataTypeFilter, setDataTypeFilter] = useState<"flow" | "intake" | "both">("both")
  const [metricFilter, setMetricFilter] = useState<
    "volume" | "rate" | "color" | "urgency" | "concerns" | "beverage" | "duration"
  >("rate")
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Add this to the beginning of the component, after the state declarations
  useEffect(() => {
    // Check if dark mode is active
    setDarkMode(document.documentElement.classList.contains("dark"))

    // Set up an observer to detect theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setDarkMode(document.documentElement.classList.contains("dark"))
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  // Filter data based on selected time period
  const filterDataByTime = (entries: (UroLog | HydroLog)[]) => {
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

  // Add these helper functions to filter data by time periods
  // Add these functions after the existing filter functions but before the useEffect hooks

  // Helper functions to get data for specific time periods
  const getTodayData = (entries: (UroLog | HydroLog)[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return entries.filter((entry) => new Date(entry.timestamp) >= today)
  }

  const getWeekData = (entries: (UroLog | HydroLog)[]) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entries.filter((entry) => new Date(entry.timestamp) >= weekAgo)
  }

  const getMonthData = (entries: (UroLog | HydroLog)[]) => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return entries.filter((entry) => new Date(entry.timestamp) >= monthAgo)
  }

  const getYearData = (entries: (UroLog | HydroLog)[]) => {
    const yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    return entries.filter((entry) => new Date(entry.timestamp) >= yearAgo)
  }

  // Functions to calculate flow rate statistics for different time periods
  const getTodayFlowRate = () => {
    const todayEntries = getTodayData(flowEntries)
    return calculateAverage(todayEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getWeekFlowRate = () => {
    const weekEntries = getWeekData(flowEntries)
    return calculateAverage(weekEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getMonthFlowRate = () => {
    const monthEntries = getMonthData(flowEntries)
    return calculateAverage(monthEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getYearFlowRate = () => {
    const yearEntries = getYearData(flowEntries)
    return calculateAverage(yearEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  // Functions to get entry counts for different time periods
  const getTodayFlowCount = () => getTodayData(flowEntries).length
  const getWeekFlowCount = () => getWeekData(flowEntries).length
  const getMonthFlowCount = () => getMonthData(flowEntries).length
  const getYearFlowCount = () => getYearData(flowEntries).length

  // Functions to calculate fluid intake statistics for different time periods
  const getTodayFluidIntake = () => {
    const todayEntries = getTodayData(fluidIntakeEntries)
    const amounts = todayEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getWeekFluidIntake = () => {
    const weekEntries = getWeekData(fluidIntakeEntries)
    const amounts = weekEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getMonthFluidIntake = () => {
    const monthEntries = getMonthData(fluidIntakeEntries)
    const amounts = monthEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getYearFluidIntake = () => {
    const yearEntries = getYearData(fluidIntakeEntries)
    const amounts = yearEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  // Functions to get fluid entry counts for different time periods
  const getTodayFluidCount = () => getTodayData(fluidIntakeEntries).length
  const getWeekFluidCount = () => getWeekData(fluidIntakeEntries).length
  const getMonthFluidCount = () => getMonthData(fluidIntakeEntries).length
  const getYearFluidCount = () => getYearData(fluidIntakeEntries).length

  // Add this useEffect to fetch data from IndexedDB
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true)
      try {
        const { db } = await import("../services/db")
        console.log("Fetching data from IndexedDB...")

        // Add error handling and fallbacks
        let uroLogs = []
        let hydroLogs = []

        try {
          // Check if the tables exist before calling toArray()
          if (db.uroLogs) {
            uroLogs = await db.uroLogs.toArray()
            console.log(`Fetched ${uroLogs.length} UroLogs from IndexedDB`)
          }
        } catch (error) {
          console.error("Error fetching uroLogs:", error)
        }

        try {
          if (db.hydroLogs) {
            hydroLogs = await db.hydroLogs.toArray()
            console.log(`Fetched ${hydroLogs.length} HydroLogs from IndexedDB`)
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
      if (sortedFlowEntries.length === 0 && sortedFluidEntries.length === 0) {
        ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151" // High contrast text
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("No data available for the selected time period", canvas.width / 2, canvas.height / 2)
        return
      }

      // Prepare data based on metric filter
      let dataPoints: { timestamp: string; value: number }[] = []
      let metricLabel = ""
      let maxYValue = 0
      let defaultMaxY = 30 // Default max for flow rate

      // Determine which data to show based on filters
      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        switch (metricFilter) {
          case "volume":
            dataPoints = sortedFlowEntries.map((entry) => ({
              timestamp: entry.timestamp,
              value: entry.volume,
            }))
            metricLabel = "Volume (mL)"
            defaultMaxY = 500 // Default max for volume
            break
          case "duration":
            dataPoints = sortedFlowEntries.map((entry) => ({
              timestamp: entry.timestamp,
              value: entry.duration,
            }))
            metricLabel = "Duration (sec)"
            defaultMaxY = 60 // Default max for duration
            break
          case "rate":
          default:
            dataPoints = sortedFlowEntries.map((entry) => ({
              timestamp: entry.timestamp,
              value: entry.flowRate,
            }))
            metricLabel = "Flow Rate (mL/s)"
            defaultMaxY = 30 // Default max for flow rate
            break
        }
      } else if (dataTypeFilter === "intake") {
        dataPoints = sortedFluidEntries.map((entry) => ({
          timestamp: entry.timestamp,
          value: entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount,
        }))
        metricLabel = "Fluid Intake (mL)"
        defaultMaxY = 1000 // Default max for fluid intake
      }

      // Find max value for scaling, ensuring it's at least the default
      if (dataPoints.length > 0) {
        const dataMax = Math.max(...dataPoints.map((point) => point.value))
        // Set maxYValue to 1.5 times the maximum data value, but cap it at reasonable defaults
        if (metricFilter === "rate") {
          // For flow rate, if max is around 8, set max to 12
          maxYValue = Math.min(Math.max(12, Math.ceil(dataMax * 1.5)), 30)
        } else if (metricFilter === "volume") {
          // For volume, set a reasonable scale
          maxYValue = Math.min(Math.max(500, Math.ceil(dataMax * 1.5)), 1000)
        } else if (metricFilter === "duration") {
          // For duration, set a reasonable scale
          maxYValue = Math.min(Math.max(60, Math.ceil(dataMax * 1.5)), 120)
        } else {
          // For other metrics, use 1.5x scaling
          maxYValue = Math.ceil(dataMax * 1.5)
        }

        // Find highest and lowest values in the dataset
        const highestValue = dataMax
        const lowestValue = Math.min(...dataPoints.map((point) => point.value))
      } else {
        maxYValue = defaultMaxY
      }

      // Set chart dimensions
      const padding = 40
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const width = canvasWidth - padding * 2
      const height = canvasHeight - padding * 2

      // Draw axes with high contrast colors
      ctx.beginPath()
      ctx.strokeStyle = darkMode ? "#e5e7eb" : "#374151" // High contrast
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Draw zero baseline (if not at bottom)
      ctx.beginPath()
      ctx.strokeStyle = darkMode ? "rgba(229, 231, 235, 0.2)" : "rgba(55, 65, 81, 0.2)" // Subtle line
      ctx.setLineDash([5, 3])
      ctx.moveTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()
      ctx.setLineDash([])

      // Get time period indicators
      const allDates = dataPoints.map((point) => new Date(point.timestamp))
      allDates.sort((a, b) => a.getTime() - b.getTime())

      if (allDates.length > 0) {
        const firstDate = allDates[0]
        const lastDate = allDates[allDates.length - 1]

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
            color: darkMode ? "rgba(147, 197, 253, 0.5)" : "rgba(59, 130, 246, 0.5)",
            highlight: timeFilter === "week",
          })
        }

        if (monthDate >= firstDate) {
          const monthPosition = (monthDate.getTime() - firstDate.getTime()) / (lastDate.getTime() - firstDate.getTime())
          markers.push({
            position: padding + monthPosition * width,
            label: "Month",
            color: darkMode ? "rgba(192, 132, 252, 0.5)" : "rgba(139, 92, 246, 0.5)",
            highlight: timeFilter === "month",
          })
        }

        if (yearDate >= firstDate) {
          const yearPosition = (yearDate.getTime() - firstDate.getTime()) / (lastDate.getTime() - firstDate.getTime())
          markers.push({
            position: padding + yearPosition * width,
            label: "Year",
            color: darkMode ? "rgba(252, 165, 165, 0.5)" : "rgba(239, 68, 68, 0.5)",
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

          // Draw label with high contrast
          ctx.fillStyle = marker.color
          ctx.font = marker.highlight ? "bold 12px Arial" : "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(marker.label, marker.position, padding - 10)
        })
      }

      // Draw data line if data exists
      if (dataPoints.length > 0) {
        // Draw the line
        ctx.beginPath()
        ctx.strokeStyle = darkMode ? "#3b82f6" : "#1d4ed8" // Blue with good contrast in both modes
        ctx.lineWidth = 2

        dataPoints.forEach((point, i) => {
          const x = padding + (i / (dataPoints.length - 1 || 1)) * width
          const y = canvas.height - padding - (point.value / maxYValue) * height
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw data points
        dataPoints.forEach((point, i) => {
          const x = padding + (i / (dataPoints.length - 1 || 1)) * width
          const y = canvas.height - padding - (point.value / maxYValue) * height
          ctx.beginPath()
          ctx.fillStyle = darkMode ? "#60a5fa" : "#2563eb" // Blue with good contrast
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        })

        // Find highest and lowest values in the dataset
        const highestValue = Math.max(...dataPoints.map((point) => point.value))
        const lowestValue = Math.min(...dataPoints.map((point) => point.value))

        // Draw highest value line
        const highestY = canvas.height - padding - (highestValue / maxYValue) * height
        ctx.beginPath()
        ctx.strokeStyle = darkMode ? "rgba(239, 68, 68, 0.7)" : "rgba(220, 38, 38, 0.7)" // Red with good contrast
        ctx.lineWidth = 1
        ctx.setLineDash([5, 3])
        ctx.moveTo(padding, highestY)
        ctx.lineTo(canvas.width - padding, highestY)
        ctx.stroke()

        // Draw highest value label
        ctx.fillStyle = darkMode ? "rgba(239, 68, 68, 0.9)" : "rgba(220, 38, 38, 0.9)"
        ctx.font = "12px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`Highest: ${highestValue.toFixed(1)}`, padding + 5, highestY - 5)

        // Draw lowest value line
        const lowestY = canvas.height - padding - (lowestValue / maxYValue) * height
        ctx.beginPath()
        ctx.strokeStyle = darkMode ? "rgba(59, 130, 246, 0.7)" : "rgba(37, 99, 235, 0.7)" // Blue with good contrast
        ctx.lineWidth = 1
        ctx.setLineDash([5, 3])
        ctx.moveTo(padding, lowestY)
        ctx.lineTo(canvas.width - padding, lowestY)
        ctx.stroke()

        // Draw lowest value label
        ctx.fillStyle = darkMode ? "rgba(59, 130, 246, 0.9)" : "rgba(37, 99, 235, 0.9)"
        ctx.font = "12px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`Lowest: ${lowestValue.toFixed(1)}`, padding + 5, lowestY + 15)

        // Reset line dash
        ctx.setLineDash([])
      }

      // Draw labels with high contrast colors
      ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151" // High contrast text
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // X-axis labels (dates)
      if (dataPoints.length > 0) {
        const dateLabels = dataPoints.map((point) => new Date(point.timestamp).toLocaleDateString())

        if (dateLabels.length > 10) {
          // If too many dates, show fewer labels
          const step = Math.ceil(dateLabels.length / 10)
          for (let i = 0; i < dateLabels.length; i += step) {
            const x = padding + (i / (dateLabels.length - 1 || 1)) * width
            ctx.fillText(dateLabels[i], x, canvas.height - padding + 15)
          }
        } else {
          dateLabels.forEach((date, i) => {
            const x = padding + (i / (dateLabels.length - 1 || 1)) * width
            ctx.fillText(date, x, canvas.height - padding + 15)
          })
        }
      }

      // Y-axis labels
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = (maxYValue * i) / 5
        const y = canvas.height - padding - (value / maxYValue) * height
        ctx.fillText(value.toFixed(1), padding - 5, y + 4)
      }

      // Chart title and Y-axis label
      ctx.textAlign = "center"
      ctx.font = "16px Arial"
      ctx.fillText(metricLabel, canvas.width / 2, 20)

      // Time period indicator
      ctx.textAlign = "right"
      ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151" // High contrast
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${
          timeFilter === "all"
            ? "All Time"
            : timeFilter === "week"
              ? "Last Week"
              : timeFilter === "month"
                ? "Last Month"
                : "Last Year"
        }`,
        canvas.width - padding,
        40,
      )
    }
  }, [activeTab, filteredFlowEntries, filteredFluidIntakeEntries, timeFilter, dataTypeFilter, metricFilter, darkMode])

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
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const cellWidth = (canvasWidth - padding * 2) / 24 // 24 hours
      const cellHeight = (canvasHeight - padding * 2) / 7 // 7 days

      // Draw grid
      ctx.strokeStyle = darkMode ? "#e5e7eb" : "#374151"
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
      ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151"
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
      ctx.fillStyle = darkMode ? "#cccccc" : "#666666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        canvas.width - padding,
        40,
      )
    }
  }, [activeTab, filteredFlowEntries, timeFilter, metricFilter, darkMode])

  // Draw bar chart
  useEffect(() => {
    if (activeTab === "bar" && barChartRef.current) {
      const canvas = barChartRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set chart dimensions
      const padding = 60
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const width = canvasWidth - padding * 2
      const height = canvasHeight - padding * 2

      // Prepare data based on the selected metric and filter
      let data: { label: string; value: number; color: string }[] = []
      let chartTitle = ""

      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        // For flow data, group by different metrics
        switch (metricFilter) {
          case "color":
            // Group by color
            chartTitle = "Distribution by Urine Color"
            const colorGroups: Record<string, number> = {}
            filteredFlowEntries.forEach((entry) => {
              if (entry.color) {
                colorGroups[entry.color] = (colorGroups[entry.color] || 0) + 1
              }
            })

            // Generate colors for each group
            const colorPalette = [
              "#3b82f6",
              "#ef4444",
              "#10b981",
              "#f59e0b",
              "#8b5cf6",
              "#ec4899",
              "#6366f1",
              "#14b8a6",
            ]

            data = Object.entries(colorGroups).map(([color, count], index) => ({
              label: color,
              value: count,
              color: colorPalette[index % colorPalette.length],
            }))
            break

          case "urgency":
            // Group by urgency
            chartTitle = "Distribution by Urgency Rating"
            const urgencyGroups: Record<string, number> = {}
            filteredFlowEntries.forEach((entry) => {
              if (entry.urgency) {
                urgencyGroups[entry.urgency] = (urgencyGroups[entry.urgency] || 0) + 1
              }
            })

            data = Object.entries(urgencyGroups).map(([urgency, count], index) => ({
              label: urgency,
              value: count,
              color: `hsl(${index * 30}, 70%, 60%)`,
            }))
            break

          case "concerns":
            // Group by concerns
            chartTitle = "Distribution by Reported Concerns"
            const concernGroups: Record<string, number> = {}
            filteredFlowEntries.forEach((entry) => {
              if (entry.concerns && entry.concerns.length > 0) {
                entry.concerns.forEach((concern) => {
                  concernGroups[concern] = (concernGroups[concern] || 0) + 1
                })
              }
            })

            data = Object.entries(concernGroups).map(([concern, count], index) => ({
              label: concern,
              value: count,
              color: `hsl(${index * 40}, 80%, 60%)`,
            }))
            break

          default:
            // Group by time periods (e.g., days of week)
            chartTitle = `Average ${
              metricFilter === "rate" ? "Flow Rate" : metricFilter === "volume" ? "Volume" : "Duration"
            } by Day of Week`

            // Group by day of week
            const dayGroups: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
            filteredFlowEntries.forEach((entry) => {
              const date = new Date(entry.timestamp)
              const day = date.getDay() // 0-6 (Sunday-Saturday)

              if (!dayGroups[day]) {
                dayGroups[day] = []
              }

              // Add value based on metric
              if (metricFilter === "volume") {
                dayGroups[day].push(entry.volume)
              } else if (metricFilter === "duration") {
                dayGroups[day].push(entry.duration)
              } else {
                dayGroups[day].push(entry.flowRate)
              }
            })

            // Calculate averages for each day
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const dayColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"]

            data = Object.entries(dayGroups).map(([day, values], index) => ({
              label: dayNames[Number.parseInt(day)],
              value: values.length > 0 ? calculateAverage(values) : 0,
              color: dayColors[index % dayColors.length],
            }))
            break
        }
      } else if (dataTypeFilter === "intake") {
        // For intake data, group by fluid type
        chartTitle =
          metricFilter === "beverage" ? "Distribution by Beverage Type" : "Average Fluid Intake by Beverage Type"

        const fluidGroups: Record<string, number[]> = {}
        filteredFluidIntakeEntries.forEach((entry) => {
          const type = entry.type === "Other" && entry.customType ? entry.customType : entry.type

          if (!fluidGroups[type]) {
            fluidGroups[type] = []
          }

          // Convert to mL for consistency
          const amount = entry.unit === "oz" ? entry.amount * 29.5735 : entry.amount
          fluidGroups[type].push(amount)
        })

        // Generate colors for each group
        const fluidColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"]

        if (metricFilter === "beverage") {
          // Count occurrences of each type
          data = Object.entries(fluidGroups).map(([type, values], index) => ({
            label: type,
            value: values.length,
            color: fluidColors[index % fluidColors.length],
          }))
        } else {
          // Calculate average intake for each type
          data = Object.entries(fluidGroups).map(([type, values], index) => ({
            label: type,
            value: values.length > 0 ? calculateAverage(values) : 0,
            color: fluidColors[index % fluidColors.length],
          }))
        }
      }

      // Sort data by value (descending)
      data.sort((a, b) => b.value - a.value)

      // If no data, show message
      if (data.length === 0) {
        ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("No data available for the selected filters", canvas.width / 2, canvas.height / 2)
        return
      }

      // Calculate max value for scaling
      const maxValue = Math.max(...data.map((item) => item.value))

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = darkMode ? "#e5e7eb" : "#374151"
      ctx.lineWidth = 1
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()

      // Draw bars
      const barWidth = Math.min(50, (width / data.length) * 0.8)
      const barSpacing = width / data.length

      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * height
        const x = padding + index * barSpacing + (barSpacing - barWidth) / 2
        const y = canvas.height - padding - barHeight

        // Draw bar
        ctx.fillStyle = item.color
        ctx.fillRect(x, y, barWidth, barHeight)

        // Draw value on top of bar
        ctx.fillStyle = darkMode ? "#ffffff" : "#000000"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(item.value.toFixed(metricFilter === "rate" ? 1 : 0), x + barWidth / 2, y - 5)

        // Draw label below bar
        ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"

        // Handle long labels
        let label = item.label
        if (label.length > 10) {
          label = label.substring(0, 8) + "..."
        }

        // Rotate labels if there are many
        if (data.length > 5) {
          ctx.save()
          ctx.translate(x + barWidth / 2, canvas.height - padding + 10)
          ctx.rotate(-Math.PI / 4)
          ctx.fillText(label, 0, 0)
          ctx.restore()
        } else {
          ctx.fillText(label, x + barWidth / 2, canvas.height - padding + 15)
        }
      })

      // Draw title
      ctx.fillStyle = darkMode ? "#ffffff" : "#000000"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText(chartTitle, canvas.width / 2, 20)

      // Draw time period
      ctx.textAlign = "right"
      ctx.fillStyle = darkMode ? "#cccccc" : "#666666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        canvas.width - padding,
        40,
      )
    }
  }, [activeTab, filteredFlowEntries, filteredFluidIntakeEntries, timeFilter, dataTypeFilter, metricFilter, darkMode])

  // Draw pie chart
  useEffect(() => {
    if (activeTab === "pie" && pieChartRef.current) {
      const canvas = pieChartRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Prepare data based on the selected metric and filter
      let data: { label: string; value: number; color: string }[] = []
      let chartTitle = ""

      if (dataTypeFilter === "flow" || dataTypeFilter === "both") {
        // For flow data, group by different metrics
        switch (metricFilter) {
          case "color":
            // Group by color
            chartTitle = "Distribution by Urine Color"
            const colorGroups: Record<string, number> = {}
            filteredFlowEntries.forEach((entry) => {
              if (entry.color) {
                colorGroups[entry.color] = (colorGroups[entry.color] || 0) + 1
              } else {
                colorGroups["Not Recorded"] = (colorGroups["Not Recorded"] || 0) + 1
              }
            })

            // Generate colors for each group
            const colorPalette = [
              "#3b82f6",
              "#ef4444",
              "#10b981",
              "#f59e0b",
              "#8b5cf6",
              "#ec4899",
              "#6366f1",
              "#14b8a6",
            ]

            data = Object.entries(colorGroups).map(([color, count], index) => ({
              label: color,
              value: count,
              color: colorPalette[index % colorPalette.length],
            }))
            break

          case "urgency":
            // Group by urgency
            chartTitle = "Distribution by Urgency Rating"
            const urgencyGroups: Record<string, number> = {}
            filteredFlowEntries.forEach((entry) => {
              if (entry.urgency) {
                urgencyGroups[entry.urgency] = (urgencyGroups[entry.urgency] || 0) + 1
              } else {
                urgencyGroups["Not Recorded"] = (urgencyGroups["Not Recorded"] || 0) + 1
              }
            })

            data = Object.entries(urgencyGroups).map(([urgency, count], index) => ({
              label: urgency,
              value: count,
              color: `hsl(${index * 30}, 70%, 60%)`,
            }))
            break

          case "concerns":
            // Group by concerns
            chartTitle = "Distribution by Reported Concerns"
            const concernGroups: Record<string, number> = {}
            let noConcernsCount = 0

            filteredFlowEntries.forEach((entry) => {
              if (entry.concerns && entry.concerns.length > 0) {
                entry.concerns.forEach((concern) => {
                  concernGroups[concern] = (concernGroups[concern] || 0) + 1
                })
              } else {
                noConcernsCount++
              }
            })

            if (noConcernsCount > 0) {
              concernGroups["No Concerns"] = noConcernsCount
            }

            data = Object.entries(concernGroups).map(([concern, count], index) => ({
              label: concern,
              value: count,
              color: `hsl(${index * 40}, 80%, 60%)`,
            }))
            break

          default:
            // For other metrics, group by ranges
            const metricName = metricFilter === "rate" ? "Flow Rate" : metricFilter === "volume" ? "Volume" : "Duration"
            chartTitle = `${metricName} Distribution`

            // Determine ranges based on metric
            let ranges: { min: number; max: number; label: string }[] = []

            if (metricFilter === "rate") {
              ranges = [
                { min: 0, max: 5, label: "0-5 mL/s" },
                { min: 5, max: 10, label: "5-10 mL/s" },
                { min: 10, max: 15, label: "10-15 mL/s" },
                { min: 15, max: 20, label: "15-20 mL/s" },
                { min: 20, max: Number.POSITIVE_INFINITY, label: "20+ mL/s" },
              ]
            } else if (metricFilter === "volume") {
              ranges = [
                { min: 0, max: 100, label: "0-100 mL" },
                { min: 100, max: 200, label: "100-200 mL" },
                { min: 200, max: 300, label: "200-300 mL" },
                { min: 300, max: 400, label: "300-400 mL" },
                { min: 400, max: Number.POSITIVE_INFINITY, label: "400+ mL" },
              ]
            } else {
              // duration
              ranges = [
                { min: 0, max: 15, label: "0-15 sec" },
                { min: 15, max: 30, label: "15-30 sec" },
                { min: 30, max: 45, label: "30-45 sec" },
                { min: 45, max: 60, label: "45-60 sec" },
                { min: 60, max: Number.POSITIVE_INFINITY, label: "60+ sec" },
              ]
            }

            // Count entries in each range
            const rangeCounts = ranges.map((range) => ({
              label: range.label,
              value: 0,
              color: "",
            }))

            filteredFlowEntries.forEach((entry) => {
              const value =
                metricFilter === "rate" ? entry.flowRate : metricFilter === "volume" ? entry.volume : entry.duration

              for (let i = 0; i < ranges.length; i++) {
                if (value >= ranges[i].min && value < ranges[i].max) {
                  rangeCounts[i].value++
                  break
                }
              }
            })

            // Assign colors
            const rangeColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

            data = rangeCounts
              .map((item, index) => ({
                ...item,
                color: rangeColors[index % rangeColors.length],
              }))
              .filter((item) => item.value > 0) // Remove empty ranges
            break
        }
      } else if (dataTypeFilter === "intake") {
        // For intake data, group by fluid type
        chartTitle = "Distribution by Beverage Type"

        const fluidGroups: Record<string, number> = {}
        filteredFluidIntakeEntries.forEach((entry) => {
          const type = entry.type === "Other" && entry.customType ? entry.customType : entry.type
          fluidGroups[type] = (fluidGroups[type] || 0) + 1
        })

        // Generate colors for each group
        const fluidColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"]

        data = Object.entries(fluidGroups).map(([type, count], index) => ({
          label: type,
          value: count,
          color: fluidColors[index % fluidColors.length],
        }))
      }

      // Sort data by value (descending)
      data.sort((a, b) => b.value - a.value)

      // If no data, show message
      if (data.length === 0) {
        ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText("No data available for the selected filters", canvas.width / 2, canvas.height / 2)
        return
      }

      // Calculate total for percentages
      const total = data.reduce((sum, item) => sum + item.value, 0)

      // Draw pie chart
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) / 2.5

      let startAngle = 0

      data.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI

        // Draw slice
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()

        // Draw slice border
        ctx.strokeStyle = darkMode ? "#1f2937" : "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

        // Calculate position for label
        const middleAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 0.7
        const labelX = centerX + Math.cos(middleAngle) * labelRadius
        const labelY = centerY + Math.sin(middleAngle) * labelRadius

        // Draw percentage if slice is big enough
        if (sliceAngle > 0.15) {
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 12px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          const percentage = Math.round((item.value / total) * 100)
          ctx.fillText(`${percentage}%`, labelX, labelY)
        }

        startAngle += sliceAngle
      })

      // Draw legend
      const legendX = canvas.width - 150
      const legendY = 60
      const legendItemHeight = 20

      data.forEach((item, index) => {
        const y = legendY + index * legendItemHeight

        // Draw color box
        ctx.fillStyle = item.color
        ctx.fillRect(legendX, y, 15, 15)

        // Draw border
        ctx.strokeStyle = darkMode ? "#e5e7eb" : "#374151"
        ctx.lineWidth = 1
        ctx.strokeRect(legendX, y, 15, 15)

        // Draw label
        ctx.fillStyle = darkMode ? "#e5e7eb" : "#374151"
        ctx.font = "12px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        // Truncate long labels
        let label = item.label
        if (label.length > 15) {
          label = label.substring(0, 12) + "..."
        }

        ctx.fillText(`${label} (${item.value})`, legendX + 20, y + 7.5)
      })

      // Draw title
      ctx.fillStyle = darkMode ? "#ffffff" : "#000000"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(chartTitle, canvas.width / 2, 20)

      // Draw time period
      ctx.textAlign = "left"
      ctx.fillStyle = darkMode ? "#cccccc" : "#666666"
      ctx.font = "12px Arial"
      ctx.fillText(
        `Showing: ${timeFilter === "all" ? "All Time" : timeFilter === "week" ? "Last Week" : timeFilter === "month" ? "Last Month" : "Last Year"}`,
        20,
        20,
      )
    }
  }, [activeTab, filteredFlowEntries, filteredFluidIntakeEntries, timeFilter, dataTypeFilter, metricFilter, darkMode])

  const shareChart = async (chartType: string, chartRef: React.RefObject<HTMLCanvasElement>) => {
    if (!isShareAvailable()) {
      alert("Sharing is not available on this device.")
      return
    }

    if (chartRef.current) {
      try {
        chartRef.current.toBlob(async (blob) => {
          if (blob) {
            const files = [new File([blob], `fluid-stats-${chartType}.png`, { type: "image/png" })]
            const shareData = {
              title: `Fluid Stats ${chartType} Chart`,
              text: "Check out my fluid stats!",
              files,
            }
            await navigator.share(shareData)
            console.log("Shared successfully")
          } else {
            console.error("Failed to create blob from canvas")
          }
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const getColorClassValue = (color: string) => {
    switch (color) {
      case "Clear":
        return "text-gray-500"
      case "Pale Yellow":
        return "text-yellow-300"
      case "Yellow":
        return "text-yellow-500"
      case "Dark Yellow":
        return "text-yellow-700"
      case "Amber":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  const getUrgencyClassValue = (urgency: string) => {
    switch (urgency) {
      case "Normal":
        return "text-green-500"
      case "Urgent":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {title2 && <div className="pb-4">{title2}</div>}

      {/* Tab navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "table"
              ? "bg-blue-500 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("table")}
        >
          Detail
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "line"
              ? "bg-blue-500 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("line")}
        >
          Line Chart
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "heatmap"
              ? "bg-blue-500 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("heatmap")}
        >
          Heatmap
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "bar"
              ? "bg-blue-500 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("bar")}
        >
          Bar Chart
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "pie"
              ? "bg-blue-500 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => setActiveTab("pie")}
        >
          Pie Chart
        </button>
        <button
          className="ml-auto px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          <Filter className="h-5 w-5" />
        </button>
        {activeTab === "line" && (
          <button
            className="ml-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => shareChart("line", lineChartRef)}
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
        {activeTab === "heatmap" && (
          <button
            className="ml-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => shareChart("heatmap", heatmapRef)}
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
        {activeTab === "bar" && (
          <button
            className="ml-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => shareChart("bar", barChartRef)}
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
        {activeTab === "pie" && (
          <button
            className="ml-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => shareChart("pie", pieChartRef)}
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilterPanel && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Time Period:</label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as "week" | "month" | "year" | "all")}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Data Type:</label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              value={dataTypeFilter}
              onChange={(e) => setDataTypeFilter(e.target.value as "flow" | "intake" | "both")}
            >
              <option value="flow">Flow</option>
              <option value="intake">Intake</option>
              <option value="both">Both</option>
            </select>
          </div>

          {dataTypeFilter !== "intake" && (
            <div className="mb-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Flow Metric:</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                value={metricFilter}
                onChange={(e) =>
                  setMetricFilter(
                    e.target.value as "volume" | "rate" | "color" | "urgency" | "concerns" | "beverage" | "duration",
                  )
                }
                disabled={dataTypeFilter === "intake"}
              >
                <option value="rate">Flow Rate</option>
                <option value="volume">Volume</option>
                <option value="duration">Duration</option>
                <option value="color">Color</option>
                <option value="urgency">Urgency</option>
                <option value="concerns">Concerns</option>
              </select>
            </div>
          )}

          {dataTypeFilter === "intake" && (
            <div className="mb-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Intake Metric:</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                value={metricFilter}
                onChange={(e) =>
                  setMetricFilter(
                    e.target.value as "volume" | "rate" | "color" | "urgency" | "concerns" | "beverage" | "duration",
                  )
                }
              >
                <option value="volume">Volume</option>
                <option value="beverage">Beverage Type</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="p-4 flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : activeTab === "table" ? (
          <div>
            {/* Flow Statistics - changed to UroLog */}
            {dataTypeFilter !== "intake" && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">UroLog</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</h4>
                    <p className="text-lg font-semibold">{getTodayFlowRate().toFixed(2)} mL/s</p>
                    <p className="text-xs text-gray-500">{getTodayFlowCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Week</h4>
                    <p className="text-lg font-semibold">{getWeekFlowRate().toFixed(2)} mL/s</p>
                    <p className="text-xs text-gray-500">{getWeekFlowCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Month</h4>
                    <p className="text-lg font-semibold">{getMonthFlowRate().toFixed(2)} mL/s</p>
                    <p className="text-xs text-gray-500">{getMonthFlowCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</h4>
                    <p className="text-lg font-semibold">{getYearFlowRate().toFixed(2)} mL/s</p>
                    <p className="text-xs text-gray-500">{getYearFlowCount()} entries</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Droplet className="text-blue-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Average Flow Rate</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{averageFlowRate.toFixed(2)} mL/s</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Droplet className="text-blue-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Average Volume</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{averageVolume.toFixed(2)} mL</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Clock className="text-blue-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Average Duration</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{averageDuration.toFixed(2)} seconds</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="text-green-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Recent Average Flow Rate
                      </h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{recentAverageFlowRate.toFixed(2)} mL/s</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="text-yellow-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Most Common Color</h4>
                    </div>
                    <p className={`text-gray-700 dark:text-gray-300 ${getColorClassValue(mostCommonColor)}`}>
                      {mostCommonColor || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="text-red-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Most Common Urgency</h4>
                    </div>
                    <p className={`text-gray-700 dark:text-gray-300 ${getUrgencyClassValue(mostCommonUrgency)}`}>
                      {mostCommonUrgency || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="text-red-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Most Common Concern</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{mostCommonConcern || "N/A"}</p>
                  </div>
                </div>
              </>
            )}

            {/* Fluid Intake Statistics - changed to HydroLog */}
            {dataTypeFilter !== "flow" && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">HydroLog</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</h4>
                    <p className="text-lg font-semibold">{getTodayFluidIntake().toFixed(0)} mL</p>
                    <p className="text-xs text-gray-500">{getTodayFluidCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Week</h4>
                    <p className="text-lg font-semibold">{getWeekFluidIntake().toFixed(0)} mL</p>
                    <p className="text-xs text-gray-500">{getWeekFluidCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Month</h4>
                    <p className="text-lg font-semibold">{getMonthFluidIntake().toFixed(0)} mL</p>
                    <p className="text-xs text-gray-500">{getMonthFluidCount()} entries</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-3 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</h4>
                    <p className="text-lg font-semibold">{getYearFluidIntake().toFixed(0)} mL</p>
                    <p className="text-xs text-gray-500">{getYearFluidCount()} entries</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Droplet className="text-blue-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Average Fluid Intake</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{averageFluidIntake.toFixed(2)} mL</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <Coffee className="text-orange-500 mr-2" />
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Most Common Fluid Type</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{mostCommonFluidType || "N/A"}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow rounded p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      {fluidIntakeTrend === "up" ? (
                        <TrendingUp className="text-green-500 mr-2" />
                      ) : fluidIntakeTrend === "down" ? (
                        <TrendingDown className="text-red-500 mr-2" />
                      ) : (
                        <TrendingUp className="text-gray-500 mr-2" />
                      )}
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Fluid Intake Trend</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{fluidIntakeTrend}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === "line" ? (
          <canvas ref={lineChartRef} width={800} height={400} />
        ) : activeTab === "heatmap" ? (
          <canvas ref={heatmapRef} width={800} height={400} />
        ) : activeTab === "bar" ? (
          <canvas ref={barChartRef} width={800} height={400} />
        ) : activeTab === "pie" ? (
          <canvas ref={pieChartRef} width={800} height={400} />
        ) : (
          <p>Select a tab to view data.</p>
        )}
      </div>
    </div>
  )
}

export default Stats
