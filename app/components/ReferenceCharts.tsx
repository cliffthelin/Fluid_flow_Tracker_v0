"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle, Info, Search, Flag } from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"

const ReferenceCharts: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male")

  const maleData = [
    { ageGroup: "18–30", averageQmax: "21–25", normalRange: "15–30" },
    { ageGroup: "31–40", averageQmax: "20–23", normalRange: "15–28" },
    { ageGroup: "41–50", averageQmax: "18–21", normalRange: "12–25" },
    { ageGroup: "51–60", averageQmax: "15–18", normalRange: "10–20" },
    { ageGroup: "61–70", averageQmax: "12–15", normalRange: "8–18" },
    { ageGroup: "71+", averageQmax: "10–13", normalRange: "7–15" },
  ]

  const femaleData = [
    { ageGroup: "18–30", averageQmax: "25–30", normalRange: "20–35" },
    { ageGroup: "31–40", averageQmax: "22–28", normalRange: "18–32" },
    { ageGroup: "41–50", averageQmax: "20–25", normalRange: "15–30" },
    { ageGroup: "51–60", averageQmax: "18–23", normalRange: "12–28" },
    { ageGroup: "61–70", averageQmax: "15–20", normalRange: "10–25" },
    { ageGroup: "71+", averageQmax: "13–18", normalRange: "8–22" },
  ]

  return (
    <CollapsibleSection title="Reference Charts" defaultExpanded={false}>
      <div className="mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setSelectedGender("male")}
            className={`px-5 py-3 font-medium rounded-l-lg min-h-[48px]  ${
              selectedGender === "male"
                ? "bg-blue-700 text-white"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            aria-pressed={selectedGender === "male"}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("female")}
            className={`px-5 py-3 font-medium rounded-r-lg min-h-[48px]  ${
              selectedGender === "female"
                ? "bg-pink-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            aria-pressed={selectedGender === "female"}
          >
            Female
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
              >
                Age Group
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Average Qmax (mL/sec)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Normal Range
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(selectedGender === "male" ? maleData : femaleData).map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {row.ageGroup}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {row.averageQmax}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {row.normalRange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Qmax = Maximum urine flow rate measured in milliliters per second (mL/sec)</p>
        <p className="mt-1">Compare your average flow rate to the reference values for your age group and gender.</p>
      </div>

      {selectedGender === "male" && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">
              <Info className="mr-3" size={22} />
              Key Terms
            </h3>
            <ul className="space-y-3 pl-6 list-disc leading-relaxed">
              <li>
                <strong>Qmax (Maximum Flow Rate):</strong> Peak flow during urination — main number used in evaluation.
              </li>
              <li>
                <strong>Qavg (Average Flow Rate):</strong> Usually 50–70% of Qmax.
              </li>
              <li>
                <strong>Post-void residual (PVR):</strong> How much urine remains in bladder — important in full bladder
                evaluation.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-amber-700 dark:text-amber-300 mb-3">
              <AlertCircle className="mr-3" size={22} />
              When to Get Checked
            </h3>
            <ul className="space-y-3 pl-6 list-disc leading-relaxed">
              <li>Flow rate consistently below 10 mL/sec</li>
              <li>Straining, dribbling, or frequent urges</li>
              <li>Feeling of incomplete emptying</li>
              <li>Nocturia (frequent urination at night)</li>
            </ul>
          </div>
        </div>
      )}

      {selectedGender === "female" && (
        <div className="mt-6 space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
              <Search className="mr-2" size={20} />
              Other Key Points
            </h3>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <strong>Normal voided volume for women:</strong> 200–400 mL per void
              </li>
              <li>
                <strong>Qmax:</strong> Maximum flow rate
              </li>
              <li>
                <strong>Qavg:</strong> Average flow rate is usually 60–70% of Qmax
              </li>
              <li>
                <strong>Post-void residual (PVR):</strong> Ideally &lt;50 mL in healthy individuals
              </li>
            </ul>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold text-rose-700 dark:text-rose-300 mb-2">
              <Flag className="mr-2" size={20} />
              When to Be Concerned
            </h3>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Qmax consistently below 10–12 mL/sec</li>
              <li>
                Symptoms like:
                <ul className="pl-6 mt-1 list-circle">
                  <li>Hesitancy or straining</li>
                  <li>Urgency/incontinence</li>
                  <li>Recurrent UTIs</li>
                  <li>Sensation of incomplete emptying</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </CollapsibleSection>
  )
}

export default ReferenceCharts
