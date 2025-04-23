"use client"

import type React from "react"

import { useState } from "react"
import { useConfig } from "../context/ConfigContext"
import { Search } from "lucide-react"

export function MeasurementOptions() {
  const { measurementOptions } = useConfig()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = measurementOptions.filter(
    (option) =>
      option.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.Acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option["Common Units"].toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Search measurements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">
                Name
              </th>
              <th scope="col" className="py-3 px-6">
                Acronym
              </th>
              <th scope="col" className="py-3 px-6">
                Common Units
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOptions.map((option, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{option.Name}</td>
                <td className="py-4 px-6">{option.Acronym}</td>
                <td className="py-4 px-6">{option["Common Units"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function UroLogMeasurementConfig() {
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
    </div>
  )
}
