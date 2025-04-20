"use client"

import type React from "react"

import { useState } from "react"
import { Save, Upload, Check, AlertCircle } from "lucide-react"
import type { FlowEntry } from "../types"

interface BackupRestoreProps {
  entries: FlowEntry[]
  setEntries: (entries: FlowEntry[]) => void
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ entries, setEntries }) => {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const createBackup = () => {
    try {
      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        entries,
      }

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `flow-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup created successfully!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create backup. Please try again." })
    }
  }

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (!data.entries || !Array.isArray(data.entries)) {
          throw new Error("Invalid backup file format")
        }

        // Validate entries
        const validEntries = data.entries.filter((entry: any) => {
          return (
            typeof entry.timestamp === "string" &&
            typeof entry.volume === "number" &&
            typeof entry.duration === "number" &&
            typeof entry.flowRate === "number"
          )
        })

        if (validEntries.length === 0) {
          throw new Error("No valid entries found in backup")
        }

        if (confirm(`Restore ${validEntries.length} entries from backup? This will replace your current data.`)) {
          setEntries(validEntries)
          setMessage({ type: "success", text: `Successfully restored ${validEntries.length} entries!` })
          setTimeout(() => setMessage(null), 3000)
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to restore backup. Invalid file format." })
        setTimeout(() => setMessage(null), 3000)
      }
    }

    reader.readAsText(file)
    // Reset the input
    event.target.value = ""
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">Backup & Restore</h3>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <p>
          <strong>Backup (JSON):</strong> Creates a file with all your data that you can save to your device.
        </p>
        <p className="mt-1">
          <strong>Restore (JSON):</strong> Loads data from a previously created backup file.
        </p>
      </div>

      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-4">
          <button
            onClick={createBackup}
            className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center"
          >
            <Save className="mr-2" /> Backup to JSON
          </button>
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="w-full p-3 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center cursor-pointer">
            <Upload className="mr-2" /> Restore from JSON
            <input type="file" accept=".json" onChange={restoreBackup} className="hidden" />
          </label>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded flex items-center ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check size={18} className="mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}

export default BackupRestore
