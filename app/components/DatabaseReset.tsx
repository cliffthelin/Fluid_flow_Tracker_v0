"use client"

import { useState } from "react"
import { AlertTriangle, Database, RefreshCw, Trash2, Info } from "lucide-react"
import { resetDatabase, getDatabaseInfo } from "../services/db"

export function DatabaseReset() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetType, setResetType] = useState<"clear" | "delete" | null>(null)
  const [progressMessages, setProgressMessages] = useState<string[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbInfo, setDbInfo] = useState<{
    version: number
    isOpen: boolean
    tableNames: string[]
    entryCounts: Record<string, number>
  } | null>(null)
  const [showDbInfo, setShowDbInfo] = useState(false)

  const handleReset = async (type: "clear" | "delete") => {
    // Double confirmation for database deletion
    if (type === "delete") {
      const confirmMessage =
        "⚠️ WARNING: This will PERMANENTLY DELETE your entire database and create a new one.\n\n" +
        "All your data will be lost and cannot be recovered unless you have a backup.\n\n" +
        "Type 'DELETE' (all caps) to confirm:"

      const confirmation = prompt(confirmMessage)
      if (confirmation !== "DELETE") {
        alert("Database deletion cancelled.")
        return
      }
    } else {
      // Confirmation for clearing data
      const confirmMessage =
        "Are you sure you want to clear all data from the database?\n\n" +
        "This will remove all your entries but keep the database structure intact.\n\n" +
        "This action cannot be undone unless you have a backup."

      if (!confirm(confirmMessage)) {
        return
      }
    }

    setIsResetting(true)
    setResetType(type)
    setProgressMessages([])
    setResult(null)

    try {
      // Progress callback to show messages
      const onProgress = (message: string) => {
        setProgressMessages((prev) => [...prev, message])
      }

      // Perform the reset
      const result = await resetDatabase({
        clearData: type === "clear" || type === "delete",
        deleteDatabase: type === "delete",
        onProgress,
      })

      setResult(result)

      // Refresh database info after reset
      if (result.success) {
        const info = await getDatabaseInfo()
        setDbInfo(info)
        setShowDbInfo(true)
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error during reset: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsResetting(false)
    }
  }

  const fetchDatabaseInfo = async () => {
    try {
      const info = await getDatabaseInfo()
      setDbInfo(info)
      setShowDbInfo(true)
    } catch (error) {
      console.error("Error fetching database info:", error)
      alert(`Failed to fetch database info: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Database Reset Tools</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              These tools should only be used when troubleshooting database issues. Make sure to backup your data before
              proceeding.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => fetchDatabaseInfo()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Info size={18} className="mr-2" />
          Database Info
        </button>

        <button
          onClick={() => handleReset("clear")}
          disabled={isResetting}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={`mr-2 ${isResetting && resetType === "clear" ? "animate-spin" : ""}`} />
          Clear All Data
        </button>

        <button
          onClick={() => handleReset("delete")}
          disabled={isResetting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} className="mr-2" />
          Delete & Recreate Database
        </button>
      </div>

      {showDbInfo && dbInfo && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium flex items-center mb-2">
            <Database size={18} className="mr-2 text-blue-500" />
            Database Information
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Version:</span> {dbInfo.version}
            </p>
            <p>
              <span className="font-medium">Status:</span> {dbInfo.isOpen ? "Open" : "Closed"}
            </p>
            <p>
              <span className="font-medium">Tables:</span> {dbInfo.tableNames.join(", ")}
            </p>
            <div>
              <p className="font-medium mb-1">Entry Counts:</p>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(dbInfo.entryCounts).map(([table, count]) => (
                  <li key={table}>
                    {table}: {count} entries
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isResetting && progressMessages.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium mb-2">Reset Progress</h3>
          <div className="space-y-1 text-sm">
            {progressMessages.map((message, index) => (
              <p key={index} className="font-mono">
                {message}
              </p>
            ))}
            {isResetting && <p className="font-mono animate-pulse">Working...</p>}
          </div>
        </div>
      )}

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-start">
            {result.success ? (
              <RefreshCw className="text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            ) : (
              <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            )}
            <div>
              <h3
                className={`font-medium ${
                  result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                }`}
              >
                {result.success ? "Reset Successful" : "Reset Failed"}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  result.success ? "text-green-700 dark:text-green-200" : "text-red-700 dark:text-red-200"
                }`}
              >
                {result.message}
              </p>
              {result.success && (
                <p className="mt-2 text-sm text-green-700 dark:text-green-200">
                  You may need to refresh the page for changes to take effect.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
