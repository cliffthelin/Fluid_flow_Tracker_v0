"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import BusinessRulesManager from "./BusinessRulesManager"

export default function BusinessRulesPage() {
  const [rulesUpdated, setRulesUpdated] = useState(false)

  const handleRulesUpdated = () => {
    setRulesUpdated(true)
    setTimeout(() => setRulesUpdated(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </a>
        <h1 className="text-2xl font-bold mt-2">Import Business Rules</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure and prioritize business rules for data imports
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">About Business Rules</h2>
          <p className="mb-4">
            Business rules help ensure data quality and consistency during imports. Rules are applied in the order shown
            below, and you can drag and drop to reorder them or toggle them on/off as needed.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Current Rules</h3>
            <ol className="list-decimal pl-5 space-y-2 text-blue-700 dark:text-blue-300">
              <li>
                <strong>GUID Matching</strong> - Checks for matching GUIDs and resolves discrepancies in receiving
                date/time
              </li>
              <li>
                <strong>Datetime Precision Filter</strong> - Excludes datetimes with precision less than one minute
              </li>
              <li>
                <strong>Skip Duplicate Entries</strong> - Skips entry logs with the same date, hour, and minute as
                existing entries
              </li>
            </ol>
          </div>

          {rulesUpdated && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-700 dark:text-green-300 mb-4">
              Business rules updated successfully!
            </div>
          )}
        </div>

        <BusinessRulesManager onRulesUpdated={handleRulesUpdated} />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">How Rules Are Applied</h2>
          <p className="mb-2">During the import process, each entry goes through the following workflow:</p>

          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Each rule is applied in the order shown above</li>
            <li>If a rule rejects an entry, it's excluded from import</li>
            <li>If a rule modifies an entry, the modified version continues through the remaining rules</li>
            <li>After all rules are applied, conflict resolution is performed for any remaining conflicts</li>
          </ol>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Note: You can view detailed results of rule application during the import process, including which entries
            were rejected and why.
          </p>
        </div>
      </div>
    </div>
  )
}
