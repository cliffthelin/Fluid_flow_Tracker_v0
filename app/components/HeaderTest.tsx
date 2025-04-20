/**
 * HeaderTest Component
 *
 * This component provides a UI for testing whether the application's header
 * is properly configured to scroll with the page (not sticky/fixed).
 *
 * It includes:
 * - A button to manually run the test
 * - Automatic test execution on component mount
 * - Visual feedback about test results
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"
import { testHeaderNotSticky } from "../tests/header.test.ts" // Explicitly include the .ts extension

export function HeaderTest() {
  // State to store test results
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  // State to track if test is currently running
  const [isRunning, setIsRunning] = useState(false)

  /**
   * Runs the header test and updates state with results
   */
  const runTest = () => {
    // Set running state to show loading indicator
    setIsRunning(true)

    // Small delay to allow UI to update before running test
    setTimeout(() => {
      try {
        // Execute the test and get results
        const result = testHeaderNotSticky()
        // Update state with test results
        setTestResult(result)
      } catch (error) {
        console.error("Error running header test:", error)
        setTestResult({
          success: false,
          message: `Test error: ${error instanceof Error ? error.message : String(error)}`,
        })
      } finally {
        // Reset running state
        setIsRunning(false)
      }
    }, 100)
  }

  /**
   * Effect to automatically run the test when component mounts
   */
  useEffect(() => {
    const autoRun = async () => {
      // Wait for DOM to be fully loaded before running test
      await new Promise((resolve) => setTimeout(resolve, 1000))
      runTest()
    }

    autoRun()
  }, []) // Empty dependency array means this runs once on mount

  return (
    <div className="space-y-4">
      {/* Test control button */}
      <div className="flex items-center gap-2">
        <Button onClick={runTest} variant="outline" disabled={isRunning}>
          {isRunning ? "Running Test..." : "Run Header Test"}
        </Button>

        {/* Inline test result indicator */}
        {testResult && (
          <span className="text-sm font-medium">
            {testResult.success ? (
              <span className="text-green-600">Test passed</span>
            ) : (
              <span className="text-red-600">Test failed</span>
            )}
          </span>
        )}
      </div>

      {/* Detailed test result alert */}
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{testResult.success ? "Header Test Passed" : "Header Test Failed"}</AlertTitle>
          </div>
          <AlertDescription>
            <p className="mt-2 text-sm">{testResult.message}</p>

            {/* Additional guidance if test fails */}
            {!testResult.success && (
              <p className="mt-1 text-sm">Expected: Header should not have position: sticky or fixed</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
