"use client"

import type React from "react"

import { useState } from "react"
import { useBuilderLog } from "../hooks/useBuilderLog"

interface BuilderLogFormProps {
  onClose: () => void
}

export default function BuilderLogForm({ onClose }: BuilderLogFormProps) {
  const { addLogEntry } = useBuilderLog()
  const [formData, setFormData] = useState({
    userInput: "",
    builderOutput: "",
    rawResponse: "",
    errorResolution: "",
    userRequest: "",
    validationTest: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addLogEntry(formData)
    onClose()
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium mb-4">Add Builder Log Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User Input
          </label>
          <textarea
            id="userInput"
            name="userInput"
            value={formData.userInput}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="builderOutput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            App Builder Output
          </label>
          <textarea
            id="builderOutput"
            name="builderOutput"
            value={formData.builderOutput}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="rawResponse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Raw Response
          </label>
          <textarea
            id="rawResponse"
            name="rawResponse"
            value={formData.rawResponse}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={5}
          />
        </div>

        <div>
          <label htmlFor="errorResolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Error Resolution
          </label>
          <textarea
            id="errorResolution"
            name="errorResolution"
            value={formData.errorResolution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={2}
          />
        </div>

        <div>
          <label htmlFor="userRequest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User Requested Refactor
          </label>
          <textarea
            id="userRequest"
            name="userRequest"
            value={formData.userRequest}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={2}
          />
        </div>

        <div>
          <label htmlFor="validationTest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Validation Test
          </label>
          <textarea
            id="validationTest"
            name="validationTest"
            value={formData.validationTest}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Entry
          </button>
        </div>
      </form>
    </div>
  )
}
