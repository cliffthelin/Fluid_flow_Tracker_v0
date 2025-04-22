"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { hasAutoBackup, restoreFromAutoBackup } from "../services/autoBackup"
import { getDatabaseCounts } from "../services/db"

export function DataRecovery() {
  const [hasBackup, setHasBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbCounts, setDbCounts] = useState<{ uroLogs: number; hydroLogs: number }>({ uroLogs: 0, hydroLogs: 0 })

  useEffect(() => {
    // Check if auto-backup exists
    setHasBackup(hasAutoBackup())

    // Get current database counts
    fetchDbCounts()
  }, [])

  const fetchDbCounts = async () => {
    try {
      const counts = await getDatabaseCounts()
      setDbCounts(counts)
    } catch (error) {
      console.error("Error fetching database counts:", error)
    }
  }

  const handleRestore = async () => {
    if (
      !confirm(
        "Are you sure you want to restore data from the auto-backup? This will only work if your database is currently empty.",
      )
    ) {
      return
    }

    setIsRestoring(true)
    setResult(null)

    try {
      const success = await restoreFromAutoBackup()

      if (success) {
        setResult({
          success: true,
          message: "Successfully restored data from auto-backup!",
        })
      } else {
        setResult({
          success: false,
          message:
            "Could not restore from auto-backup. Either no backup exists or your database already contains data.",
        })
      }

      // Refresh database counts
      await fetchDbCounts()
    } catch (error) {
      setResult({
        success: false,
        message: `Error restoring from auto-backup: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Data Recovery</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              If you've lost your data due to a database issue, you may be able to recover it from an auto-backup. This
              will only work if your database is currently empty.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current database:{" "}
            <span className="font-medium">
              {dbCounts.uroLogs} UroLogs, {dbCounts.hydroLogs} HydroLogs
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Auto-backup available: <span className="font-medium">{hasBackup ? "Yes" : "No"}</span>
          </p>
        </div>

        <button
          onClick={handleRestore}
          disabled={!hasBackup || isRestoring || dbCounts.uroLogs > 0 || dbCounts.hydroLogs > 0}
          className={`px-4 py-2 rounded-lg flex items-center ${
            !hasBackup || (dbCounts.uroLogs > 0 || dbCounts.hydroLogs > 0)
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          {isRestoring ? (
            <RefreshCw size={18} className="mr-2 animate-spin" />
          ) : (
            <Database size={18} className="mr-2" />
          )}
          Restore from Auto-Backup
        </button>
      </div>

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
              <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            ) : (
              <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
            )}
            <div>
              <h3
                className={`font-medium ${
                  result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                }`}
              >
                {result.success ? "Recovery Successful" : "Recovery Failed"}
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
                  You may need to refresh the page to see the recovered data.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
