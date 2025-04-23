"use client"

import type React from "react"
import { useConfig } from "../context/ConfigContext"
import { Info } from "lucide-react"

export function MeasurementConfigSection() {
  const { measurementOptions, uroLogMeasurement, setUroLogMeasurement, uroLogUnit, setUroLogUnit, saveConfig } =
    useConfig()

  // Parse the common units for the selected measurement
  const getUnitsForMeasurement = (measurementName: string) => {
    const measurement = measurementOptions.find((m) => m.Name === measurementName)
    if (!measurement) return []

    return measurement["Common Units"].split(", ").map((unit) => unit.trim())
  }

  const availableUnits = getUnitsForMeasurement(uroLogMeasurement)

  // Handle measurement change
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMeasurement = e.target.value
    setUroLogMeasurement(newMeasurement)

    // Set default unit when measurement changes
    const units = getUnitsForMeasurement(newMeasurement)
    if (units.length > 0 && !units.includes(uroLogUnit)) {
      setUroLogUnit(units[0])
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">UroLog Measurement Configuration</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="measurement-type"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Measurement Type
            </label>
            <select
              id="measurement-type"
              value={uroLogMeasurement}
              onChange={handleMeasurementChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {measurementOptions.map((option, index) => (
                <option key={index} value={option.Name}>
                  {option.Name} ({option.Acronym})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select which measurement type the UroLog entry will represent
            </p>
          </div>

          {availableUnits.length > 1 && (
            <div>
              <label
                htmlFor="measurement-unit"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Measurement Unit
              </label>
              <select
                id="measurement-unit"
                value={uroLogUnit}
                onChange={(e) => setUroLogUnit(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {availableUnits.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select which unit to use for this measurement
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={saveConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Measurement Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-start">
          <Info className="mr-2 text-blue-500 flex-shrink-0 mt-1" size={18} />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">How This Works</h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              The UroLog entry form will dynamically adapt based on the selected measurement type and unit. This allows
              you to track different health metrics using the same interface.
            </p>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              For example, if you select "Heart Rate" as the measurement type, the form will show fields appropriate for
              tracking heart rate in beats per minute (bpm).
            </p>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              All logs will store the measurement type and unit, so your statistics and charts will correctly display
              the data with the appropriate labels and units.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
