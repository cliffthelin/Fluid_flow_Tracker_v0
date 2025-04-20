"use client"

import { Button } from "@/components/ui/button"
import { useBuilderLog } from "../hooks/useBuilderLog"
import { runBuilderLogTest } from "../utils/builderLogTest"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export function BuilderLogTest() {
  const { logEntries } = useBuilderLog()
  const [testResults, setTestResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  const runTest = () => {
    const results = runBuilderLogTest(logEntries)
    setTestResults(results)
    setShowResults(true)
  }

  return (
    <div className="space-y-4">
      <Button onClick={runTest} variant="outline">
        Run Completeness Test
      </Button>

      {showResults && testResults && (
        <div className="space-y-2">
          <Alert
            variant={
              testResults.isTotalCorrect && testResults.areDateTotalsCorrect && testResults.hasSequentialCounts
                ? "default"
                : "destructive"
            }
          >
            <div className="flex items-center gap-2">
              {testResults.isTotalCorrect && testResults.areDateTotalsCorrect && testResults.hasSequentialCounts ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResults.isTotalCorrect && testResults.areDateTotalsCorrect && testResults.hasSequentialCounts
                  ? "All Tests Passed"
                  : "Test Failed"}
              </AlertTitle>
            </div>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p>
                  Total entries: {testResults.totalEntries}/{testResults.expectedTotal} (
                  {testResults.isTotalCorrect ? "PASS" : "FAIL"})
                </p>
                <p>Date distribution: {testResults.areDateTotalsCorrect ? "PASS" : "FAIL"}</p>
                <p>Sequential counts: {testResults.hasSequentialCounts ? "PASS" : "FAIL"}</p>

                {testResults.missingCounts.length > 0 && (
                  <p className="mt-1">Missing counts: {testResults.missingCounts.join(", ")}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-sm">
            <h4 className="font-medium mb-1">Entries by date:</h4>
            <ul className="space-y-1">
              {Object.entries(testResults.expectedByDate).map(([date, expectedCount]) => {
                const actualCount = testResults.entriesByDate[date] || 0
                return (
                  <li key={date} className="flex items-center gap-2">
                    {actualCount === expectedCount ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span>
                      {date}: {actualCount}/{expectedCount}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
