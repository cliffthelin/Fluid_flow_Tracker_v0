"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

// Inline implementation of the test function as a fallback
function localTestHeaderNotSticky(): { success: boolean; message: string } {
  try {
    // Find the header element in the DOM
    const header = document.querySelector("header")

    // If header element doesn't exist, the test fails
    if (!header) {
      return {
        success: false,
        message: "Header element not found",
      }
    }

    // Get computed styles to check the position property
    const headerStyles = window.getComputedStyle(header)
    const position = headerStyles.position

    // If position is sticky or fixed, the test fails
    if (position === "sticky" || position === "fixed") {
      return {
        success: false,
        message: `Header has position: ${position}, expected: static or relative`,
      }
    }

    // If we get here, the test passed
    return {
      success: true,
      message: "Header is not sticky and scrolls away as expected",
    }
  } catch (error) {
    // Handle any unexpected errors during test execution
    return {
      success: false,
      message: `Test threw an error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function HeaderTest() {
  // State to store test results
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  // State to track if test is currently running
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    // Set running state to show loading indicator
    setIsRunning(true)

    try {
      // Try to import the test function from the file
      let testFunction

      try {
        // Try importing with .js extension first
        const module = await import("../tests/header.test.js")
        testFunction = module.testHeaderNotSticky
      } catch (importError) {
        console.warn("Could not import from header.test.js:", importError)

        try {
          // Try without extension as fallback
          const module = await import("../tests/header.test")
          testFunction = module.testHeaderNotSticky
        } catch (secondImportError) {
          console.warn("Could not import from header.test:", secondImportError)
          // Fall back to local implementation
          testFunction = localTestHeaderNotSticky
        }
      }

      // Check if we have a valid function
      if (typeof testFunction !== "function") {
        console.warn("Test function not found or not a function, using local implementation")
        testFunction = localTestHeaderNotSticky
      }

      // Execute the test and get results
      const result = testFunction()
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
  }

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
          {isRunning ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            "Run Header Test"
          )}
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
