"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"

export function ManualBuilder() {
  const [status, setStatus] = useState<"idle" | "building" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const rebuildManual = async () => {
    setStatus("building")
    setMessage("Rebuilding manual...")

    try {
      // In a real implementation, this would call an API endpoint
      // that would regenerate the Manual.md file based on the current
      // state of the application. For this demo, we'll simulate the process.
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success
      setStatus("success")
      setMessage("Manual successfully rebuilt! Refresh the page to see the updated manual.")
    } catch (error) {
      console.error("Failed to rebuild manual:", error)
      setStatus("error")
      setMessage("Failed to rebuild manual. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={rebuildManual}
        disabled={status === "building"}
        className="flex items-center px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "building" ? (
          <RefreshCw size={16} className="mr-2 animate-spin" />
        ) : (
          <RefreshCw size={16} className="mr-2" />
        )}
        Rebuild Manual
      </button>

      {status !== "idle" && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-start ${
            status === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : status === "error"
                ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
          }`}
        >
          {status === "success" ? (
            <Check className="mr-2 flex-shrink-0 mt-0.5" size={16} />
          ) : status === "error" ? (
            <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
          ) : (
            <RefreshCw className="mr-2 flex-shrink-0 mt-0.5 animate-spin" size={16} />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  )
}
