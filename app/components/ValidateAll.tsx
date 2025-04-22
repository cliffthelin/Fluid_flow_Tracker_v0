"use client"

import { useState } from "react"
import { Play, Loader2 } from "lucide-react"
import { checkDatabaseIntegrity, getDatabaseInfo } from "../services/db"
import { isShareAvailable } from "../services/share"
import { testBuilderLogCompleteness } from "../utils/builderLogTest"
import { useBuilderLog } from "../hooks/useBuilderLog"
import { useApplicationLog } from "./ApplicationLog"

// Local implementations of test functions as fallbacks
async function localTestManualComponent() {
  try {
    const response = await fetch("/Manual.md")
    if (!response.ok) {
      throw new Error(`Failed to fetch Manual.md: ${response.status}`)
    }
    const text = await response.text()

    if (!text || text.trim() === "") {
      throw new Error("Manual.md is empty")
    }

    if (!text.includes("# ")) {
      throw new Error("Manual.md does not contain any headings")
    }

    return {
      success: true,
      message: "Manual.md is accessible and contains valid content",
      contentLength: text.length,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

function localTestHeaderNotSticky() {
  try {
    const header = document.querySelector("header")
    if (!header) {
      return {
        success: false,
        message: "Header element not found",
      }
    }

    const headerStyles = window.getComputedStyle(header)
    const position = headerStyles.position

    if (position === "sticky" || position === "fixed") {
      return {
        success: false,
        message: `Header has position: ${position}, expected: static or relative`,
      }
    }

    return {
      success: true,
      message: "Header is not sticky and scrolls away as expected",
    }
  } catch (error) {
    return {
      success: false,
      message: `Test threw an error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function ValidateAll() {
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState("")
  const { logEntries: builderLogEntries } = useBuilderLog()
  const { addLogEntry } = useApplicationLog()

  const runAllTests = async () => {
    setIsValidating(true)
    setProgress(0)
    setCurrentTest("Initializing tests...")

    try {
      // Log the start of validation
      addLogEntry({
        type: "info",
        source: "Validation",
        message: "Starting comprehensive validation of all application components",
      })

      // Define total number of tests for progress calculation
      const totalTests = 7
      let completedTests = 0

      // Test 1: Header Test
      setCurrentTest("Testing header...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        // Try to import the test function
        let headerTestFunction

        try {
          // Try importing with .js extension first
          const module = await import("../tests/header.test.js")
          headerTestFunction = module.testHeaderNotSticky
        } catch (importError) {
          console.warn("Could not import from header.test.js:", importError)

          try {
            // Try without extension as fallback
            const module = await import("../tests/header.test")
            headerTestFunction = module.testHeaderNotSticky
          } catch (secondImportError) {
            console.warn("Could not import from header.test:", secondImportError)
            // Fall back to local implementation
            headerTestFunction = localTestHeaderNotSticky
          }
        }

        // Check if we have a valid function
        if (typeof headerTestFunction !== "function") {
          console.warn("Header test function not found or not a function, using local implementation")
          headerTestFunction = localTestHeaderNotSticky
        }

        const headerResult = headerTestFunction()
        addLogEntry({
          type: headerResult.success ? "success" : "error",
          source: "Header Test",
          message: headerResult.message,
        })
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Header Test",
          message: "Test failed with an exception",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 2: Manual Component Test
      setCurrentTest("Testing manual component...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        // Try to import the test function
        let manualTestFunction

        try {
          // Try importing with .js extension first
          const module = await import("../tests/manual.test.js")
          manualTestFunction = module.testManualComponent
        } catch (importError) {
          console.warn("Could not import from manual.test.js:", importError)

          try {
            // Try without extension as fallback
            const module = await import("../tests/manual.test")
            manualTestFunction = module.testManualComponent
          } catch (secondImportError) {
            console.warn("Could not import from manual.test:", secondImportError)
            // Fall back to local implementation
            manualTestFunction = localTestManualComponent
          }
        }

        // Check if we have a valid function
        if (typeof manualTestFunction !== "function") {
          console.warn("Manual test function not found or not a function, using local implementation")
          manualTestFunction = localTestManualComponent
        }

        const manualResult = await manualTestFunction()
        addLogEntry({
          type: manualResult.success ? "success" : "error",
          source: "Manual Component",
          message: manualResult.message,
          details: manualResult.contentLength ? `Content length: ${manualResult.contentLength} characters` : undefined,
        })
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Manual Component",
          message: "Test failed with an exception",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 3: Database Integrity
      setCurrentTest("Checking database integrity...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        const dbIntegrityResult = await checkDatabaseIntegrity()

        if (dbIntegrityResult.hasDuplicates) {
          addLogEntry({
            type: "warning",
            source: "Database Integrity",
            message: "Database contains duplicate entries",
            details: `Found ${dbIntegrityResult.uroDuplicates} duplicate UroLog entries and ${dbIntegrityResult.hydroDuplicates} duplicate HydroLog entries`,
          })
        } else {
          addLogEntry({
            type: "success",
            source: "Database Integrity",
            message: "Database integrity check passed - no duplicates found",
          })
        }
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Database Integrity",
          message: "Database integrity check failed",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 4: Database Info
      setCurrentTest("Retrieving database information...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        const dbInfo = await getDatabaseInfo()

        addLogEntry({
          type: "info",
          source: "Database Info",
          message: `Database version: ${dbInfo.version}, Status: ${dbInfo.isOpen ? "Open" : "Closed"}`,
          details: `Tables: ${dbInfo.tableNames.join(", ")}
Entry counts: ${Object.entries(dbInfo.entryCounts)
            .map(([table, count]) => `${table}: ${count}`)
            .join(", ")}`,
        })
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Database Info",
          message: "Failed to retrieve database information",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 5: Share Availability
      setCurrentTest("Testing share functionality...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        const shareAvailable = isShareAvailable()

        addLogEntry({
          type: "info",
          source: "Share Functionality",
          message: shareAvailable
            ? "Web Share API is available on this device"
            : "Web Share API is not available, using clipboard fallback",
        })
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Share Functionality",
          message: "Error checking share availability",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 6: Builder Log Completeness
      setCurrentTest("Validating builder log...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        const builderLogResults = testBuilderLogCompleteness(builderLogEntries)

        if (
          builderLogResults.isTotalCorrect &&
          builderLogResults.areDateTotalsCorrect &&
          builderLogResults.hasSequentialCounts
        ) {
          addLogEntry({
            type: "success",
            source: "Builder Log",
            message: `Builder log is complete with ${builderLogResults.totalEntries} entries`,
          })
        } else {
          const issues = []

          if (!builderLogResults.isTotalCorrect) {
            issues.push(
              `Expected ${builderLogResults.expectedTotal} entries but found ${builderLogResults.totalEntries}`,
            )
          }

          if (!builderLogResults.areDateTotalsCorrect) {
            issues.push("Date distribution does not match expected values")
          }

          if (!builderLogResults.hasSequentialCounts) {
            issues.push(`Missing entry counts: ${builderLogResults.missingCounts.join(", ")}`)
          }

          addLogEntry({
            type: "warning",
            source: "Builder Log",
            message: "Builder log has completeness issues",
            details: issues.join("\n"),
          })
        }
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "Builder Log",
          message: "Error validating builder log",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // Test 7: LocalStorage Usage
      setCurrentTest("Checking localStorage usage...")
      setProgress(Math.round((completedTests / totalTests) * 100))

      try {
        const flowEntriesInLocalStorage = localStorage.getItem("flowEntries")
        const hydroLogsInLocalStorage = localStorage.getItem("hydroLogs")

        if (flowEntriesInLocalStorage || hydroLogsInLocalStorage) {
          addLogEntry({
            type: "warning",
            source: "LocalStorage",
            message: "Found data in localStorage that should be in IndexedDB",
            details: `Found: ${flowEntriesInLocalStorage ? "flowEntries" : ""} ${hydroLogsInLocalStorage ? "hydroLogs" : ""}`,
          })
        } else {
          addLogEntry({
            type: "success",
            source: "LocalStorage",
            message: "No app data found in localStorage (correct)",
          })
        }
      } catch (error) {
        addLogEntry({
          type: "error",
          source: "LocalStorage",
          message: "Error checking localStorage",
          details: error instanceof Error ? error.message : String(error),
        })
      }

      completedTests++

      // All tests complete
      setProgress(100)
      setCurrentTest("All tests completed")

      addLogEntry({
        type: "success",
        source: "Validation",
        message: "Comprehensive validation completed successfully",
      })
    } catch (error) {
      addLogEntry({
        type: "error",
        source: "Validation",
        message: "Validation process encountered an error",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Validate All Components</h3>
        <button
          onClick={runAllTests}
          disabled={isValidating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play size={18} className="mr-2" />
              Run All Tests
            </>
          )}
        </button>
      </div>

      {isValidating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentTest}</p>
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          This will run all available tests and validations in the application and log the results to the Application
          Log. Tests include header behavior, database integrity, component availability, and more.
        </p>
      </div>
    </div>
  )
}
