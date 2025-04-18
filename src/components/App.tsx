"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Droplet, Download, PlusCircle, Sun, Moon, Upload } from "lucide-react"
import MeasurementForm from "../components/MeasurementForm"
import ManualEntryForm from "../components/ManualEntryForm"
import LogTable from "../components/LogTable"
import StatsDisplay from "../components/StatsDisplay"
import useLocalStorage from "../hooks/useLocalStorage"
import useTheme from "../hooks/useTheme"
import type { LogEntry } from "../types/LogEntry"
import { exportToCsv, parseCsvToLogs } from "../utils/csvUtils"

function App() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>("urinationLogs", [])
  const [showManualForm, setShowManualForm] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [showAgePage, setShowAgePage] = useState(false) // State to control the visibility of the AgeFlowRatePage

  const handleSaveLog = useCallback(
    (newEntry: LogEntry) => {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, newEntry]
        return updatedLogs.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.timeOfDay}`)
          const dateB = new Date(`${b.date} ${b.timeOfDay}`)
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
          return dateB.getTime() - dateA.getTime()
        })
      })
      setShowManualForm(false)
    },
    [setLogs],
  )

  const handleDeleteLog = useCallback(
    (idToDelete: string) => {
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== idToDelete))
    },
    [setLogs],
  )

  const handleExport = useCallback(() => {
    exportToCsv(logs)
  }, [logs])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setImportError(null)
      const file = event.target.files?.[0]
      if (!file) return
      event.target.value = ""

      if (file.type !== "text/csv") {
        const errorMsg = "Invalid file type. Please select a CSV file."
        setImportError(errorMsg)
        alert(errorMsg)
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string
        if (!csvContent) {
          const errorMsg = "Could not read file content."
          setImportError(errorMsg)
          alert(errorMsg)
          return
        }
        try {
          const importedLogs = await parseCsvToLogs(csvContent)
          if (importedLogs.length > 0) {
            setLogs((prevLogs) => {
              const combinedLogs = [...prevLogs, ...importedLogs]
              return combinedLogs.sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.timeOfDay}`)
                const dateB = new Date(`${b.date} ${b.timeOfDay}`)
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
                return dateB.getTime() - dateA.getTime()
              })
            })
            alert(`Successfully imported ${importedLogs.length} log entries.`)
          } else {
            alert("No new log entries were found in the selected file.")
          }
        } catch (error) {
          console.error("Import failed:", error)
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during import."
          setImportError(errorMessage)
          alert(`Import failed: ${errorMessage}`)
        }
      }
      reader.onerror = () => {
        const errorMsg = "Failed to read the file."
        setImportError(errorMsg)
        alert(errorMsg)
      }
      reader.readAsText(file)
    },
    [setLogs],
  )

  const toggleManualForm = () => {
    setShowManualForm((prev) => !prev)
  }

  const handleCancelManualForm = () => {
    setShowManualForm(false)
  }

  const handleShowAgePage = () => {
    setShowAgePage(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <header className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-6 w-full max-w-4xl">
        <div className="flex items-center justify-center mb-4 sm:mb-0">
          <Droplet size={48} className="text-indigo-600 dark:text-indigo-400 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight text-center sm:text-left">
              Flow Tracker
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 text-center sm:text-left">
              Monitor Your Measurements
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150"
          aria-label={"Switch to " + (theme === "light" ? "dark" : "light") + " mode"}
        >
          {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <StatsDisplay logs={logs} />

      <main className="w-full max-w-4xl space-y-8">
        <MeasurementForm onSave={handleSaveLog} />

        {!showManualForm ? (
          <button
            onClick={toggleManualForm}
            className="flex items-center justify-center px-5 py-2.5 bg-purple-600 dark:bg-purple-700 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
            aria-controls="manual-entry-form"
            aria-expanded={showManualForm}
          >
            <PlusCircle size={20} className="mr-2" />
            Add Manual Entry
          </button>
        ) : (
          <ManualEntryForm onSave={handleSaveLog} onCancel={handleCancelManualForm} id="manual-entry-form" />
        )}

        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".csv"
              style={{ display: "none" }}
              aria-hidden="true"
            />
            <button
              onClick={triggerFileInput}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-green-500 dark:bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
              aria-label="Import logs from CSV"
            >
              <Upload size={20} className="mr-2" /> Import CSV
            </button>
            {logs.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-blue-500 dark:bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                  aria-label="Export logs to CSV"
                >
                  <Download size={20} className="mr-2" /> Export CSV
                </button>
              </>
            )}
          </div>
          {importError && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4 text-center bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">
              {importError}
            </p>
          )}
          <LogTable logs={logs} onDelete={handleDeleteLog} />
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Flow Tracker. Track responsibly.</p>
      </footer>
    </div>
  )
}

export default App
