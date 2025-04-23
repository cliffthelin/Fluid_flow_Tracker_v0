"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Droplet, Coffee, TrendingUp, TrendingDown, Dumbbell } from "lucide-react"
import type { UroLog, HydroLog, KegelLog } from "../types"
import { isShareAvailable } from "../services/share"
import { useConfig } from "../context/ConfigContext"
import CollapsibleSection from "./CollapsibleSection"

interface FluidStatsProps {
  title2?: React.ReactNode
}

// Change the component name from FluidStats to Stats
const Stats: React.FC<FluidStatsProps> = ({ title2 }) => {
  // Add these state variables at the top of the component
  const [flowEntries, setFlowEntries] = useState<UroLog[]>([])
  const [fluidIntakeEntries, setFluidIntakeEntries] = useState<HydroLog[]>([])
  const [kegelEntries, setKegelEntries] = useState<KegelLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"table" | "line" | "heatmap" | "bar" | "pie">("table")
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)
  const scatterRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)

  // Add filter state
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("all")
  const [dataTypeFilter, setDataTypeFilter] = useState<"flow" | "intake" | "kegel" | "both">("both")
  const [metricFilter, setMetricFilter] = useState<
    | "volume"
    | "rate"
    | "color"
    | "urgency"
    | "concerns"
    | "beverage"
    | "duration"
    | "reps"
    | "holdTime"
    | "sets"
    | "totalTime"
  >("rate")
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Add this inside the Stats component, near the top with other state variables
  const { uroLogMeasurement, uroLogUnit } = useConfig()

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
  const filterDataByTime = (entries: (UroLog | HydroLog | KegelLog)[]) => {
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
  const filteredFlowEntries =
    dataTypeFilter === "intake" || dataTypeFilter === "kegel" ? [] : filterDataByTime(flowEntries)
  const filteredFluidIntakeEntries =
    dataTypeFilter === "flow" || dataTypeFilter === "kegel" ? [] : filterDataByTime(fluidIntakeEntries)
  const filteredKegelEntries =
    dataTypeFilter === "flow" || dataTypeFilter === "intake" ? [] : filterDataByTime(kegelEntries)

  // Determine appropriate time filter based on data span
  useEffect(() => {
    // Combine all entries to find the oldest
    const allEntries = [...flowEntries, ...fluidIntakeEntries, ...kegelEntries]
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
  }, [flowEntries, fluidIntakeEntries, kegelEntries])

  // Update metric filter when data type changes
  useEffect(() => {
    if (
      dataTypeFilter === "intake" &&
      (metricFilter === "rate" || metricFilter === "color" || metricFilter === "urgency" || metricFilter === "concerns")
    ) {
      setMetricFilter("volume")
    } else if (dataTypeFilter === "flow" && metricFilter === "beverage") {
      setMetricFilter("rate")
    } else if (
      dataTypeFilter === "kegel" &&
      (metricFilter === "rate" ||
        metricFilter === "color" ||
        metricFilter === "urgency" ||
        metricFilter === "concerns" ||
        metricFilter === "beverage")
    ) {
      setMetricFilter("reps")
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

  // Kegel statistics
  const averageKegelReps = calculateAverage(filteredKegelEntries.map((entry) => entry.reps))
  const averageKegelHoldTime = calculateAverage(filteredKegelEntries.map((entry) => entry.holdTime))
  const averageKegelSets = calculateAverage(filteredKegelEntries.map((entry) => entry.sets))
  const averageKegelTotalTime = calculateAverage(filteredKegelEntries.map((entry) => entry.totalTime))

  // Add this helper function inside the component
  const getFlowRateUnit = () => {
    if (uroLogMeasurement === "Urine Volume") {
      return "mL/s"
    }
    if (uroLogUnit.includes("/")) {
      return uroLogUnit
    }
    return `${uroLogUnit}/s`
  }

  // Add these helper functions to filter data by time periods
  // Add these functions after the existing filter functions but before the useEffect hooks

  // Helper functions to get data for specific time periods
  const getTodayData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return entries.filter((entry) => new Date(entry.timestamp) >= today)
  }

  const getWeekData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entries.filter((entry) => new Date(entry.timestamp) >= weekAgo)
  }

  const getMonthData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return entries.filter((entry) => new Date(entry.timestamp) >= monthAgo)
  }

  const getYearData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    return entries.filter((entry) => new Date(entry.timestamp) >= yearAgo)
  }

  // Add these functions to get data for previous time periods after the existing time period functions

  // Functions to get data for previous time periods
  const getYesterdayData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const dayBefore = new Date(yesterday)
    dayBefore.setDate(dayBefore.getDate() - 1)
    return entries.filter((entry) => new Date(entry.timestamp) >= dayBefore && new Date(entry.timestamp) < today)
  }

  const getPreviousWeekData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return entries.filter((entry) => new Date(entry.timestamp) >= twoWeeksAgo && new Date(entry.timestamp) < weekAgo)
  }

  const getPreviousMonthData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    return entries.filter((entry) => new Date(entry.timestamp) >= twoMonthsAgo && new Date(entry.timestamp) < monthAgo)
  }

  const getPreviousYearData = (entries: (UroLog | HydroLog | KegelLog)[]) => {
    const yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    return entries.filter((entry) => new Date(entry.timestamp) >= twoYearsAgo && new Date(entry.timestamp) < yearAgo)
  }

  // Add these functions to calculate most common color for different time periods
  // Add these after the existing time period functions

  const getMostCommonColorForPeriod = (entries: UroLog[]) => {
    const entriesWithColor = entries.filter((entry) => entry.color)
    const colorCounts: Record<string, number> = {}

    entriesWithColor.forEach((entry) => {
      if (entry.color) {
        colorCounts[entry.color] = (colorCounts[entry.color] || 0) + 1
      }
    })

    let mostCommonColor = ""
    let maxColorCount = 0

    Object.entries(colorCounts).forEach(([color, count]) => {
      if (count > maxColorCount) {
        mostCommonColor = color
        maxColorCount = count
      }
    })

    return { mostCommonColor, count: entriesWithColor.length }
  }

  const getTodayMostCommonColor = () => {
    const todayEntries = getTodayData(flowEntries) as UroLog[]
    return getMostCommonColorForPeriod(todayEntries)
  }

  const getWeekMostCommonColor = () => {
    const weekEntries = getWeekData(flowEntries) as UroLog[]
    return getMostCommonColorForPeriod(weekEntries)
  }

  const getMonthMostCommonColor = () => {
    const monthEntries = getMonthData(flowEntries) as UroLog[]
    return getMostCommonColorForPeriod(monthEntries)
  }

  const getYearMostCommonColor = () => {
    const yearEntries = getYearData(flowEntries) as UroLog[]
    return getMostCommonColorForPeriod(yearEntries)
  }

  // Function to get top colors for a period
  const getTopColorsForPeriod = (entries: UroLog[], limit = 3) => {
    const entriesWithColor = entries.filter((entry) => entry.color)
    const colorCounts: Record<string, number> = {}

    entriesWithColor.forEach((entry) => {
      if (entry.color) {
        colorCounts[entry.color] = (colorCounts[entry.color] || 0) + 1
      }
    })

    return Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([color, count]) => ({ color, count }))
  }

  // Function to get top concerns for a period
  const getTopConcernsForPeriod = (entries: UroLog[], limit = 3) => {
    const concernCounts: Record<string, number> = {}

    entries.forEach((entry) => {
      if (entry.concerns && entry.concerns.length > 0) {
        entry.concerns.forEach((concern) => {
          concernCounts[concern] = (concernCounts[concern] || 0) + 1
        })
      }
    })

    return Object.entries(concernCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([concern, count]) => ({ concern, count }))
  }

  // Get top colors and concerns for each time period
  const getTodayTopColors = () => getTopColorsForPeriod(getTodayData(flowEntries) as UroLog[])
  const getWeekTopColors = () => getTopColorsForPeriod(getWeekData(flowEntries) as UroLog[])
  const getMonthTopColors = () => getTopColorsForPeriod(getMonthData(flowEntries) as UroLog[])
  const getYearTopColors = () => getTopColorsForPeriod(getYearData(flowEntries) as UroLog[])

  const getTodayTopConcerns = () => getTopConcernsForPeriod(getTodayData(flowEntries) as UroLog[])
  const getWeekTopConcerns = () => getTopConcernsForPeriod(getWeekData(flowEntries) as UroLog[])
  const getMonthTopConcerns = () => getTopConcernsForPeriod(getMonthData(flowEntries) as UroLog[])
  const getYearTopConcerns = () => getTopConcernsForPeriod(getYearData(flowEntries) as UroLog[])

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

  // Functions to calculate flow rate statistics for previous time periods
  const getYesterdayFlowRate = () => {
    const yesterdayEntries = getYesterdayData(flowEntries)
    return calculateAverage(yesterdayEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getPreviousWeekFlowRate = () => {
    const prevWeekEntries = getPreviousWeekData(flowEntries)
    return calculateAverage(prevWeekEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getPreviousMonthFlowRate = () => {
    const prevMonthEntries = getPreviousMonthData(flowEntries)
    return calculateAverage(prevMonthEntries.map((entry) => (entry as UroLog).flowRate)) || 0
  }

  const getPreviousYearFlowRate = () => {
    const prevYearEntries = getPreviousYearData(flowEntries)
    return calculateAverage(prevYearEntries.map((entry) => (entry as UroLog).flowRate)) || 0
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

  // Functions to calculate fluid intake for previous time periods
  const getYesterdayFluidIntake = () => {
    const yesterdayEntries = getYesterdayData(fluidIntakeEntries)
    const amounts = yesterdayEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getPreviousWeekFluidIntake = () => {
    const prevWeekEntries = getPreviousWeekData(fluidIntakeEntries)
    const amounts = prevWeekEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getPreviousMonthFluidIntake = () => {
    const prevMonthEntries = getPreviousMonthData(fluidIntakeEntries)
    const amounts = prevMonthEntries.map((entry) => {
      const hydroEntry = entry as HydroLog
      return hydroEntry.unit === "oz" ? hydroEntry.amount * 29.5735 : hydroEntry.amount
    })
    return calculateAverage(amounts) || 0
  }

  const getPreviousYearFluidIntake = () => {
    const prevYearEntries = getPreviousYearData(fluidIntakeEntries)
    const amounts = prevYearEntries.map((entry) => {
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

  // Functions to calculate kegel statistics for different time periods
  const getTodayKegelReps = () => {
    const todayEntries = getTodayData(kegelEntries)
    return calculateAverage(todayEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getWeekKegelReps = () => {
    const weekEntries = getWeekData(kegelEntries)
    return calculateAverage(weekEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getMonthKegelReps = () => {
    const monthEntries = getMonthData(kegelEntries)
    return calculateAverage(monthEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getYearKegelReps = () => {
    const yearEntries = getYearData(kegelEntries)
    return calculateAverage(yearEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  // Functions to calculate kegel statistics for previous time periods
  const getYesterdayKegelReps = () => {
    const yesterdayEntries = getYesterdayData(kegelEntries)
    return calculateAverage(yesterdayEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getPreviousWeekKegelReps = () => {
    const prevWeekEntries = getPreviousWeekData(kegelEntries)
    return calculateAverage(prevWeekEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getPreviousMonthKegelReps = () => {
    const prevMonthEntries = getPreviousMonthData(kegelEntries)
    return calculateAverage(prevMonthEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  const getPreviousYearKegelReps = () => {
    const prevYearEntries = getPreviousYearData(kegelEntries)
    return calculateAverage(prevYearEntries.map((entry) => (entry as KegelLog).reps)) || 0
  }

  // Functions to get kegel entry counts for different time periods
  const getTodayKegelCount = () => getTodayData(kegelEntries).length
  const getWeekKegelCount = () => getWeekData(kegelEntries).length
  const getMonthKegelCount = () => getMonthData(kegelEntries).length
  const getYearKegelCount = () => getYearData(kegelEntries).length

  // Add these functions to calculate volume statistics for different time periods
  const getTodayVolume = () => {
    const todayEntries = getTodayData(flowEntries)
    return calculateAverage(todayEntries.map((entry) => (entry as UroLog).volume)) || 0
  }

  const getWeekVolume = () => {
    const weekEntries = getWeekData(flowEntries)
    return calculateAverage(weekEntries.map((entry) => (entry as UroLog).volume)) || 0
  }

  const getMonthVolume = () => {
    const monthEntries = getMonthData(flowEntries)
    return calculateAverage(monthEntries.map((entry) => (entry as UroLog).volume)) || 0
  }

  const getYearVolume = () => {
    const yearEntries = getYearData(flowEntries)
    return calculateAverage(yearEntries.map((entry) => (entry as UroLog).volume)) || 0
  }

  // Add this useEffect to handle the initial data load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { getAllUroLogs, getAllHydroLogs, getAllKegelLogs } = await import("../services/db")
        const uroLogsData = await getAllUroLogs()
        const hydroLogsData = await getAllHydroLogs()
        const kegelLogsData = await getAllKegelLogs()

        setFlowEntries(uroLogsData)
        setFluidIntakeEntries(hydroLogsData)
        setKegelEntries(kegelLogsData)
      } catch (error) {
        console.error("Error fetching entries from database:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Add a helper function to calculate percentage difference and determine if it's higher or lower
  const getComparisonInfo = (value: number, average: number) => {
    if (average === 0) return { isHigher: false, percentDiff: 0 }
    const percentDiff = ((value - average) / average) * 100
    return {
      isHigher: percentDiff > 0,
      percentDiff: Math.abs(percentDiff),
    }
  }

  // Add a helper function to render comparison with previous period
  const renderPreviousPeriodComparison = (current: number, previous: number, unit = "mL/s") => {
    if (previous === 0 || isNaN(current) || isNaN(previous)) return null
    const percentDiff = ((current - previous) / previous) * 100
    const isHigher = percentDiff > 0

    return (
      <div className="mt-1 text-sm flex items-center">
        <span className="text-gray-600 dark:text-gray-400 mr-1">Prev:</span>
        <span className="font-medium">
          {previous.toFixed(1)} {unit}
        </span>
        <span className={`ml-2 flex items-center ${isHigher ? "text-green-500" : "text-red-500"}`}>
          {isHigher ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(percentDiff).toFixed(1)}%
        </span>
      </div>
    )
  }

  // Add a helper function to render comparison indicators
  const renderComparisonIndicator = (value: number, average: number) => {
    if (average === 0 || isNaN(value)) return null
    const { isHigher, percentDiff } = getComparisonInfo(value, average)

    return (
      <span className={`ml-2 text-sm flex items-center ${isHigher ? "text-green-500" : "text-red-500"}`}>
        {isHigher ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {percentDiff.toFixed(1)}%
      </span>
    )
  }

  // Replace the return statement with this improved version that shows statistics for different time periods
  return (
    <div className="flex flex-col h-full">
      {title2 && <div className="pb-4">{title2}</div>}

      {/* Filter controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          className={`px-4 py-2 rounded-lg ${
            dataTypeFilter === "flow" || dataTypeFilter === "both"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          }`}
          onClick={() => setDataTypeFilter(dataTypeFilter === "flow" ? "both" : "flow")}
        >
          <Droplet className="inline-block mr-1" size={16} /> UroLog
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            dataTypeFilter === "intake" || dataTypeFilter === "both"
              ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          }`}
          onClick={() => setDataTypeFilter(dataTypeFilter === "intake" ? "both" : "intake")}
        >
          <Coffee className="inline-block mr-1" size={16} /> HydroLog
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            dataTypeFilter === "kegel"
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          }`}
          onClick={() => setDataTypeFilter(dataTypeFilter === "kegel" ? "both" : "kegel")}
        >
          <Dumbbell className="inline-block mr-1" size={16} /> KegelLog
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* UroLog Statistics */}
          {(dataTypeFilter === "flow" || dataTypeFilter === "both") && (
            <CollapsibleSection title="UroLog Statistics" defaultExpanded={true}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Droplet className="mr-2 text-blue-500" size={22} /> {uroLogMeasurement} Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Stats */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Today</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Flow Rate:</span>
                        <span className="font-medium flex items-center">
                          {getTodayFlowRate().toFixed(1)} {getFlowRateUnit()}
                          {renderComparisonIndicator(getTodayFlowRate(), averageFlowRate)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getTodayFlowRate(), getYesterdayFlowRate(), getFlowRateUnit())}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />

                      {/* Top Colors */}
                      {getTodayTopColors().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Colors:</span>
                          <div className="mt-1 space-y-1">
                            {getTodayTopColors().map(({ color, count }) => (
                              <div key={color} className="flex justify-between text-sm">
                                <span>{color}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getTodayTopColors().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      {/* Top Concerns */}
                      {getTodayTopConcerns().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Concerns:</span>
                          <div className="mt-1 space-y-1">
                            {getTodayTopConcerns().map(({ concern, count }) => (
                              <div key={concern} className="flex justify-between text-sm">
                                <span>{concern}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getTodayTopConcerns().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getTodayFlowCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Week Stats */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Week</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Flow Rate:</span>
                        <span className="font-medium flex items-center">
                          {getWeekFlowRate().toFixed(1)} {getFlowRateUnit()}
                          {renderComparisonIndicator(getWeekFlowRate(), averageFlowRate)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getWeekFlowRate(), getPreviousWeekFlowRate(), getFlowRateUnit())}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />

                      {/* Top Colors */}
                      {getWeekTopColors().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Colors:</span>
                          <div className="mt-1 space-y-1">
                            {getWeekTopColors().map(({ color, count }) => (
                              <div key={color} className="flex justify-between text-sm">
                                <span>{color}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getWeekTopColors().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      {/* Top Concerns */}
                      {getWeekTopConcerns().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Concerns:</span>
                          <div className="mt-1 space-y-1">
                            {getWeekTopConcerns().map(({ concern, count }) => (
                              <div key={concern} className="flex justify-between text-sm">
                                <span>{concern}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getWeekTopConcerns().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getWeekFlowCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Month Stats */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Month</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Flow Rate:</span>
                        <span className="font-medium flex items-center">
                          {getMonthFlowRate().toFixed(1)} {getFlowRateUnit()}
                          {renderComparisonIndicator(getMonthFlowRate(), averageFlowRate)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(
                        getMonthFlowRate(),
                        getPreviousMonthFlowRate(),
                        getFlowRateUnit(),
                      )}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />

                      {/* Top Colors */}
                      {getMonthTopColors().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Colors:</span>
                          <div className="mt-1 space-y-1">
                            {getMonthTopColors().map(({ color, count }) => (
                              <div key={color} className="flex justify-between text-sm">
                                <span>{color}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getMonthTopColors().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      {/* Top Concerns */}
                      {getMonthTopConcerns().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Concerns:</span>
                          <div className="mt-1 space-y-1">
                            {getMonthTopConcerns().map(({ concern, count }) => (
                              <div key={concern} className="flex justify-between text-sm">
                                <span>{concern}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getMonthTopConcerns().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getMonthFlowCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Year Stats */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Year</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Flow Rate:</span>
                        <span className="font-medium flex items-center">
                          {getYearFlowRate().toFixed(1)} {getFlowRateUnit()}
                          {renderComparisonIndicator(getYearFlowRate(), averageFlowRate)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getYearFlowRate(), getPreviousYearFlowRate(), getFlowRateUnit())}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />

                      {/* Top Colors */}
                      {getYearTopColors().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Colors:</span>
                          <div className="mt-1 space-y-1">
                            {getYearTopColors().map(({ color, count }) => (
                              <div key={color} className="flex justify-between text-sm">
                                <span>{color}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getYearTopColors().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      {/* Top Concerns */}
                      {getYearTopConcerns().length > 0 && (
                        <div className="py-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Top Concerns:</span>
                          <div className="mt-1 space-y-1">
                            {getYearTopConcerns().map(({ concern, count }) => (
                              <div key={concern} className="flex justify-between text-sm">
                                <span>{concern}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {getYearTopConcerns().length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-2" />}

                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getYearFlowCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* HydroLog Statistics */}
          {(dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredFluidIntakeEntries.length > 0 && (
            <CollapsibleSection title="HydroLog Statistics" defaultExpanded={true}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Coffee className="mr-2 text-cyan-500" size={22} /> HydroLog Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Stats */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Today</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Intake:</span>
                        <span className="font-medium flex items-center">
                          {getTodayFluidIntake().toFixed(0)} mL
                          {renderComparisonIndicator(getTodayFluidIntake(), averageFluidIntake)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getTodayFluidIntake(), getYesterdayFluidIntake(), "mL")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getTodayFluidCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Week Stats */}
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-100 dark:border-teal-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Week</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Intake:</span>
                        <span className="font-medium flex items-center">
                          {getWeekFluidIntake().toFixed(0)} mL
                          {renderComparisonIndicator(getWeekFluidIntake(), averageFluidIntake)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getWeekFluidIntake(), getPreviousWeekFluidIntake(), "mL")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getWeekFluidCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Month Stats */}
                  <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Month</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Intake:</span>
                        <span className="font-medium flex items-center">
                          {getMonthFluidIntake().toFixed(0)} mL
                          {renderComparisonIndicator(getMonthFluidIntake(), averageFluidIntake)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getMonthFluidIntake(), getPreviousMonthFluidIntake(), "mL")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getMonthFluidCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Year Stats */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Year</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Intake:</span>
                        <span className="font-medium flex items-center">
                          {getYearFluidIntake().toFixed(0)} mL
                          {renderComparisonIndicator(getYearFluidIntake(), averageFluidIntake)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getYearFluidIntake(), getPreviousYearFluidIntake(), "mL")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getYearFluidCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional HydroLog Stats */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Average Intake</h4>
                    <p className="text-2xl font-bold">{averageFluidIntake.toFixed(0)} mL</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ({(averageFluidIntake / 29.5735).toFixed(1)} oz)
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Trend</h4>
                    <div className="flex items-center">
                      {fluidIntakeTrend === "up" ? (
                        <TrendingUp className="mr-2 text-green-500" size={20} />
                      ) : fluidIntakeTrend === "down" ? (
                        <TrendingDown className="mr-2 text-red-500" size={20} />
                      ) : (
                        <span className="mr-2">→</span>
                      )}
                      <p className="text-xl font-bold">
                        {fluidIntakeTrend === "up"
                          ? "Increasing"
                          : fluidIntakeTrend === "down"
                            ? "Decreasing"
                            : "Stable"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on recent entries</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Most Common Type</h4>
                    <p className="text-xl font-bold">{mostCommonFluidType || "N/A"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Based on {Object.keys(fluidTypeCounts).length} types
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* KegelLog Statistics */}
          {(dataTypeFilter === "kegel" || dataTypeFilter === "both") && (
            <CollapsibleSection title="KegelLog Statistics" defaultExpanded={true}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Dumbbell className="mr-2 text-purple-500" size={22} /> KegelLog Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Stats */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Today</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                        <span className="font-medium flex items-center">
                          {getTodayKegelReps().toFixed(0)}
                          {renderComparisonIndicator(getTodayKegelReps(), averageKegelReps)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getTodayKegelReps(), getYesterdayKegelReps(), "")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getTodayKegelCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Week Stats */}
                  <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 p-4 rounded-lg border border-fuchsia-100 dark:border-fuchsia-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Week</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                        <span className="font-medium flex items-center">
                          {getWeekKegelReps().toFixed(0)}
                          {renderComparisonIndicator(getWeekKegelReps(), averageKegelReps)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getWeekKegelReps(), getPreviousWeekKegelReps(), "")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getWeekKegelCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Month Stats */}
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-100 dark:border-pink-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Month</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                        <span className="font-medium flex items-center">
                          {getMonthKegelReps().toFixed(0)}
                          {renderComparisonIndicator(getMonthKegelReps(), averageKegelReps)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getMonthKegelReps(), getPreviousMonthKegelReps(), "")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getMonthKegelCount()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Year Stats */}
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-100 dark:border-rose-800/30">
                    <h3 className="text-xl font-bold mb-2 text-center">Year</h3>
                    <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                    <div className="space-y-0">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                        <span className="font-medium flex items-center">
                          {getYearKegelReps().toFixed(0)}
                          {renderComparisonIndicator(getYearKegelReps(), averageKegelReps)}
                        </span>
                      </div>
                      {renderPreviousPeriodComparison(getYearKegelReps(), getPreviousYearKegelReps(), "")}
                      <hr className="border-gray-200 dark:border-gray-700 my-2" />
                      <div className="flex justify-between pt-2">
                        <span className="text-gray-600 dark:text-gray-400">Entries:</span>
                        <span className="font-medium">{getYearKegelCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional KegelLog Stats */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Hold Time</h4>
                    <p className="text-2xl font-bold">{averageKegelHoldTime.toFixed(1)} sec</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average hold time</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Sets</h4>
                    <p className="text-2xl font-bold">{averageKegelSets.toFixed(1)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average sets per session</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Total Time</h4>
                    <p className="text-2xl font-bold">{averageKegelTotalTime.toFixed(0)} sec</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average total exercise time</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  )
}

export default Stats
