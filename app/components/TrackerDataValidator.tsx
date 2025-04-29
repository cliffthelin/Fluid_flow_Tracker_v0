"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, RefreshCw, Database, HardDrive, FileSearch, Edit } from "lucide-react"
import { loadJsonFile } from "../utils/loadJsonFile"
import { getAllPossiblePaths } from "../utils/getPublicPath"

interface ValidationResult {
  source: string
  status: "loading" | "success" | "error"
  message: string
  groups?: number
  items?: number
  error?: string
  data?: any
  paths?: string[]
  successPath?: string
}

const TrackerDataValidator = () => {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [customPaths, setCustomPaths] = useState<{ [key: string]: string }>({
    "Tracker_List.json": "",
    "Tracker_List_backup.json": "",
  })
  const [showPathEditor, setShowPathEditor] = useState(false)

  const validateAllSources = async () => {
    setIsValidating(true)

    // Generate paths to try for each file
    const primaryPaths = customPaths["Tracker_List.json"]
      ? [customPaths["Tracker_List.json"]]
      : getAllPossiblePaths("data/Tracker_List.json")

    const backupPaths = customPaths["Tracker_List_backup.json"]
      ? [customPaths["Tracker_List_backup.json"]]
      : getAllPossiblePaths("data/Tracker_List_backup.json")

    setResults([
      { source: "localStorage", status: "loading", message: "Checking localStorage..." },
      {
        source: "Tracker_List.json",
        status: "loading",
        message: "Checking primary JSON file...",
        paths: primaryPaths,
      },
      {
        source: "Tracker_List_backup.json",
        status: "loading",
        message: "Checking backup JSON file...",
        paths: backupPaths,
      },
    ])

    // Validate localStorage
    try {
      const localStorageData = localStorage.getItem("trackerData")
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData)
        const groups = Object.keys(parsedData).length
        const items = Object.values(parsedData).reduce(
          (total, group: any[]) => total + (Array.isArray(group) ? group.length : 0),
          0,
        )
        setResults((prev) =>
          prev.map((result) =>
            result.source === "localStorage"
              ? {
                  source: "localStorage",
                  status: "success",
                  message: "localStorage data loaded successfully",
                  groups,
                  items,
                  data: parsedData,
                }
              : result,
          ),
        )
      } else {
        setResults((prev) =>
          prev.map((result) =>
            result.source === "localStorage"
              ? {
                  source: "localStorage",
                  status: "error",
                  message: "No tracker data found in localStorage",
                }
              : result,
          ),
        )
      }
    } catch (error) {
      setResults((prev) =>
        prev.map((result) =>
          result.source === "localStorage"
            ? {
                source: "localStorage",
                status: "error",
                message: "Error loading localStorage data",
                error: error instanceof Error ? error.message : String(error),
              }
            : result,
        ),
      )
    }

    // Validate primary JSON file - try multiple paths
    const primaryResult = await tryMultiplePaths(
      "Tracker_List.json",
      results.find((r) => r.source === "Tracker_List.json")?.paths || [],
    )
    setResults((prev) => prev.map((result) => (result.source === "Tracker_List.json" ? primaryResult : result)))

    // Validate backup JSON file - try multiple paths
    const backupResult = await tryMultiplePaths(
      "Tracker_List_backup.json",
      results.find((r) => r.source === "Tracker_List_backup.json")?.paths || [],
    )
    setResults((prev) => prev.map((result) => (result.source === "Tracker_List_backup.json" ? backupResult : result)))

    setIsValidating(false)
  }

  const tryMultiplePaths = async (sourceName: string, paths: string[]): Promise<ValidationResult> => {
    let successfulPath = ""
    let jsonData = null
    let lastError = ""

    // Try each path until one works
    for (const path of paths) {
      try {
        console.log(`Trying path: ${path} for ${sourceName}`)
        const data = await loadJsonFile<Record<string, any[]>>(path)
        if (data) {
          jsonData = data
          successfulPath = path

          // Save the successful path for future use
          setCustomPaths((prev) => ({
            ...prev,
            [sourceName]: path,
          }))

          // Save to localStorage for persistence
          localStorage.setItem(
            "trackerDataPaths",
            JSON.stringify({
              ...customPaths,
              [sourceName]: path,
            }),
          )

          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        console.log(`Path ${path} failed: ${lastError}`)
      }
    }

    if (jsonData) {
      const groups = Object.keys(jsonData).length
      const items = Object.values(jsonData).reduce(
        (total, group: any[]) => total + (Array.isArray(group) ? group.length : 0),
        0,
      )

      return {
        source: sourceName,
        status: "success",
        message: `Successfully loaded from ${successfulPath}`,
        groups,
        items,
        data: jsonData,
        paths,
        successPath: successfulPath,
      }
    } else {
      return {
        source: sourceName,
        status: "error",
        message: "Failed to load from any path",
        error: `Tried paths: ${paths.join(", ")}\nLast error: ${lastError}`,
        paths,
      }
    }
  }

  // Load saved paths from localStorage
  useEffect(() => {
    const savedPaths = localStorage.getItem("trackerDataPaths")
    if (savedPaths) {
      try {
        const paths = JSON.parse(savedPaths)
        setCustomPaths(paths)
      } catch (e) {
        console.error("Error loading saved paths:", e)
      }
    }
    validateAllSources()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="text-green-500" size={18} />
      case "error":
        return <AlertTriangle className="text-red-500" size={18} />
      case "loading":
        return <RefreshCw className="text-blue-500 animate-spin" size={18} />
      default:
        return null
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "localStorage":
        return <HardDrive className="text-gray-500" size={18} />
      case "Tracker_List.json":
      case "Tracker_List_backup.json":
        return <Database className="text-gray-500" size={18} />
      default:
        return null
    }
  }

  const handlePathChange = (source: string, path: string) => {
    setCustomPaths((prev) => ({
      ...prev,
      [source]: path,
    }))
  }

  const saveCustomPaths = () => {
    localStorage.setItem("trackerDataPaths", JSON.stringify(customPaths))
    validateAllSources()
    setShowPathEditor(false)
  }

  return (
    <div className="mt-8 border-t pt-4 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Data Source Validation</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPathEditor(!showPathEditor)}
            className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center text-sm"
          >
            <Edit size={14} className="mr-1" />
            {showPathEditor ? "Hide Path Editor" : "Edit Paths"}
          </button>
          <button
            onClick={validateAllSources}
            disabled={isValidating}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={`mr-1 ${isValidating ? "animate-spin" : ""}`} />
            {isValidating ? "Validating..." : "Validate Again"}
          </button>
        </div>
      </div>

      {showPathEditor && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h4 className="font-medium mb-2">Custom File Paths</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Specify exact paths to your JSON files. Leave empty to try all possible paths.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Primary JSON File Path:</label>
              <input
                type="text"
                value={customPaths["Tracker_List.json"]}
                onChange={(e) => handlePathChange("Tracker_List.json", e.target.value)}
                placeholder="/data/Tracker_List.json"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Backup JSON File Path:</label>
              <input
                type="text"
                value={customPaths["Tracker_List_backup.json"]}
                onChange={(e) => handlePathChange("Tracker_List_backup.json", e.target.value)}
                placeholder="/data/Tracker_List_backup.json"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button onClick={saveCustomPaths} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save & Validate
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.source}
            className={`border rounded-md p-3 ${
              result.status === "success"
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : result.status === "error"
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
            }`}
          >
            <div className="flex items-center">
              <div className="mr-2">{getSourceIcon(result.source)}</div>
              <div className="font-medium">{result.source}</div>
              <div className="ml-2">{getStatusIcon(result.status)}</div>
            </div>
            <div className="mt-1 text-sm">{result.message}</div>
            {result.status === "success" && (
              <>
                <div className="mt-1 text-sm">
                  <span className="font-medium">Groups:</span> {result.groups} |{" "}
                  <span className="font-medium">Items:</span> {result.items}
                </div>
                {result.successPath && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Using path: {result.successPath}
                  </div>
                )}
              </>
            )}
            {result.paths && result.paths.length > 0 && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <details>
                  <summary className="cursor-pointer flex items-center">
                    <FileSearch size={12} className="mr-1" />
                    Paths checked
                  </summary>
                  <ul className="mt-1 pl-4 list-disc">
                    {result.paths.map((path, index) => (
                      <li key={index} className={path === result.successPath ? "font-bold" : ""}>
                        {path} {path === result.successPath && "(✓ success)"}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
            {result.status === "error" && result.error && (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400 overflow-x-auto max-w-full">
                <details>
                  <summary className="cursor-pointer">Show Error Details</summary>
                  <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-x-auto">
                    {result.error}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> The app prioritizes localStorage data first, then falls back to default data if there
          are any issues with JSON files.
        </p>
        <p className="mt-2">
          <strong>Troubleshooting:</strong> If JSON files aren't loading, use the "Edit Paths" button to manually
          specify the correct file paths.
        </p>
      </div>
    </div>
  )
}

export default TrackerDataValidator
