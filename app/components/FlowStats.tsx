"use client"

import type React from "react"
import { BarChart, Calendar, Clock, Droplet, AlertTriangle, Coffee, TrendingUp, TrendingDown } from "lucide-react"
import type { FlowEntry } from "../types"
import CollapsibleSection from "./CollapsibleSection"

interface FlowStatsProps {
  entries: FlowEntry[]
}

const FlowStats: React.FC<FlowStatsProps> = ({ entries }) => {
  const calculateAverage = (values: number[]) => {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  const averageFlowRate = calculateAverage(entries.map((entry) => entry.flowRate))
  const averageVolume = calculateAverage(entries.map((entry) => entry.volume))
  const averageDuration = calculateAverage(entries.map((entry) => entry.duration))

  // Get recent entries (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentEntries = entries.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
  const recentAverageFlowRate = calculateAverage(recentEntries.map((entry) => entry.flowRate))

  // Get color distribution
  const entriesWithColor = entries.filter((entry) => entry.color)
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
  const entriesWithUrgency = entries.filter((entry) => entry.urgency)
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
  entries.forEach((entry) => {
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
  const entriesWithFluidIntake = entries.filter((entry) => entry.fluidIntake)

  // Calculate average fluid intake
  const fluidIntakeAmounts = entriesWithFluidIntake.map((entry) => {
    const { fluidIntake } = entry
    if (!fluidIntake) return 0

    // Convert all to mL for consistency
    return fluidIntake.unit === "oz" ? fluidIntake.amount * 29.5735 : fluidIntake.amount
  })

  const averageFluidIntake = calculateAverage(fluidIntakeAmounts)

  // Get fluid type distribution
  const fluidTypeCounts: Record<string, number> = {}
  entriesWithFluidIntake.forEach((entry) => {
    if (entry.fluidIntake?.type) {
      const type =
        entry.fluidIntake.type === "Other" && entry.fluidIntake.customType
          ? entry.fluidIntake.customType
          : entry.fluidIntake.type

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
  if (entriesWithFluidIntake.length >= 4) {
    const sortedEntries = [...entriesWithFluidIntake].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const halfLength = Math.floor(sortedEntries.length / 2)
    const firstHalf = sortedEntries.slice(0, halfLength)
    const secondHalf = sortedEntries.slice(halfLength)

    const firstHalfAvg = calculateAverage(
      firstHalf.map((entry) => {
        if (!entry.fluidIntake) return 0
        return entry.fluidIntake.unit === "oz" ? entry.fluidIntake.amount * 29.5735 : entry.fluidIntake.amount
      }),
    )

    const secondHalfAvg = calculateAverage(
      secondHalf.map((entry) => {
        if (!entry.fluidIntake) return 0
        return entry.fluidIntake.unit === "oz" ? entry.fluidIntake.amount * 29.5735 : entry.fluidIntake.amount
      }),
    )

    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

    if (percentChange > 5) {
      fluidIntakeTrend = "up"
    } else if (percentChange < -5) {
      fluidIntakeTrend = "down"
    }
  }

  return (
    <CollapsibleSection title="Flow Stats" defaultExpanded={true}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <BarChart className="mr-3 text-blue-500" size={24} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Flow Rate</p>
            <p className="text-xl font-bold">{averageFlowRate.toFixed(2)} mL/s</p>
            {recentEntries.length > 0 && (
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
            <p className="text-xl font-bold">{entries.length}</p>
            {recentEntries.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days: {recentEntries.length}</p>
            )}
          </div>
        </div>
      </div>

      {entriesWithFluidIntake.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Fluid Intake Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <Coffee className="mr-3 text-cyan-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Fluid Intake</p>
                <p className="text-xl font-bold">{averageFluidIntake.toFixed(0)} mL</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Fluid Intake Trend</p>
                <p className="text-xl font-bold">
                  {fluidIntakeTrend === "up" ? "Increasing" : fluidIntakeTrend === "down" ? "Decreasing" : "Stable"}
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

          {entriesWithFluidIntake.length > 0 && (
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
    </CollapsibleSection>
  )
}

export default FlowStats
