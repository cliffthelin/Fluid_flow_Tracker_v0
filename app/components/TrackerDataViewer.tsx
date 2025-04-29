"use client"

import { useState, useEffect } from "react"
import { TrackerDataService } from "../services/trackerDataService"

export default function TrackerDataViewer() {
  const [trackerData, setTrackerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>("")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await TrackerDataService.loadTrackerData()
        setTrackerData(data)

        // Set the first group as selected by default
        if (Object.keys(data).length > 0) {
          setSelectedGroup(Object.keys(data)[0])
        }

        setError(null)
      } catch (err) {
        setError(`Error loading tracker data: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4">Loading tracker data...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!trackerData || Object.keys(trackerData).length === 0) {
    return <div className="p-4">No tracker data available.</div>
  }

  const groups = Object.keys(trackerData)
  const selectedGroupData = selectedGroup ? trackerData[selectedGroup] : null

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tracker Data Viewer</h2>

      <div className="mb-4">
        <label htmlFor="groupSelect" className="block text-sm font-medium mb-1">
          Select Tracker Group
        </label>
        <select
          id="groupSelect"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group} ({Array.isArray(trackerData[group]) ? trackerData[group].length : "N/A"} items)
            </option>
          ))}
        </select>
      </div>

      {selectedGroupData && Array.isArray(selectedGroupData) ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">{selectedGroup}</h3>
          <p className="mb-2">Total items: {selectedGroupData.length}</p>

          <div className="overflow-auto max-h-96 border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acronym
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Common Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedGroupData.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.Name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.Acronym || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item["Common Units"] || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.IsActive !== undefined ? (item.IsActive ? "Yes" : "No") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          Selected group does not contain valid tracker data.
        </div>
      )}
    </div>
  )
}
