"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import type { AppConfig } from "../types/config"
import type { UroLog, HydroLog, KegelLog } from "../types"
import { format, parseISO, subDays } from "date-fns"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface StatsProps {
  appConfig: AppConfig
}

const Stats: React.FC<StatsProps> = ({ appConfig }) => {
  // State for data
  const [uroLogs, setUroLogs] = useState<UroLog[]>([])
  const [hydroLogs, setHydroLogs] = useState<HydroLog[]>([])
  const [kegelLogs, setKegelLogs] = useState<KegelLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for filters
  const [dataTypeFilter, setDataTypeFilter] = useState("both")
  const [timeRangeFilter, setTimeRangeFilter] = useState("week")
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Import database functions
        const { getAllUroLogs, getAllHydroLogs, getAllKegelLogs } = await import("../services/db")

        // Fetch all logs
        const uroLogsData = await getAllUroLogs()
        const hydroLogsData = await getAllHydroLogs()
        const kegelLogsData = await getAllKegelLogs()

        // Sort logs by timestamp (newest first)
        const sortedUroLogs = uroLogsData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        const sortedHydroLogs = hydroLogsData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        const sortedKegelLogs = kegelLogsData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        setUroLogs(sortedUroLogs)
        setHydroLogs(sortedHydroLogs)
        setKegelLogs(sortedKegelLogs)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter logs based on time range
  const getFilteredLogs = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timeRangeFilter) {
      case "week":
        cutoffDate = subDays(now, 7)
        break
      case "month":
        cutoffDate = subDays(now, 30)
        break
      case "year":
        cutoffDate = subDays(now, 365)
        break
      default:
        cutoffDate = new Date(0) // All time
    }

    const cutoffTime = cutoffDate.getTime()

    const filteredUroLogs = uroLogs.filter((log) => new Date(log.timestamp).getTime() >= cutoffTime)
    const filteredHydroLogs = hydroLogs.filter((log) => new Date(log.timestamp).getTime() >= cutoffTime)
    const filteredKegelLogs = kegelLogs.filter((log) => new Date(log.timestamp).getTime() >= cutoffTime)

    return { filteredUroLogs, filteredHydroLogs, filteredKegelLogs }
  }

  // Calculate statistics
  const calculateStats = () => {
    const { filteredUroLogs, filteredHydroLogs, filteredKegelLogs } = getFilteredLogs()

    // UroLog stats
    const avgFlowRate =
      filteredUroLogs.length > 0
        ? filteredUroLogs.reduce((sum, log) => sum + log.flowRate, 0) / filteredUroLogs.length
        : 0

    const avgVolume =
      filteredUroLogs.length > 0
        ? filteredUroLogs.reduce((sum, log) => sum + log.volume, 0) / filteredUroLogs.length
        : 0

    const avgDuration =
      filteredUroLogs.length > 0
        ? filteredUroLogs.reduce((sum, log) => sum + log.duration, 0) / filteredUroLogs.length
        : 0

    // HydroLog stats
    const totalIntake = filteredHydroLogs.reduce((sum, log) => {
      // Convert oz to mL if needed
      const amount = log.unit === "oz" ? log.amount * 29.5735 : log.amount
      return sum + amount
    }, 0)

    const avgDailyIntake =
      timeRangeFilter === "all"
        ? totalIntake /
          (filteredHydroLogs.length > 0
            ? Math.ceil(
                (new Date().getTime() - new Date(filteredHydroLogs[filteredHydroLogs.length - 1].timestamp).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 1)
        : totalIntake / (timeRangeFilter === "week" ? 7 : timeRangeFilter === "month" ? 30 : 365)

    // KegelLog stats
    const totalKegelSets = filteredKegelLogs.reduce((sum, log) => sum + log.sets, 0)
    const totalKegelReps = filteredKegelLogs.reduce((sum, log) => sum + log.reps * log.sets, 0)
    const avgHoldTime =
      filteredKegelLogs.length > 0
        ? filteredKegelLogs.reduce((sum, log) => sum + log.holdTime, 0) / filteredKegelLogs.length
        : 0

    return {
      uroCount: filteredUroLogs.length,
      hydroCount: filteredHydroLogs.length,
      kegelCount: filteredKegelLogs.length,
      avgFlowRate,
      avgVolume,
      avgDuration,
      totalIntake,
      avgDailyIntake,
      totalKegelSets,
      totalKegelReps,
      avgHoldTime,
    }
  }

  // Prepare chart data for flow rate
  const prepareFlowRateChartData = () => {
    const { filteredUroLogs } = getFilteredLogs()

    // Get the last 10 entries or all if less than 10
    const displayLogs = filteredUroLogs.slice(0, 10).reverse()

    const labels = displayLogs.map((log) => format(parseISO(log.timestamp), "MM/dd HH:mm"))
    const flowRates = displayLogs.map((log) => log.flowRate)

    return {
      labels,
      datasets: [
        {
          label: "Flow Rate (mL/s)",
          data: flowRates,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    }
  }

  // Prepare chart data for volume
  const prepareVolumeChartData = () => {
    const { filteredUroLogs } = getFilteredLogs()

    // Get the last 10 entries or all if less than 10
    const displayLogs = filteredUroLogs.slice(0, 10).reverse()

    const labels = displayLogs.map((log) => format(parseISO(log.timestamp), "MM/dd HH:mm"))
    const volumes = displayLogs.map((log) => log.volume)

    return {
      labels,
      datasets: [
        {
          label: "Volume (mL)",
          data: volumes,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    }
  }

  // Prepare chart data for hydration
  const prepareHydrationChartData = () => {
    const { filteredHydroLogs } = getFilteredLogs()

    // Get the last 10 entries or all if less than 10
    const displayLogs = filteredHydroLogs.slice(0, 10).reverse()

    const labels = displayLogs.map((log) => format(parseISO(log.timestamp), "MM/dd HH:mm"))
    const amounts = displayLogs.map((log) => (log.unit === "oz" ? log.amount * 29.5735 : log.amount))

    return {
      labels,
      datasets: [
        {
          label: "Fluid Intake (mL)",
          data: amounts,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    }
  }

  // Prepare chart data for kegel exercises
  const prepareKegelChartData = () => {
    const { filteredKegelLogs } = getFilteredLogs()

    // Get the last 10 entries or all if less than 10
    const displayLogs = filteredKegelLogs.slice(0, 10).reverse()

    const labels = displayLogs.map((log) => format(parseISO(log.timestamp), "MM/dd HH:mm"))
    const totalReps = displayLogs.map((log) => log.reps * log.sets)

    return {
      labels,
      datasets: [
        {
          label: "Total Reps",
          data: totalReps,
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
        },
      ],
    }
  }

  // Prepare chart data for beverage types
  const prepareBeverageTypeChartData = () => {
    const { filteredHydroLogs } = getFilteredLogs()

    // Count beverages by type
    const beverageCounts: Record<string, number> = {}

    filteredHydroLogs.forEach((log) => {
      const type = log.type || "Unknown"
      beverageCounts[type] = (beverageCounts[type] || 0) + 1
    })

    const labels = Object.keys(beverageCounts)
    const data = Object.values(beverageCounts)

    return {
      labels,
      datasets: [
        {
          label: "Beverage Types",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)",
          ],
        },
      ],
    }
  }

  const stats = calculateStats()
  const hasUroData = uroLogs.length > 0
  const hasHydroData = hydroLogs.length > 0
  const hasKegelData = kegelLogs.length > 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!hasUroData && !hasHydroData && !hasKegelData) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg">
        <p>No data available. Start tracking to see your statistics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Type</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                dataTypeFilter === "both"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setDataTypeFilter("both")}
            >
              All
            </button>
            {hasUroData && (
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dataTypeFilter === "flow"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => setDataTypeFilter("flow")}
              >
                UroLog
              </button>
            )}
            {hasHydroData && (
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dataTypeFilter === "intake"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => setDataTypeFilter("intake")}
              >
                HydroLog
              </button>
            )}
            {hasKegelData && (
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dataTypeFilter === "kegel"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => setDataTypeFilter("kegel")}
              >
                KegelLog
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === "week"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTimeRangeFilter("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTimeRangeFilter("month")}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === "year"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTimeRangeFilter("year")}
            >
              Year
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRangeFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setTimeRangeFilter("all")}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          {hasUroData && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "flow"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("flow")}
            >
              Flow Analysis
            </button>
          )}

          {hasHydroData && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "hydration"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("hydration")}
            >
              Hydration
            </button>
          )}

          {hasKegelData && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "kegel"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("kegel")}
            >
              Kegel Exercises
            </button>
          )}

          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "trends"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("trends")}
          >
            Trends
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary Cards */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Summary</h3>
              <div className="space-y-2">
                {hasUroData && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    UroLog Entries: <span className="font-medium">{stats.uroCount}</span>
                  </p>
                )}
                {hasHydroData && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    HydroLog Entries: <span className="font-medium">{stats.hydroCount}</span>
                  </p>
                )}
                {hasKegelData && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    KegelLog Entries: <span className="font-medium">{stats.kegelCount}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Entries:{" "}
                  <span className="font-medium">{stats.uroCount + stats.hydroCount + stats.kegelCount}</span>
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Key Metrics</h3>
              <div className="space-y-2">
                {hasUroData && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Avg Flow Rate: <span className="font-medium">{stats.avgFlowRate.toFixed(2)} mL/s</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Avg Volume: <span className="font-medium">{stats.avgVolume.toFixed(0)} mL</span>
                    </p>
                  </>
                )}
                {hasHydroData && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Avg Daily Intake: <span className="font-medium">{stats.avgDailyIntake.toFixed(0)} mL</span>
                  </p>
                )}
                {hasKegelData && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Kegel Reps: <span className="font-medium">{stats.totalKegelReps}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="h-64">
                {hasUroData && (
                  <Line
                    data={prepareFlowRateChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Recent Flow Rate Trend",
                        },
                      },
                    }}
                  />
                )}
                {!hasUroData && hasHydroData && (
                  <Line
                    data={prepareHydrationChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Recent Hydration Trend",
                        },
                      },
                    }}
                  />
                )}
                {!hasUroData && !hasHydroData && hasKegelData && (
                  <Line
                    data={prepareKegelChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Recent Kegel Exercise Trend",
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Flow Analysis Tab */}
        {activeTab === "flow" && hasUroData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Flow Rate Analysis</h3>
              <div className="h-64">
                <Line
                  data={prepareFlowRateChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Volume Analysis</h3>
              <div className="h-64">
                <Line
                  data={prepareVolumeChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Flow Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Flow Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.avgFlowRate.toFixed(2)} mL/s
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Volume</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.avgVolume.toFixed(0)} mL
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Duration</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.avgDuration.toFixed(1)} s
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hydration Tab */}
        {activeTab === "hydration" && hasHydroData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Hydration Intake</h3>
              <div className="h-64">
                <Line
                  data={prepareHydrationChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Beverage Types</h3>
              <div className="h-64">
                <Bar
                  data={prepareBeverageTypeChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Hydration Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Fluid Intake</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalIntake.toFixed(0)} mL
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Daily Intake</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.avgDailyIntake.toFixed(0)} mL
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kegel Exercises Tab */}
        {activeTab === "kegel" && hasKegelData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Kegel Exercise Tracking</h3>
              <div className="h-64">
                <Line
                  data={prepareKegelChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Kegel Exercise Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Sets</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalKegelSets}</p>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Reps</p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalKegelReps}</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Hold Time</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.avgHoldTime.toFixed(1)} s
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Trends & Correlations</h3>
            {hasUroData || hasHydroData || hasKegelData ? (
              <div className="space-y-4">
                {hasUroData && hasHydroData && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Hydration vs Flow Rate</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track how your hydration levels affect your flow rate over time.
                    </p>
                  </div>
                )}

                {hasUroData && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Time of Day Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      See how your flow metrics vary throughout different times of the day.
                    </p>
                  </div>
                )}

                {hasKegelData && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Exercise Progress</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track your kegel exercise progress and improvements over time.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                More data is needed to generate meaningful trends. Continue tracking to see correlations.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stats
