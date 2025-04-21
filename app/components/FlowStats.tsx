"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  BarChart,
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
  BarChartIcon,
} from "lucide-react"
import type { UroLog, HydroLog } from "../types"
import CollapsibleSection from "./CollapsibleSection"

interface FluidStatsProps {
  title2?: React.ReactNode
}

const FluidStats: React.FC<FluidStatsProps> = ({ title2 }) => {
  const [uroLogs, setUroLogs] = useState<UroLog[]>([])
  const [hydroLogs, setHydroLogs] = useState<HydroLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("table")
  const [timeFilter, setTimeFilter] = useState("all")
  const [dataTypeFilter, setDataTypeFilter] = useState("both")

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true)
      try {
        const { db } = await import("../services/db")
        const uroLogs = await db.uroLogs.toArray()
        const hydroLogs = await db.hydroLogs.toArray()
        setUroLogs(uroLogs)
        setHydroLogs(hydroLogs)
      } catch (error) {
        console.error("Error fetching entries from database:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [])

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

  const filteredUroLogs = dataTypeFilter === "intake" ? [] : filterDataByTime(uroLogs)
  const filteredHydroLogs = dataTypeFilter === "uroLog" ? [] : filterDataByTime(hydroLogs)

  const calculateAverage = (values: number[]) => {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  const averageFlowRate = calculateAverage(filteredUroLogs.map((entry) => entry.flowRate))
  const averageVolume = calculateAverage(filteredUroLogs.map((entry) => entry.volume))
  const averageDuration = calculateAverage(filteredUroLogs.map((entry) => entry.duration))

  // Get recent entries (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentUroLogs = filteredUroLogs.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
  const recentAverageFlowRate = calculateAverage(recentUroLogs.map((entry) => entry.flowRate))

  // Get color distribution
  const entriesWithColor = filteredUroLogs.filter((entry) => entry.color)
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
  const entriesWithUrgency = filteredUroLogs.filter((entry) => entry.urgency)
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
  filteredUroLogs.forEach((entry) => {
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

  // HydroLog statistics
  const entriesWithHydroLog = filteredHydroLogs.filter((entry) => entry.hydroLog)

  // Calculate average hydroLog
  const hydroLogAmounts = entriesWithHydroLog.map((entry) => {
    const { hydroLog } = entry
    if (!hydroLog) return 0

    // Convert all to mL for consistency
    return hydroLog.unit === "oz" ? hydroLog.amount * 29.5735 : hydroLog.amount
  })

  const averageHydroLog = calculateAverage(hydroLogAmounts)

  // Get fluid type distribution
  const fluidTypeCounts: Record<string, number> = {}
  entriesWithHydroLog.forEach((entry) => {
    if (entry.hydroLog?.type) {
      const type =
        entry.hydroLog.type === "Other" && entry.hydroLog.customType ? entry.hydroLog.customType : entry.hydroLog.type

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

  // Check if hydrolog is trending up or down
  let hydroLogTrend: "up" | "down" | "stable" = "stable"
  if (entriesWithHydroLog.length >= 4) {
    const sortedEntries = [...entriesWithHydroLog].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const halfLength = Math.floor(sortedEntries.length / 2)
    const firstHalf = sortedEntries.slice(0, halfLength)
    const secondHalf = sortedEntries.slice(halfLength)

    const firstHalfAvg = calculateAverage(
      firstHalf.map((entry) => {
        if (!entry.hydroLog) return 0
        return entry.hydroLog.unit === "oz" ? entry.hydroLog.amount * 29.5735 : entry.hydroLog.amount
      }),
    )

    const secondHalfAvg = calculateAverage(
      secondHalf.map((entry) => {
        if (!entry.hydroLog) return 0
        return entry.hydroLog.unit === "oz" ? entry.hydroLog.amount * 29.5735 : entry.hydroLog.amount
      }),
    )

    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (percentChange > 5) {
      hydroLogTrend = "up"
    } else if (percentChange < -5) {
      hydroLogTrend = "down"
    }
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
        </div>
      </div>

      <CollapsibleSection title="UroLog Stats" defaultExpanded={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BarChart className="mr-3 text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Flow Rate</p>
              <p className="text-xl font-bold">{averageFlowRate.toFixed(2)} mL/s</p>
              {recentUroLogs.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last 7 days: {recentAverageFlowRate.toFixed(2)} mL/s
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Droplet className="mr-3 text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Volume</p>
              <p className="text-xl font-bold">{averageVolume.toFixed(0)} mL</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Clock className="mr-3 text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Duration</p>
              <p className="text-xl font-bold">{averageDuration.toFixed(1)} sec</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Calendar className="mr-3 text-amber-500" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              <p className="text-xl font-bold">{filteredUroLogs.length}</p>
              {recentUroLogs.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days: {recentUroLogs.length}</p>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {(dataTypeFilter === "intake" || dataTypeFilter === "both") && filteredHydroLogs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">HydroLog Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <Coffee className="mr-3 text-cyan-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average HydroLog</p>
                <p className="text-xl font-bold">{averageHydroLog.toFixed(0)} mL</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({(averageHydroLog / 29.5735).toFixed(1)} oz)
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              {hydroLogTrend === "up" ? (
                <TrendingUp className="mr-3 text-green-500" size={24} />
              ) : hydroLogTrend === "down" ? (
                <TrendingDown className="mr-3 text-red-500" size={24} />
              ) : (
                <Coffee className="mr-3 text-indigo-500" size={24} />
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">HydroLog Trend</p>
                <p className="text-xl font-bold">
                  {hydroLogTrend === "up" ? "Increasing" : hydroLogTrend === "down" ? "Decreasing" : "Stable"}
                </p>
                {mostCommonFluidType && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Most common: {mostCommonFluidType}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(entriesWithColor.length > 0 || entriesWithUrgency.length > 0 || Object.keys(concernCounts).length > 0) && (
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

          {filteredHydroLogs.length > 0 && (
            <div>
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
        </div>
      )}
    </>
  )
}

export default FluidStats
