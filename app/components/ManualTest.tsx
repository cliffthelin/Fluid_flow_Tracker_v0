"use client"

import { useState } from "react"
import { testManualComponent } from "../tests/manual.test"
import { Check, X, Loader2 } from "lucide-react"

export function ManualTest() {
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    contentLength?: number
  }>({})
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    setIsRunning(true)
    setResult({})

    try {
      const testResult = await testManualComponent()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={runTest}
        disabled={isRunning}
        className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? <Loader2 size={16} className="mr-2 animate-spin" /> : <span className="mr-2">🧪</span>}
        Test Manual Component
      </button>

      {Object.keys(result).length > 0 && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-center">
            {result.success ? (
              <Check className="mr-2 flex-shrink-0" size={16} />
            ) : (
              <X className="mr-2 flex-shrink-0" size={16} />
            )}
            <p className="font-medium">{result.success ? "Test Passed" : "Test Failed"}</p>
          </div>
          <p className="mt-1 text-sm">{result.message}</p>
          {result.contentLength && <p className="mt-1 text-sm">Content length: {result.contentLength} characters</p>}
        </div>
      )}
    </div>
  )
}
