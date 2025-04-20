"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"
import { testHeaderNotSticky } from "../tests/header.test.ts"

export function HeaderTest() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runTest = () => {
    setIsRunning(true)

    // Small delay to allow UI to update
    setTimeout(() => {
      const result = testHeaderNotSticky()
      setTestResult(result)
      setIsRunning(false)
    }, 100)
  }

  // Auto-run test on mount
  useEffect(() => {
    const autoRun = async () => {
      // Wait for DOM to be fully loaded
      await new Promise((resolve) => setTimeout(resolve, 1000))
      runTest()
    }

    autoRun()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={runTest} variant="outline" disabled={isRunning}>
          {isRunning ? "Running Test..." : "Run Header Test"}
        </Button>

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

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{testResult.success ? "Header Test Passed" : "Header Test Failed"}</AlertTitle>
          </div>
          <AlertDescription>
            <p className="mt-2 text-sm">{testResult.message}</p>

            {!testResult.success && (
              <p className="mt-1 text-sm">Expected: Header should not have position: sticky or fixed</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
