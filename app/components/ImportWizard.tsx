"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Check, FileText, Upload, X, RefreshCw, ArrowRight, Filter, Info } from "lucide-react"
import type { UroLog, HydroLog, KegelLog } from "../types"
import {
  bulkAddUroLogs,
  bulkAddHydroLogs,
  bulkAddKegelLogs,
  getAllUroLogs,
  getAllHydroLogs,
  getAllKegelLogs,
} from "../services/db"
import { applyBusinessRulesToBatch } from "../services/importRules"
import BusinessRulesManager from "./BusinessRulesManager"

type ImportStep = "upload" | "preview" | "configure" | "rules" | "importing" | "complete" | "error"

interface ParsedData {
  uroLogs: UroLog[]
  hydroLogs: HydroLog[]
  kegelLogs: KegelLog[]
}

interface ConflictResolutionStrategy {
  strategy: "skip" | "overwrite" | "keepBoth"
  applyToAll: boolean
}

interface ImportWizardProps {
  onComplete: () => void
  onCancel: () => void
}

export default function ImportWizard({ onComplete, onCancel }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData>({ uroLogs: [], hydroLogs: [], kegelLogs: [] })
  const [filteredData, setFilteredData] = useState<ParsedData>({ uroLogs: [], hydroLogs: [], kegelLogs: [] })
  const [existingData, setExistingData] = useState<ParsedData>({ uroLogs: [], hydroLogs: [], kegelLogs: [] })
  const [conflicts, setConflicts] = useState<{ uroLogs: string[]; hydroLogs: string[]; kegelLogs: string[] }>({
    uroLogs: [],
    hydroLogs: [],
    kegelLogs: [],
  })
  const [selectedTypes, setSelectedTypes] = useState<{ uroLogs: boolean; hydroLogs: boolean; kegelLogs: boolean }>({
    uroLogs: true,
    hydroLogs: true,
    kegelLogs: true,
  })
  const [conflictResolution, setConflictResolution] = useState<ConflictResolutionStrategy>({
    strategy: "skip",
    applyToAll: false,
  })
  const [progress, setProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [importStats, setImportStats] = useState<{
    added: number
    skipped: number
    overwritten: number
    rejected: number
    modified: number
  }>({
    added: 0,
    skipped: 0,
    overwritten: 0,
    rejected: 0,
    modified: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New state to store the first skipped or rejected record and its reason
  const [firstSkippedRejected, setFirstSkippedRejected] = useState<{
    type: "uroLog" | "hydroLog" | "kegelLog"
    entry: UroLog | HydroLog | KegelLog
    reason: string
  } | null>(null)

  // Fetch existing data to check for conflicts
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const uroLogs = await getAllUroLogs()
        const hydroLogs = await getAllHydroLogs()
        const kegelLogs = await getAllKegelLogs()

        setExistingData({
          uroLogs,
          hydroLogs,
          kegelLogs,
        })
      } catch (error) {
        console.error("Error fetching existing data:", error)
        setError("Failed to fetch existing data. Please try again.")
        setCurrentStep("error")
      }
    }

    if (currentStep === "preview" || currentStep === "rules") {
      fetchExistingData()
    }
  }, [currentStep])

  // Apply business rules when moving to the rules step
  useEffect(() => {
    const applyRules = async () => {
      if (currentStep === "rules" && parsedData && existingData) {
        setIsLoading(true)
        try {
          // Apply business rules to each type of log
          const uroResults = await applyBusinessRulesToBatch(parsedData.uroLogs, "UroLog", existingData.uroLogs)

          const hydroResults = await applyBusinessRulesToBatch(parsedData.hydroLogs, "HydroLog", existingData.hydroLogs)

          const kegelResults = await applyBusinessRulesToBatch(parsedData.kegelLogs, "KegelLog", existingData.kegelLogs)

          // Update filtered data
          setFilteredData({
            uroLogs: [...uroResults.accepted, ...uroResults.modified],
            hydroLogs: [...hydroResults.accepted, ...hydroResults.modified],
            kegelLogs: [...kegelResults.accepted, ...kegelResults.modified],
          })

          // Combine rejection reasons
          setRejectionReasons({
            ...uroResults.rejectionReasons,
            ...hydroResults.rejectionReasons,
            ...kegelResults.rejectionReasons,
          })

          // Update stats for display
          const rejectedCount = uroResults.rejected.length + hydroResults.rejected.length + kegelResults.rejected.length

          const modifiedCount = uroResults.modified.length + hydroResults.modified.length + kegelResults.modified.length

          setImportStats((prev) => ({
            ...prev,
            rejected: rejectedCount,
            modified: modifiedCount,
          }))
        } catch (error) {
          console.error("Error applying business rules:", error)
          setError(`Failed to apply business rules: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
          setIsLoading(false)
        }
      }
    }

    applyRules()
  }, [currentStep, parsedData, existingData])

  // Check for conflicts when we have both parsed and existing data
  useEffect(() => {
    if ((currentStep === "preview" || currentStep === "rules") && filteredData && existingData) {
      const uroLogConflicts = filteredData.uroLogs
        .filter((log) => existingData.uroLogs.some((existing) => existing.timestamp === log.timestamp))
        .map((log) => log.timestamp)

      const hydroLogConflicts = filteredData.hydroLogs
        .filter((log) => existingData.hydroLogs.some((existing) => existing.timestamp === log.timestamp))
        .map((log) => log.timestamp)

      const kegelLogConflicts = filteredData.kegelLogs
        .filter((log) => existingData.kegelLogs.some((existing) => existing.timestamp === log.timestamp))
        .map((log) => log.timestamp)

      setConflicts({
        uroLogs: uroLogConflicts,
        hydroLogs: hydroLogConflicts,
        kegelLogs: kegelLogConflicts,
      })
    }
  }, [filteredData, existingData, currentStep])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const parseCSV = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)
    setFirstSkippedRejected(null) // Reset the first skipped/rejected record

    try {
      const content = await readFileAsText(file)
      const lines = content.split("\n")

      // Skip header row
      const dataRows = lines.slice(1).filter((line) => line.trim() !== "")

      const uroLogs: UroLog[] = []
      const hydroLogs: HydroLog[] = []
      const kegelLogs: KegelLog[] = []

      // Process each row
      for (const row of dataRows) {
        try {
          const columns = parseCSVRow(row)

          // Basic validation
          if (columns.length < 4) continue

          const dateStr = columns[0]
          const timeStr = columns[1]
          const type = columns[2]
          const date = new Date(`${dateStr} ${timeStr}`)
          const timestamp = date.toISOString()

          if (type === "UroLog") {
            const volume = Number.parseFloat(columns[3])
            const duration = Number.parseFloat(columns[4])
            const flowRate = Number.parseFloat(columns[5])
            const color = columns[6].replace(/"/g, "")
            const urgency = columns[7].replace(/"/g, "")
            const concerns = columns[8]
              .replace(/"/g, "")
              .split(", ")
              .filter((c) => c)
            const notes = columns[9].replace(/"/g, "")
            const guid = columns.length > 10 ? columns[10].replace(/"/g, "") : undefined

            uroLogs.push({
              timestamp,
              volume,
              duration,
              flowRate,
              color: color || undefined,
              urgency: urgency || undefined,
              concerns: concerns.length > 0 ? concerns : undefined,
              notes: notes || undefined,
              guid: guid || undefined,
            })
          } else if (type === "HydroLog") {
            // Parse the notes field to extract type, amount, and unit
            const notesField = columns[9].replace(/"/g, "")
            const typeMatch = notesField.match(/^(.+?)(?:\s+$(.+?)$)?\s+-\s+(\d+\.?\d*)\s+(mL|oz)/)
            const guid = columns.length > 10 ? columns[10].replace(/"/g, "") : undefined

            if (typeMatch) {
              const fluidType = typeMatch[1].trim()
              const customType = typeMatch[2] ? typeMatch[2].trim() : undefined
              const amount = Number.parseFloat(typeMatch[3])
              const unit = typeMatch[4] as "mL" | "oz"
              const notes = notesField.split(" - ").slice(2).join(" - ").trim()

              hydroLogs.push({
                timestamp,
                type: fluidType as any,
                customType,
                amount,
                unit,
                notes: notes || undefined,
                guid: guid || undefined,
              })
            }
          } else if (type === "KegelLog") {
            // Parse the notes field to extract reps, hold time, sets, and completed
            const notesField = columns[9].replace(/"/g, "")
            const kegelMatch = notesField.match(
              /Reps:\s+(\d+),\s+Hold:\s+(\d+)s,\s+Sets:\s+(\d+),\s+Completed:\s+(Yes|No)/,
            )
            const guid = columns.length > 10 ? columns[10].replace(/"/g, "") : undefined

            if (kegelMatch) {
              const reps = Number.parseInt(kegelMatch[1])
              const holdTime = Number.parseInt(kegelMatch[2])
              const sets = Number.parseInt(kegelMatch[3])
              const completed = kegelMatch[4] === "Yes"
              const totalTime = Number.parseInt(columns[4])
              const notes = notesField.split(" - ").slice(1).join(" - ").trim()

              kegelLogs.push({
                timestamp,
                reps,
                holdTime,
                sets,
                totalTime,
                completed,
                notes: notes || undefined,
                guid: guid || undefined,
              })
            }
          }
        } catch (err) {
          console.error("Error parsing row:", row, err)
          // Continue with next row
        }
      }

      setParsedData({
        uroLogs,
        hydroLogs,
        kegelLogs,
      })

      // Initialize filtered data with parsed data
      setFilteredData({
        uroLogs,
        hydroLogs,
        kegelLogs,
      })

      setCurrentStep("preview")
    } catch (error) {
      console.error("Error parsing CSV:", error)
      setError(`Failed to parse CSV file: ${error instanceof Error ? error.message : String(error)}`)
      setCurrentStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error("Failed to read file"))
        }
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.readAsText(file)
    })
  }

  // Helper function to parse CSV row properly handling quoted fields
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < row.length; i++) {
      const char = row[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    // Add the last field
    result.push(current)

    return result
  }

  const handleImport = async () => {
    setCurrentStep("importing")
    setProgress({
      current: 0,
      total:
        (selectedTypes.uroLogs ? filteredData.uroLogs.length : 0) +
        (selectedTypes.hydroLogs ? filteredData.hydroLogs.length : 0) +
        (selectedTypes.kegelLogs ? filteredData.kegelLogs.length : 0),
      message: "Starting import...",
    })

    const stats = {
      added: 0,
      skipped: 0,
      overwritten: 0,
      rejected: importStats.rejected,
      modified: importStats.modified,
    }

    let firstSkippedRejectedEntry: {
      type: "uroLog" | "hydroLog" | "kegelLog"
      entry: UroLog | HydroLog | KegelLog
      reason: string
    } | null = null

    try {
      // Import UroLogs
      if (selectedTypes.uroLogs && filteredData.uroLogs.length > 0) {
        setProgress((prev) => ({
          ...prev,
          message: `Importing UroLogs (${filteredData.uroLogs.length} entries)...`,
        }))

        const {
          toImport,
          toSkip,
          rejectionReasons: uroRejectionReasons,
        } = processImportItems(filteredData.uroLogs, conflicts.uroLogs, conflictResolution)

        if (toImport.length > 0) {
          await bulkAddUroLogs(toImport as UroLog[])
          stats.added += toImport.length

          if (conflictResolution.strategy === "overwrite") {
            stats.overwritten += toImport.filter((log) => conflicts.uroLogs.includes((log as UroLog).timestamp)).length
          }
        }

        stats.skipped += toSkip.length

        // Check for the first skipped/rejected entry
        if (toSkip.length > 0 && !firstSkippedRejectedEntry) {
          const firstSkipped = toSkip[0] as UroLog
          firstSkippedRejectedEntry = {
            type: "uroLog",
            entry: firstSkipped,
            reason: uroRejectionReasons[firstSkipped.timestamp] || "Skipped due to conflict",
          }
        }

        setProgress((prev) => ({
          ...prev,
          current: prev.current + filteredData.uroLogs.length,
        }))
      }

      // Import HydroLogs
      if (selectedTypes.hydroLogs && filteredData.hydroLogs.length > 0) {
        setProgress((prev) => ({
          ...prev,
          message: `Importing HydroLogs (${filteredData.hydroLogs.length} entries)...`,
        }))

        const {
          toImport,
          toSkip,
          rejectionReasons: hydroRejectionReasons,
        } = processImportItems(filteredData.hydroLogs, conflicts.hydroLogs, conflictResolution)

        if (toImport.length > 0) {
          await bulkAddHydroLogs(toImport as HydroLog[])
          stats.added += toImport.length

          if (conflictResolution.strategy === "overwrite") {
            stats.overwritten += toImport.filter((log) =>
              conflicts.hydroLogs.includes((log as HydroLog).timestamp),
            ).length
          }
        }

        stats.skipped += toSkip.length

        // Check for the first skipped/rejected entry
        if (toSkip.length > 0 && !firstSkippedRejectedEntry) {
          const firstSkipped = toSkip[0] as HydroLog
          firstSkippedRejectedEntry = {
            type: "hydroLog",
            entry: firstSkipped,
            reason: hydroRejectionReasons[firstSkipped.timestamp] || "Skipped due to conflict",
          }
        }

        setProgress((prev) => ({
          ...prev,
          current: prev.current + filteredData.hydroLogs.length,
        }))
      }

      // Import KegelLogs
      if (selectedTypes.kegelLogs && filteredData.kegelLogs.length > 0) {
        setProgress((prev) => ({
          ...prev,
          message: `Importing KegelLogs (${filteredData.kegelLogs.length} entries)...`,
        }))

        const {
          toImport,
          toSkip,
          rejectionReasons: kegelRejectionReasons,
        } = processImportItems(filteredData.kegelLogs, conflicts.kegelLogs, conflictResolution)

        if (toImport.length > 0) {
          await bulkAddKegelLogs(toImport as KegelLog[])
          stats.added += toImport.length

          if (conflictResolution.strategy === "overwrite") {
            stats.overwritten += toImport.filter((log) =>
              conflicts.kegelLogs.includes((log as KegelLog).timestamp),
            ).length
          }
        }

        stats.skipped += toSkip.length

        // Check for the first skipped/rejected entry
        if (toSkip.length > 0 && !firstSkippedRejectedEntry) {
          const firstSkipped = toSkip[0] as KegelLog
          firstSkippedRejectedEntry = {
            type: "kegelLog",
            entry: firstSkipped,
            reason: kegelRejectionReasons[firstSkipped.timestamp] || "Skipped due to conflict",
          }
        }

        setProgress((prev) => ({
          ...prev,
          current: prev.current + filteredData.kegelLogs.length,
        }))
      }

      setImportStats(stats)
      setFirstSkippedRejected(firstSkippedRejectedEntry) // Set the first skipped/rejected entry
      setCurrentStep("complete")
    } catch (error) {
      console.error("Error during import:", error)
      setError(`Import failed: ${error instanceof Error ? error.message : String(error)}`)
      setCurrentStep("error")
    }
  }

  // Helper function to process items based on conflict resolution strategy
  const processImportItems = (items: any[], conflictTimestamps: string[], resolution: ConflictResolutionStrategy) => {
    const toImport: any[] = []
    const toSkip: any[] = []
    const rejectionReasons: Record<string, string> = {}

    items.forEach((item) => {
      const hasConflict = conflictTimestamps.includes(item.timestamp)

      if (!hasConflict) {
        // No conflict, always import
        toImport.push(item)
      } else {
        // Handle conflict based on strategy
        if (resolution.strategy === "skip") {
          toSkip.push(item)
          rejectionReasons[item.timestamp] = "Skipped due to conflict"
        } else if (resolution.strategy === "overwrite") {
          toImport.push(item)
        } else if (resolution.strategy === "keepBoth") {
          // Modify timestamp slightly to make it unique
          const newItem = { ...item }
          const date = new Date(item.timestamp)
          date.setMilliseconds(date.getMilliseconds() + 1)
          newItem.timestamp = date.toISOString()
          toImport.push(newItem)
        }
      }
    })

    return { toImport, toSkip, rejectionReasons }
  }

  const handleRulesUpdated = () => {
    // Re-apply rules to the parsed data
    if (currentStep === "rules") {
      // Reset filtered data to trigger re-application of rules
      setFilteredData({ uroLogs: [], hydroLogs: [], kegelLogs: [] })

      // Force re-application of rules by toggling the step
      setCurrentStep("preview")
      setTimeout(() => setCurrentStep("rules"), 10)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Import Instructions</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Select a CSV file to import. The file should be in the format exported by Flow Tracker. You'll be able
                to preview and configure the import before any data is added.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Drag and drop your CSV file here, or click to select
              </p>
              <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Select File
              </button>
            </div>

            {file && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={parseCSV}
                disabled={!file || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Next
                  </>
                )}
              </button>
            </div>
          </div>
        )

      case "preview":
        const totalEntries = parsedData.uroLogs.length + parsedData.hydroLogs.length + parsedData.kegelLogs.length
        const totalConflicts = conflicts.uroLogs.length + conflicts.hydroLogs.length + conflicts.kegelLogs.length

        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Import Preview</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">UroLogs</h4>
                  <p className="text-2xl font-bold">{parsedData.uroLogs.length}</p>
                  {conflicts.uroLogs.length > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      {conflicts.uroLogs.length} conflicts
                    </p>
                  )}
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200">HydroLogs</h4>
                  <p className="text-2xl font-bold">{parsedData.hydroLogs.length}</p>
                  {conflicts.hydroLogs.length > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      {conflicts.hydroLogs.length} conflicts
                    </p>
                  )}
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">KegelLogs</h4>
                  <p className="text-2xl font-bold">{parsedData.kegelLogs.length}</p>
                  {conflicts.kegelLogs.length > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      {conflicts.kegelLogs.length} conflicts
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <Filter className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Business Rules Available</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      You can apply business rules to filter and transform your data before import. This helps ensure
                      data quality and consistency.
                    </p>
                    <button
                      onClick={() => setCurrentStep("rules")}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Configure Business Rules
                    </button>
                  </div>
                </div>
              </div>

              {totalConflicts > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        {totalConflicts} conflicts detected
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Some entries in the import file have the same timestamps as existing entries. You'll need to
                        choose how to handle these conflicts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Select data types to import:</h4>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.uroLogs}
                      onChange={() =>
                        setSelectedTypes((prev) => ({
                          ...prev,
                          uroLogs: !prev.uroLogs,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>UroLogs ({parsedData.uroLogs.length} entries)</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.hydroLogs}
                      onChange={() =>
                        setSelectedTypes((prev) => ({
                          ...prev,
                          hydroLogs: !prev.hydroLogs,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>HydroLogs ({parsedData.hydroLogs.length} entries)</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.kegelLogs}
                      onChange={() =>
                        setSelectedTypes((prev) => ({
                          ...prev,
                          kegelLogs: !prev.kegelLogs,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>KegelLogs ({parsedData.kegelLogs.length} entries)</span>
                  </label>
                </div>
              </div>

              {totalConflicts > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">How would you like to handle conflicts?</h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="conflictStrategy"
                        value="skip"
                        checked={conflictResolution.strategy === "skip"}
                        onChange={() =>
                          setConflictResolution((prev) => ({
                            ...prev,
                            strategy: "skip",
                          }))
                        }
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Skip conflicting entries (keep existing data)</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="conflictStrategy"
                        value="overwrite"
                        checked={conflictResolution.strategy === "overwrite"}
                        onChange={() =>
                          setConflictResolution((prev) => ({
                            ...prev,
                            strategy: "overwrite",
                          }))
                        }
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Overwrite existing entries with imported data</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="conflictStrategy"
                        value="keepBoth"
                        checked={conflictResolution.strategy === "keepBoth"}
                        onChange={() =>
                          setConflictResolution((prev) => ({
                            ...prev,
                            strategy: "keepBoth",
                          }))
                        }
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Keep both (slightly adjust timestamps of imported entries)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCurrentStep("upload")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-
600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedTypes.uroLogs && !selectedTypes.hydroLogs && !selectedTypes.kegelLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Import
              </button>
            </div>
          </div>
        )

      case "rules":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Configure Business Rules</h3>

              <div className="mb-6">
                <BusinessRulesManager onRulesUpdated={handleRulesUpdated} />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2">Applying rules to data...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">UroLogs</h4>
                      <div className="flex justify-between items-baseline">
                        <p className="text-2xl font-bold">{filteredData.uroLogs.length}</p>
                        <p className="text-sm text-gray-500">of {parsedData.uroLogs.length}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200">HydroLogs</h4>
                      <div className="flex justify-between items-baseline">
                        <p className="text-2xl font-bold">{filteredData.hydroLogs.length}</p>
                        <p className="text-sm text-gray-500">of {parsedData.hydroLogs.length}</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">KegelLogs</h4>
                      <div className="flex justify-between items-baseline">
                        <p className="text-2xl font-bold">{filteredData.kegelLogs.length}</p>
                        <p className="text-sm text-gray-500">of {parsedData.kegelLogs.length}</p>
                      </div>
                    </div>
                  </div>

                  {importStats.rejected > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 dark:text-amber-200">
                            {importStats.rejected} entries rejected by business rules
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Some entries were rejected based on your business rules. You can adjust the rules or
                            continue with the filtered data.
                          </p>

                          {Object.keys(rejectionReasons).length > 0 && (
                            <div className="mt-2">
                              <details className="text-sm">
                                <summary className="cursor-pointer font-medium">View rejection reasons</summary>
                                <div className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-700 p-2 rounded">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {Object.entries(rejectionReasons)
                                      .slice(0, 10)
                                      .map(([timestamp, reason], index) => (
                                        <li key={index}>
                                          <span className="font-mono text-xs">
                                            {new Date(timestamp).toLocaleString()}
                                          </span>
                                          : {reason}
                                        </li>
                                      ))}
                                    {Object.keys(rejectionReasons).length > 10 && (
                                      <li className="italic">
                                        And {Object.keys(rejectionReasons).length - 10} more...
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {importStats.modified > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200">
                            {importStats.modified} entries modified by business rules
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Some entries were modified based on your business rules (e.g., timestamp adjustments, data
                            corrections).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCurrentStep("preview")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading || (!selectedTypes.uroLogs && !selectedTypes.hydroLogs && !selectedTypes.kegelLogs)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Import
              </button>
            </div>
          </div>
        )

      case "importing":
        const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <RefreshCw className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
              <h3 className="font-medium text-lg mt-4 mb-2">Importing Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{progress.message}</p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {progress.current} of {progress.total} entries processed ({progressPercentage}%)
              </p>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-lg mt-4 mb-2">Import Complete</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your data has been successfully imported.</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Added</h4>
                  <p className="text-2xl font-bold">{importStats.added}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Skipped</h4>
                  <p className="text-2xl font-bold">{importStats.skipped}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Overwritten</h4>
                  <p className="text-2xl font-bold">{importStats.overwritten}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200">Rejected</h4>
                  <p className="text-2xl font-bold">{importStats.rejected}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Modified</h4>
                  <p className="text-2xl font-bold">{importStats.modified}</p>
                </div>
              </div>

              {/* Display the first skipped/rejected record and its reason */}
              {firstSkippedRejected && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    First Skipped/Rejected Entry ({firstSkippedRejected.type})
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Timestamp:</strong> {new Date(firstSkippedRejected.entry.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Reason:</strong> {firstSkippedRejected.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={onComplete} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Done
              </button>
            </div>
          </div>
        )

      case "error":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-lg mt-4 mb-2">Import Failed</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "An unexpected error occurred during the import process."}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setCurrentStep("upload")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Import Wizard
        </h2>

        {/* Step indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${currentStep === "upload" || currentStep === "preview" || currentStep === "rules" || currentStep === "importing" || currentStep === "complete" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${currentStep === "preview" || currentStep === "rules" || currentStep === "importing" || currentStep === "complete" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${currentStep === "rules" || currentStep === "importing" || currentStep === "complete" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${currentStep === "importing" || currentStep === "complete" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${currentStep === "complete" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
          ></div>
        </div>
      </div>

      {renderStepContent()}
    </div>
  )
}
