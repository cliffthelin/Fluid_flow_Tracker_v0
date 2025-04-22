"use client"

import { useState, useEffect } from "react"
import { Download, Trash2, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"

export interface LogEntry {
  id: string
  timestamp: string
  type: "info" | "success" | "error" | "warning"
  source: string
  message: string
  details?: string
}

export function useApplicationLog() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  // Load log entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("applicationLogEntries")
    if (savedEntries) {
      try {
        setLogEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error("Error parsing application log entries:", error)
      }
    }
  }, [])

  // Add a new log entry
  const addLogEntry = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }

    setLogEntries((prevEntries) => {
      const updatedEntries = [...prevEntries, newEntry]
      // Save to localStorage
      localStorage.setItem("applicationLogEntries", JSON.stringify(updatedEntries))
      return updatedEntries
    })

    return newEntry
  }

  // Clear all log entries
  const clearLogEntries = () => {
    setLogEntries([])
    localStorage.removeItem("applicationLogEntries")
  }

  return {
    logEntries,
    addLogEntry,
    clearLogEntries,
  }
}

export function ApplicationLog() {
  const { logEntries, clearLogEntries } = useApplicationLog()
  const [filter, setFilter] = useState<"all" | "info" | "success" | "error" | "warning">("all")

  // Download log as JSON
  const downloadLog = () => {
    const data = JSON.stringify(logEntries, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    // Format date for filename
    const now = new Date()
    const dateStr = now.toISOString().replace(/[T:]/g, "-").split(".")[0]

    link.href = url
    link.download = `flow-tracker-application-log-${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter entries based on selected type
  const filteredEntries = filter === "all" ? logEntries : logEntries.filter((entry) => entry.type === filter)

  return (
    <CollapsibleSection
      title="Application Log"
      defaultExpanded={false}
      className="mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "all"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("info")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "info"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setFilter("success")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "warning"
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setFilter("error")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "error"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              Error
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadLog}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={logEntries.length === 0}
            >
              <Download size={14} className="mr-1" />
              Export Log
            </button>
            <button
              onClick={clearLogEntries}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              disabled={logEntries.length === 0}
            >
              <Trash2 size={14} className="mr-1" />
              Clear Log
            </button>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            {logEntries.length === 0
              ? "No log entries yet. Run validation tests to populate the log."
              : "No entries match the selected filter."}
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border ${
                  entry.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
                    : entry.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
                      : entry.type === "warning"
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30"
                }`}
              >
                <div className="flex items-start">
                  {entry.type === "success" ? (
                    <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  ) : entry.type === "error" ? (
                    <XCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  ) : entry.type === "warning" ? (
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  ) : (
                    <Clock className="text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{entry.source}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{entry.message}</p>
                    {entry.details && (
                      <pre className="mt-2 text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                        {entry.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
