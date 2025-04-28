"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Edit,
  Check,
  Download,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react"
import type { AppConfig, PageConfig, SectionConfig, TabConfig, FormFieldConfig } from "../types/config"
import { DEFAULT_CONFIG, saveConfig, healthMeasurements } from "../types/config"
import FormulaBuilder from "./FormulaBuilder"

// Add the import for the DragDropContext, Droppable, and Draggable components from react-beautiful-dnd
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Add the import for the trackerService at the top of the file
import { loadTrackerData, saveTrackerData, resetTrackerData } from "../services/trackerService"

// Add this component:
const SortableItem = ({
  id,
  item,
  index,
  editingTracker,
  setEditingTracker,
  handleTrackerItemChange,
  handleDeleteTrackerItem,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isEditing = editingTracker?.index === index

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab p-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="8" y1="18" x2="16" y2="18"></line>
            </svg>
          </div>
          <h4 className="font-medium">
            {item.Name} ({item.Acronym})
          </h4>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingTracker(isEditing ? null : { index, field: "" })}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isEditing ? <Check size={18} /> : <Edit size={18} />}
          </button>
          <button
            onClick={() => handleDeleteTrackerItem(index)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={item.Name}
              onChange={(e) => handleTrackerItemChange(index, "Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Acronym</label>
            <input
              type="text"
              value={item.Acronym}
              onChange={(e) => handleTrackerItemChange(index, "Acronym", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Common Units</label>
            <input
              type="text"
              value={item["Common Units"]}
              onChange={(e) => handleTrackerItemChange(index, "Common Units", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Common Units Full Name</label>
            <input
              type="text"
              value={item["Common Units Full Name"]}
              onChange={(e) => handleTrackerItemChange(index, "Common Units Full Name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Entry Text</label>
            <textarea
              value={item["Entry Text"]}
              onChange={(e) => handleTrackerItemChange(index, "Entry Text", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 min-h-[80px]"
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="font-medium">Common Units:</span> {item["Common Units"]}
          </p>
          <p>
            <span className="font-medium">Common Units Full Name:</span> {item["Common Units Full Name"]}
          </p>
          <p>
            <span className="font-medium">Entry Text:</span> {item["Entry Text"]}
          </p>
        </div>
      )}
    </div>
  )
}

interface ConfigurationProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  fontSize: number
  setFontSize: (value: boolean) => void
  appConfig: AppConfig
  setAppConfig: (config: AppConfig) => void
}

const Configuration: React.FC<ConfigurationProps> = ({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  appConfig,
  setAppConfig,
}) => {
  // Local state for configuration options
  const [localConfig, setLocalConfig] = useState<AppConfig>(appConfig)
  // Update the activeTab type to include "trackers"
  const [activeTab, setActiveTab] = useState<"general" | "forms" | "trackers">("general")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [editingField, setEditingField] = useState<string | null>(null)

  // New state to track the selected common unit for each measurement type field
  const [selectedCommonUnits, setSelectedCommonUnits] = useState<Record<string, string>>({})

  // New state for export/import messages
  const [configMessage, setConfigMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New state for tracker data after the other state declarations
  const [trackerData, setTrackerData] = useState<Record<string, any[]>>({})
  const [selectedTrackerGroup, setSelectedTrackerGroup] = useState<string>("")
  const [editingTracker, setEditingTracker] = useState<{ index: number; field: string } | null>(null)
  const [newTrackerItem, setNewTrackerItem] = useState<Record<string, string>>({
    Name: "",
    Acronym: "",
    "Common Units": "",
    "Common Units Full Name": "",
    "Entry Text": "",
  })
  const [isAddingNewTracker, setIsAddingNewTracker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load saved configuration
  useEffect(() => {
    // Ensure all fields have a measurementType
    const ensureMeasurementTypes = (config: AppConfig): AppConfig => {
      const newConfig = { ...config }
      for (const pageKey in newConfig.pages) {
        const page = newConfig.pages[pageKey]
        for (const sectionKey in page.sections) {
          const section = newConfig.pages[pageKey].sections[sectionKey]
          for (const tabKey in section.tabs) {
            const tab = newConfig.pages[pageKey].sections[sectionKey].tabs[tabKey]
            for (const fieldKey in tab.fields) {
              const field = tab.fields[fieldKey]
              if (field && field.type === "number" && !field.measurementType) {
                field.measurementType = "UV" // Default to Urine Volume
              }
            }
          }
        }
      }
      return newConfig
    }

    const initialConfig = ensureMeasurementTypes(appConfig)
    setLocalConfig(initialConfig)

    // Initialize selected common units from config
    const initialUnits: Record<string, string> = {}
    for (const pageKey in initialConfig.pages) {
      const page = initialConfig.pages[pageKey]
      for (const sectionKey in page.sections) {
        const section = initialConfig.pages[pageKey].sections[sectionKey]
        for (const tabKey in section.tabs) {
          const tab = initialConfig.pages[pageKey].sections[sectionKey].tabs[tabKey]
          for (const fieldKey in tab.fields) {
            const field = initialConfig.pages[pageKey].sections[sectionKey].tabs[tabKey].fields[fieldKey]
            if (field && field.type === "measurementType" && field.measurementType) {
              const measurement = healthMeasurements.find((m) => m.Acronym === field.measurementType)
              if (measurement) {
                initialUnits[`${pageKey}.${sectionKey}.${tabKey}.${fieldKey}`] = measurement["Common Units"]
                  .split(",")[0]
                  .trim()
              }
            }
          }
        }
      }
    }
    setSelectedCommonUnits(initialUnits)
  }, [appConfig])

  // Update the useEffect to load the tracker data using the service
  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        setLoading(true)
        const data = await loadTrackerData()
        setTrackerData(data)
        setError(null)

        // Set the first group as selected by default
        if (Object.keys(data).length > 0) {
          setSelectedTrackerGroup(Object.keys(data)[0])
        }
      } catch (err) {
        console.error("Error fetching tracker data:", err)
        setError(`Error loading tracker data: ${err instanceof Error ? err.message : String(err)}`)
        setConfigMessage({ type: "error", text: "Failed to load tracker data. Using default values." })
        setTimeout(() => setConfigMessage(null), 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchTrackerData()
  }, [])

  // Toggle expanded state for an item
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // Check if an item is expanded
  const isExpanded = (itemId: string) => {
    return !!expandedItems[itemId]
  }

  // Save configuration
  const saveConfiguration = () => {
    try {
      // Update parent state for controlled values
      setDarkMode(localConfig.appearance.darkMode)
      setFontSize(localConfig.appearance.fontSize)
      setAppConfig(localConfig)

      // Save all config to localStorage
      saveConfig(localConfig)

      // Show success message
      setConfigMessage({ type: "success", text: "Configuration saved successfully!" })
      setTimeout(() => setConfigMessage(null), 3000)
    } catch (error) {
      console.error("Error saving configuration:", error)
      setConfigMessage({ type: "error", text: "Error saving configuration. Please try again." })
      setTimeout(() => setConfigMessage(null), 3000)
    }
  }

  // Reset configuration to defaults
  const resetConfiguration = () => {
    if (confirm("Are you sure you want to reset all configuration settings to defaults?")) {
      setLocalConfig(DEFAULT_CONFIG)
      setDarkMode(DEFAULT_CONFIG.appearance.darkMode)
      setFontSize(DEFAULT_CONFIG.appearance.fontSize)
      setAppConfig(DEFAULT_CONFIG)
      saveConfig(DEFAULT_CONFIG)
      setConfigMessage({ type: "success", text: "Configuration reset to defaults." })
      setTimeout(() => setConfigMessage(null), 3000)
    }
  }

  // Export configuration
  const exportConfiguration = () => {
    try {
      const dataStr = JSON.stringify(localConfig, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileName = "flow-tracker-config.json"

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileName)
      document.body.appendChild(linkElement)

      linkElement.click()
      document.body.removeChild(linkElement)
      URL.revokeObjectURL(dataUri)

      setConfigMessage({ type: "success", text: "Configuration exported successfully!" })
      setTimeout(() => setConfigMessage(null), 3000)
    } catch (error) {
      console.error("Error exporting configuration:", error)
      setConfigMessage({ type: "error", text: "Error exporting configuration. Please try again." })
      setTimeout(() => setConfigMessage(null), 3000)
    }
  }

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const importedConfig = JSON.parse(content) as AppConfig

        // Basic validation - check if it's a valid AppConfig
        if (
          typeof importedConfig === "object" &&
          importedConfig !== null &&
          importedConfig.appearance &&
          importedConfig.dataManagement &&
          importedConfig.pages
        ) {
          setLocalConfig(importedConfig)
          setDarkMode(importedConfig.appearance.darkMode)
          setFontSize(importedConfig.appearance.fontSize)
          setAppConfig(importedConfig)
          saveConfig(importedConfig)
          setConfigMessage({ type: "success", text: "Configuration imported successfully!" })
          setTimeout(() => setConfigMessage(null), 3000)
        } else {
          throw new Error("Invalid configuration file format")
        }
      } catch (error) {
        console.error("Error importing configuration:", error)
        setConfigMessage({ type: "error", text: "Error importing configuration. Invalid file format." })
        setTimeout(() => setConfigMessage(null), 3000)
      }
    }

    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Update a field in the configuration
  const updateField = (
    pageId: string,
    sectionId: string,
    tabId: string,
    fieldId: string,
    updates: Partial<FormFieldConfig>,
  ) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field) {
        // Check if the updates are actually different from current values
        let hasChanges = false
        for (const [key, value] of Object.entries(updates)) {
          if (JSON.stringify(field[key as keyof FormFieldConfig]) !== JSON.stringify(value)) {
            hasChanges = true
            break
          }
        }

        // Only update if there are actual changes
        if (hasChanges) {
          newConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId] = {
            ...field,
            ...updates,
          }
          return newConfig
        }
      }

      // Return the previous state if no changes
      return prev
    })
  }

  // Toggle field enabled state
  const toggleFieldEnabled = (pageId: string, sectionId: string, tabId: string, fieldId: string) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field) {
        field.enabled = !field.enabled
      }

      return newConfig
    })
  }

  // Update measurement type
  const updateMeasurementType = (
    pageId: string,
    sectionId: string,
    tabId: string,
    fieldId: string,
    measurementType: string,
  ) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field) {
        const measurement = healthMeasurements.find((m) => m.Acronym === measurementType)
        const newLabel = measurement ? measurement.Name : field.label
        const newHelpText = measurement ? measurement["Entry Text"] : field.helpText

        newConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId] = {
          ...field,
          measurementType: measurementType,
          label: newLabel,
          helpText: newHelpText,
        }
      }

      return newConfig
    })
  }

  // Toggle tab enabled state
  const toggleTabEnabled = (pageId: string, sectionId: string, tabId: string) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const tab = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]

      if (tab) {
        tab.enabled = !tab.enabled
      }

      return newConfig
    })
  }

  // Add a new tab to a section
  const addNewTab = (pageId: string, sectionId: string) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const section = newConfig.pages[pageId]?.sections[sectionId]

      if (section) {
        // Find the highest tab number to generate the next ID
        const tabIds = Object.keys(section.tabs).filter((id) => id.startsWith("tab"))
        const tabNumbers = tabIds.map((id) => {
          const match = id.match(/tab(\d+)/)
          return match ? Number.parseInt(match[1], 10) : 0
        })
        const nextTabNumber = tabNumbers.length > 0 ? Math.max(...tabNumbers) + 1 : 1
        const newTabId = `tab${nextTabNumber}`

        // Create a new tab with default fields
        section.tabs[newTabId] = {
          id: newTabId,
          label: `New Tab ${nextTabNumber}`,
          icon: "file",
          enabled: true,
          order: Object.keys(section.tabs).length + 1,
          fields: {
            field1: {
              id: "field1",
              label: "New Field",
              placeholder: "Enter value",
              enabled: true,
              required: false,
              defaultValue: "",
              order: 1,
              type: "text",
              measurementType: "type_na",
              value_na: "Value_na",
            },
          },
        }
      }

      return newConfig
    })
  }

  const renderCommonUnitsDropdown = (
    pageId: string,
    sectionId: string,
    tabId: string,
    fieldId: string,
    field: FormFieldConfig,
  ) => {
    const key = `${pageId}.${sectionId}.${tabId}.${fieldId}`
    const measurement = healthMeasurements.find((m) => m.Acronym === field.measurementType)
    const commonUnits = measurement ? measurement["Common Units"].split(",").map((unit) => unit.trim()) : []

    const handleUnitChange = (newUnit: string) => {
      if (
        confirm(
          `Are you sure you want to change the common unit to ${newUnit}? This might affect existing data and how it's displayed.`,
        )
      ) {
        setSelectedCommonUnits((prev) => ({ ...prev, [key]: newUnit }))
        updateField(pageId, sectionId, tabId, fieldId, { commonUnits: newUnit })
      }
    }

    return (
      <div>
        <label className="block text-sm font-medium mb-1">Common Units</label>
        <select
          value={selectedCommonUnits[key] || ""}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
        >
          {commonUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const handleAddOption = (pageId: string, sectionId: string, tabId: string, fieldId: string) => {
    const newLabel = "New Option"
    const newValue = newLabel.toLowerCase().replace(/\s+/g, "_")
    const newOption = { value: newValue, label: newLabel }

    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field && field.options) {
        field.options = [...field.options, newOption]
      }

      return newConfig
    })
  }

  const handleUpdateOption = (
    pageId: string,
    sectionId: string,
    tabId: string,
    fieldId: string,
    index: number,
    updates: Partial<{ value: string; label: string }>,
  ) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field && field.options && field.options[index]) {
        field.options[index] = { ...field.options[index], ...updates }
      }

      return newConfig
    })
  }

  const handleDeleteOption = (pageId: string, sectionId: string, tabId: string, fieldId: string, index: number) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      const field = newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]?.fields[fieldId]

      if (field && field.options) {
        field.options = field.options.filter((_, i) => i !== index)
      }

      return newConfig
    })
  }

  // Add these functions for tracker management after the existing functions

  // Function to handle tracker item changes
  const handleTrackerItemChange = (index: number, field: string, value: string) => {
    if (!selectedTrackerGroup) return

    setTrackerData((prev) => {
      const newData = { ...prev }
      const items = [...newData[selectedTrackerGroup]]
      items[index] = { ...items[index], [field]: value }
      newData[selectedTrackerGroup] = items
      return newData
    })
  }

  // Function to add a new tracker item
  const handleAddTrackerItem = () => {
    if (!selectedTrackerGroup || Object.values(newTrackerItem).some((val) => !val)) return

    setTrackerData((prev) => {
      const newData = { ...prev }
      const items = [...newData[selectedTrackerGroup]]
      items.push({ ...newTrackerItem })
      newData[selectedTrackerGroup] = items
      return newData
    })

    // Reset the new tracker item form
    setNewTrackerItem({
      Name: "",
      Acronym: "",
      "Common Units": "",
      "Common Units Full Name": "",
      "Entry Text": "",
    })
    setIsAddingNewTracker(false)
  }

  // Function to delete a tracker item
  const handleDeleteTrackerItem = (index: number) => {
    if (!selectedTrackerGroup) return

    if (confirm("Are you sure you want to delete this tracker item?")) {
      setTrackerData((prev) => {
        const newData = { ...prev }
        const items = [...newData[selectedTrackerGroup]]
        items.splice(index, 1)
        newData[selectedTrackerGroup] = items
        return newData
      })
    }
  }

  // Function to handle tracker group changes
  const handleTrackerGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrackerGroup(e.target.value)
  }

  // Function to add a new tracker group
  const handleAddTrackerGroup = () => {
    const groupName = prompt("Enter the name for the new tracker group:")
    if (!groupName) return

    setTrackerData((prev) => {
      const newData = { ...prev }
      newData[groupName] = []
      return newData
    })

    setSelectedTrackerGroup(groupName)
  }

  // Function to delete a tracker group
  const handleDeleteTrackerGroup = () => {
    if (!selectedTrackerGroup) return

    if (confirm(`Are you sure you want to delete the "${selectedTrackerGroup}" group and all its items?`)) {
      setTrackerData((prev) => {
        const newData = { ...prev }
        delete newData[selectedTrackerGroup]

        // Select another group if available
        const groups = Object.keys(newData)
        if (groups.length > 0) {
          setSelectedTrackerGroup(groups[0])
        } else {
          setSelectedTrackerGroup("")
        }

        return newData
      })
    }
  }

  // Function to reset tracker data to defaults
  const resetTrackerDataHandler = () => {
    if (confirm("Are you sure you want to reset all tracker data to defaults?")) {
      const defaultData = resetTrackerData()
      setTrackerData(defaultData)

      if (Object.keys(defaultData).length > 0) {
        setSelectedTrackerGroup(Object.keys(defaultData)[0])
      }

      setConfigMessage({ type: "success", text: "Tracker data reset to defaults." })
      setTimeout(() => setConfigMessage(null), 3000)
    }
  }

  // Function to handle drag end for reordering
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTrackerData((prev) => {
        const newData = { ...prev }
        const items = [...newData[selectedTrackerGroup]]

        const oldIndex = items.findIndex((item, index) => `item-${index}` === active.id)
        const newIndex = items.findIndex((item, index) => `item-${index}` === over.id)

        newData[selectedTrackerGroup] = arrayMove(items, oldIndex, newIndex)
        return newData
      })
    }
  }

  // Save tracker data
  const saveTrackerDataHandler = async () => {
    try {
      const success = await saveTrackerData(trackerData)

      if (success) {
        setConfigMessage({ type: "success", text: "Tracker data saved successfully!" })
      } else {
        setConfigMessage({ type: "error", text: "Error saving tracker data. Please try again." })
      }
      setTimeout(() => setConfigMessage(null), 3000)
    } catch (error) {
      console.error("Error saving tracker data:", error)
      setConfigMessage({ type: "error", text: "Error saving tracker data. Please try again." })
      setTimeout(() => setConfigMessage(null), 3000)
    }
  }

  // Render field editor
  const renderFieldEditor = (
    pageId: string,
    sectionId: string,
    tabId: string,
    fieldId: string,
    field: FormFieldConfig,
  ) => {
    const isEditing = editingField === `${pageId}.${sectionId}.${tabId}.${fieldId}`
    const key = `${pageId}.${sectionId}.${tabId}.${fieldId}`

    return (
      <div
        key={fieldId}
        className={`border rounded-lg p-3 mb-2 ${field.enabled ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700 opacity-70"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`field-enabled-${fieldId}`}
              checked={field.enabled}
              onChange={() => toggleFieldEnabled(pageId, sectionId, tabId, fieldId)}
              className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`field-enabled-${fieldId}`} className="font-medium">
              {field.label} ({field.id})
            </label>
          </div>
          <div className="flex items-center">
            {isEditing ? (
              <button
                onClick={() => setEditingField(null)}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <Check size={18} />
              </button>
            ) : (
              <button
                onClick={() => setEditingField(`${pageId}.${sectionId}.${tabId}.${fieldId}`)}
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Edit size={18} />
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-3 space-y-3 border-t pt-3 dark:border-gray-600">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>

            {field.placeholder !== undefined && (
              <div>
                <label className="block text-sm font-medium mb-1">Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Required</label>
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { required: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(pageId, sectionId, tabId, fieldId, {
                    type: e.target.value as
                      | "type_na"
                      | "text"
                      | "number"
                      | "select"
                      | "checkbox"
                      | "textarea"
                      | "date"
                      | "time"
                      | "color"
                      | "measurementType"
                      | "tracker",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              >
                <option value="type_na">Value_na</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="textarea">Textarea</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="color">Color</option>
                <option value="measurementType">Measurement Type</option>
                <option value="tracker">Tracker</option>
              </select>
            </div>

            {field.type === "calculated" && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Calculation Settings</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`field-calculated-${fieldId}`}
                    checked={field.isCalculated}
                    onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { isCalculated: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`field-calculated-${fieldId}`} className="ml-2 text-sm">
                    This field is automatically calculated
                  </label>
                </div>

                {field.isCalculated && (
                  <FormulaBuilder
                    field={field}
                    availableFields={Object.values(
                      localConfig.pages[pageId].sections[sectionId].tabs[tabId].fields,
                    ).filter((f) => f.id !== field.id)}
                    onChange={(formula) =>
                      updateField(pageId, sectionId, tabId, fieldId, { calculationFormula: formula })
                    }
                  />
                )}
              </div>
            )}

            {field.type === "measurementType" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Measurement Type</label>
                  <select
                    value={field.measurementType || ""}
                    onChange={(e) => {
                      const newMeasurementType = e.target.value
                      // Prompt the user before changing the measurement type
                      if (
                        confirm(
                          "Changing the measurement type will reset the associated values. Are you sure you want to continue?",
                        )
                      ) {
                        const measurement = healthMeasurements.find((m) => m.Acronym === newMeasurementType)
                        if (measurement) {
                          updateMeasurementType(pageId, sectionId, tabId, fieldId, newMeasurementType)
                          setSelectedCommonUnits((prev) => ({
                            ...prev,
                            [key]: measurement["Common Units"].split(",")[0].trim(),
                          }))
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  >
                    <option value="">Select Measurement Type</option>
                    {healthMeasurements.map((measurement) => (
                      <option key={measurement.Acronym} value={measurement.Acronym}>
                        {measurement.Name} ({measurement["Common Units"]})
                      </option>
                    ))}
                  </select>
                </div>
                {renderCommonUnitsDropdown(pageId, sectionId, tabId, fieldId, field)}
              </>
            )}

            {field.type === "tracker" && (
              <div>
                <label className="block text-sm font-medium mb-1">Tracker Group</label>
                <input
                  type="text"
                  value={field.trackerGroup || ""}
                  onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { trackerGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            )}

            {(field.type === "select" || field.type === "checkbox") && (
              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center mb-4">
                    <div className="w-full mr-2">
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        Option Label
                      </label>
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const newLabel = e.target.value
                          // Auto-generate value from label (lowercase, replace spaces with underscores)
                          const newValue = newLabel.toLowerCase().replace(/\s+/g, "_")
                          handleUpdateOption(pageId, sectionId, tabId, fieldId, index, {
                            label: newLabel,
                            value: newValue,
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Value: {option.value} <span className="italic">(auto-generated)</span>
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleDeleteOption(pageId, sectionId, tabId, fieldId, index)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mb-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => handleAddOption(pageId, sectionId, tabId, fieldId)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Option
                </button>
              </div>
            )}

            {field.helpText !== undefined && (
              <div>
                <label className="block text-sm font-medium mb-1">Help Text</label>
                <input
                  type="text"
                  value={field.helpText}
                  onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { helpText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={field.order}
                onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
            </div>
            {/* Timer Settings */}
            {(field.type === "number" || field.type === "time") && (
              <div className="mt-3 border-t pt-3 dark:border-gray-600">
                <h4 className="font-medium mb-2">Timer Settings</h4>

                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`field-timer-${fieldId}`}
                    checked={field.enableTimer || false}
                    onChange={(e) => updateField(pageId, sectionId, tabId, fieldId, { enableTimer: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`field-timer-${fieldId}`} className="ml-2 text-sm">
                    Enable timer for this field
                  </label>
                </div>

                {field.enableTimer && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Timer Format</label>
                      <select
                        value={field.timerFormat || "mm:ss.t"}
                        onChange={(e) =>
                          updateField(pageId, sectionId, tabId, fieldId, {
                            timerFormat: e.target.value as "mm:ss" | "mm:ss.t" | "hh:mm:ss",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      >
                        <option value="mm:ss">Minutes:Seconds (00:00)</option>
                        <option value="mm:ss.t">Minutes:Seconds.Tenths (00:00.0)</option>
                        <option value="hh:mm:ss">Hours:Minutes:Seconds (00:00:00)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Timer Controls</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`timer-start-${fieldId}`}
                            checked={field.timerControls?.start || false}
                            onChange={(e) => {
                              const currentControls = field.timerControls || {
                                start: false,
                                pause: false,
                                reset: false,
                                fullWidth: false,
                                largeDisplay: false,
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerControls: { ...currentControls, start: e.target.checked },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`timer-start-${fieldId}`} className="ml-2 text-sm">
                            Start Button
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`timer-pause-${fieldId}`}
                            checked={field.timerControls?.pause || false}
                            onChange={(e) => {
                              const currentControls = field.timerControls || {
                                start: false,
                                pause: false,
                                reset: false,
                                fullWidth: false,
                                largeDisplay: false,
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerControls: { ...currentControls, pause: e.target.checked },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`timer-pause-${fieldId}`} className="ml-2 text-sm">
                            Pause Button
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`timer-reset-${fieldId}`}
                            checked={field.timerControls?.reset || false}
                            onChange={(e) => {
                              const currentControls = field.timerControls || {
                                start: false,
                                pause: false,
                                reset: false,
                                fullWidth: false,
                                largeDisplay: false,
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerControls: { ...currentControls, reset: e.target.checked },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`timer-reset-${fieldId}`} className="ml-2 text-sm">
                            Reset Button
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`timer-fullwidth-${fieldId}`}
                            checked={field.timerControls?.fullWidth || false}
                            onChange={(e) => {
                              const currentControls = field.timerControls || {
                                start: false,
                                pause: false,
                                reset: false,
                                fullWidth: false,
                                largeDisplay: false,
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerControls: { ...currentControls, fullWidth: e.target.checked },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`timer-fullwidth-${fieldId}`} className="ml-2 text-sm">
                            Full Width
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`timer-largedisplay-${fieldId}`}
                            checked={field.timerControls?.largeDisplay || false}
                            onChange={(e) => {
                              const currentControls = field.timerControls || {
                                start: false,
                                pause: false,
                                reset: false,
                                fullWidth: false,
                                largeDisplay: false,
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerControls: { ...currentControls, largeDisplay: e.target.checked },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`timer-largedisplay-${fieldId}`} className="ml-2 text-sm">
                            Large Display
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Display Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Size</label>
                          <select
                            value={field.timerDisplayStyle?.fontSize || "medium"}
                            onChange={(e) => {
                              const currentStyle = field.timerDisplayStyle || {
                                fontSize: "medium",
                                fontColor: "text-blue-600",
                                backgroundColor: "bg-gray-100",
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerDisplayStyle: {
                                  ...currentStyle,
                                  fontSize: e.target.value as "small" | "medium" | "large",
                                },
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">Font Color</label>
                          <select
                            value={field.timerDisplayStyle?.fontColor || "text-blue-600"}
                            onChange={(e) => {
                              const currentStyle = field.timerDisplayStyle || {
                                fontSize: "medium",
                                fontColor: "text-blue-600",
                                backgroundColor: "bg-gray-100",
                              }
                              updateField(pageId, sectionId, tabId, fieldId, {
                                timerDisplayStyle: { ...currentStyle, fontColor: e.target.value },
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          >
                            <option value="text-blue-600">Blue</option>
                            <option value="text-green-600">Green</option>
                            <option value="text-red-600">Red</option>
                            <option value="text-orange-600">Orange</option>
                            <option value="text-purple-600">Purple</option>
                            <option value="text-gray-800">Black</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render tab configuration
  const renderTabConfig = (pageId: string, sectionId: string, tabId: TabConfig["id"], tab: TabConfig) => {
    const tabKey = `${pageId}.${sectionId}.${tabId}`
    const expanded = isExpanded(tabKey)

    return (
      <div
        key={tabId}
        className={`border rounded-lg p-3 mb-3 ${tab.enabled ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700 opacity-70"}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-grow">
            <input
              type="checkbox"
              id={`tab-enabled-${tabId}`}
              checked={tab.enabled}
              onChange={(e) => {
                e.stopPropagation()
                toggleTabEnabled(pageId, sectionId, tabId)
              }}
              className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex flex-col flex-grow mr-4">
              <div className="flex items-center cursor-pointer" onClick={() => toggleExpanded(tabKey)}>
                <label htmlFor={`tab-enabled-${tabId}`} className="font-medium cursor-pointer">
                  {tab.label}
                </label>
                <span className="text-xs text-gray-500 ml-2">({tab.id})</span>
              </div>
              {expanded && (
                <div className="mt-2 flex items-center">
                  <label htmlFor={`tab-name-${tabId}`} className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                    Display Name:
                  </label>
                  <input
                    id={`tab-name-${tabId}`}
                    type="text"
                    value={tab.label}
                    onChange={(e) => {
                      // Update the tab label while preserving the structured ID
                      setLocalConfig((prev) => {
                        const newConfig = { ...prev }
                        if (newConfig.pages[pageId]?.sections[sectionId]?.tabs[tabId]) {
                          newConfig.pages[pageId].sections[sectionId].tabs[tabId].label = e.target.value
                        }
                        return newConfig
                      })
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="cursor-pointer" onClick={() => toggleExpanded(tabKey)}>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Fields</h4>
            {Object.entries(tab.fields)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([fieldId, field]) => renderFieldEditor(pageId, sectionId, tabId, fieldId, field))}
          </div>
        )}
      </div>
    )
  }

  // Render section configuration
  const renderSectionConfig = (pageId: string, sectionId: string, section: SectionConfig) => {
    const sectionKey = `${pageId}.${sectionId}`
    const expanded = isExpanded(sectionKey)

    return (
      <div key={sectionId} className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex flex-col flex-grow mr-4">
            <div className="flex items-center cursor-pointer" onClick={() => toggleExpanded(sectionKey)}>
              <h3 className="text-lg font-semibold">{section.label}</h3>
              <span className="text-xs text-gray-500 ml-2">({section.id})</span>
            </div>
            {expanded && (
              <div className="mt-2 flex items-center">
                <label htmlFor={`section-name-${sectionId}`} className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  Display Name:
                </label>
                <input
                  id={`section-name-${sectionId}`}
                  type="text"
                  value={section.label}
                  onChange={(e) => {
                    // Update the section label while preserving the structured ID
                    setLocalConfig((prev) => {
                      const newConfig = { ...prev }
                      if (newConfig.pages[pageId]?.sections[sectionId]) {
                        newConfig.pages[pageId].sections[sectionId].label = e.target.value
                      }
                      return newConfig
                    })
                  }}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <div className="cursor-pointer" onClick={() => toggleExpanded(sectionKey)}>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Tabs</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addNewTab(pageId, sectionId)
                }}
                className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
              >
                <Plus size={14} className="mr-1" />
                Add Tab
              </button>
            </div>
            {Object.entries(section.tabs)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([tabId, tab]) => renderTabConfig(pageId, sectionId, tabId, tab))}
          </div>
        )}
      </div>
    )
  }

  // Render page configuration
  const renderPageConfig = (pageId: string, page: PageConfig) => {
    const pageKey = pageId
    const expanded = isExpanded(pageKey)

    return (
      <div key={pageId} className="border rounded-lg p-4 mb-6 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpanded(pageKey)}>
          <h2 className="text-xl font-bold">
            {page.label} ({page.id})
          </h2>
          <div>{expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}</div>
        </div>

        {expanded && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Sections</h3>
            {Object.entries(page.sections)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([sectionId, section]) => renderSectionConfig(pageId, sectionId, section))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Configuration settings are saved to your device and will persist between sessions.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "general"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General Settings
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "forms"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab("forms")}
          >
            Form Fields
          </button>
          {/* Add the new tab button in the tab navigation section */}
          {/* Add this after the existing tab buttons in the tab navigation section */}
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "trackers"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab("trackers")}
          >
            Tracker List
          </button>
        </div>
      </div>

      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Appearance</h3>

            <div className="space-y-2">
              <label htmlFor="headerText" className="font-medium block">
                Header Text
              </label>
              <input
                type="text"
                id="headerText"
                value={localConfig.appearance.headerText}
                onChange={(e) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, headerText: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The main header text displayed at the top of the app
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="subheaderText" className="font-medium block">
                Subheader Text
              </label>
              <input
                type="text"
                id="subheaderText"
                value={localConfig.appearance.subheaderText}
                onChange={(e) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, subheaderText: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The secondary text displayed below the main header
              </p>
            </div>

            <div className="flex justify-between items-center">
              <label htmlFor="darkMode" className="font-medium">
                Dark Mode
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input
                  type="checkbox"
                  id="darkMode"
                  className="absolute w-0 h-0 opacity-0"
                  checked={localConfig.appearance.darkMode}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, darkMode: e.target.checked },
                    }))
                  }
                />
                <label
                  htmlFor="darkMode"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                    localConfig.appearance.darkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
                      localConfig.appearance.darkMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label htmlFor="highContrastMode" className="font-medium">
                High Contrast Mode
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input
                  type="checkbox"
                  id="highContrastMode"
                  className="absolute w-0 h-0 opacity-0"
                  checked={localConfig.appearance.highContrastMode}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, highContrastMode: e.target.checked },
                    }))
                  }
                />
                <label
                  htmlFor="highContrastMode"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                    localConfig.appearance.highContrastMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
                      localConfig.appearance.highContrastMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Data Management</h3>

            <div className="space-y-2">
              <label htmlFor="dataRetention" className="font-medium block">
                Data Retention (days)
              </label>
              <input
                type="number"
                id="dataRetention"
                min="30"
                max="3650"
                value={localConfig.dataManagement.dataRetentionDays}
                onChange={(e) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    dataManagement: {
                      ...prev.dataManagement,
                      dataRetentionDays: Math.max(30, Math.min(3650, Number.parseInt(e.target.value) || 365)),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Data older than this will be eligible for automatic cleanup. Minimum: 30 days, Maximum: 10 years (3650
                days)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="autoBackupFrequency" className="font-medium block">
                Auto-Backup Frequency (minutes)
              </label>
              <input
                type="number"
                id="autoBackupFrequency"
                min="5"
                max="1440"
                value={localConfig.dataManagement.autoBackupFrequency}
                onChange={(e) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    dataManagement: {
                      ...prev.dataManagement,
                      autoBackupFrequency: Math.max(5, Math.min(1440, Number.parseInt(e.target.value) || 10)),
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How often automatic backups are created while using the app. Minimum: 5 minutes, Maximum: 1440 minutes
                (24 hours)
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Export/Import Configuration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={exportConfiguration}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Download size={18} className="mr-2" />
                  Export
                </button>
                <label className="block">
                  <span className="sr-only">Choose file</span>
                  <input
                    type="file"
                    className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md
                    file:border-0
                    file:text-sm
                    file:font-semibold
                    file:bg-blue-500 file:text-white
                    hover:file:bg-blue-700
                    cursor-pointer"
                    accept="application/json"
                    onChange={importConfiguration}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "forms" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Form field configuration allows you to customize the fields in each entry form. You can enable/disable
              fields, change labels, and adjust validation settings.
            </p>
          </div>

          {Object.entries(localConfig.pages)
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([pageId, page]) => renderPageConfig(pageId, page))}
        </div>
      )}

      {activeTab === "trackers" && (
        <div className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Manage and customize your tracker lists. Add new groups, reorder items, and edit details to fit your
              specific tracking needs.
            </p>
          </div>

          {loading ? (
            <div className="p-4">Loading tracker configuration...</div>
          ) : error ? (
            <div className="p-4 text-red-500">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
              <p className="mt-4">Using default configuration instead.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label
                    htmlFor="trackerGroupSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Select Tracker Group:
                  </label>
                  <select
                    id="trackerGroupSelect"
                    value={selectedTrackerGroup}
                    onChange={handleTrackerGroupChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-gray-200"
                  >
                    {Object.keys(trackerData).map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={handleAddTrackerGroup}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Group
                  </button>
                  <button
                    onClick={handleDeleteTrackerGroup}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete Group
                  </button>
                </div>
              </div>

              {selectedTrackerGroup && (
                <>
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={trackerData[selectedTrackerGroup].map((item, index) => `item-${index}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {trackerData[selectedTrackerGroup].map((item, index) => (
                          <SortableItem
                            key={`item-${index}`}
                            id={`item-${index}`}
                            index={index}
                            item={item}
                            selectedTrackerGroup={selectedTrackerGroup}
                            handleTrackerItemChange={handleTrackerItemChange}
                            handleDeleteTrackerItem={handleDeleteTrackerItem}
                            editingTracker={editingTracker}
                            setEditingTracker={setEditingTracker}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {isAddingNewTracker ? (
                    <div className="border rounded-lg p-3 mb-2 bg-white dark:bg-gray-800">
                      <h4 className="font-medium mb-2">New Tracker Item</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(newTrackerItem).map((field) => (
                          <div key={field}>
                            <label className="block text-sm font-medium mb-1">{field}</label>
                            <input
                              type="text"
                              value={newTrackerItem[field]}
                              onChange={(e) => setNewTrackerItem({ ...newTrackerItem, [field]: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => setIsAddingNewTracker(false)}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddTrackerItem}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingNewTracker(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                    >
                      <Plus size={14} className="mr-1" />
                      Add New Tracker Item
                    </button>
                  )}

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={resetTrackerDataHandler}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                    >
                      <RotateCcw size={18} className="mr-2" />
                      Reset to Defaults
                    </button>
                    <button
                      onClick={saveTrackerDataHandler}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      Save Tracker Data
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {configMessage && (
        <div
          className={`p-3 rounded-md mb-4 ${
            configMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {configMessage.type === "success" ? (
            <Check className="inline-block mr-2" size={16} />
          ) : (
            <AlertTriangle className="inline-block mr-2" size={16} />
          )}
          {configMessage.text}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t dark:border-gray-700">
        <button
          onClick={resetConfiguration}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
        >
          <RotateCcw size={18} className="mr-2" />
          Reset to Defaults
        </button>
        <button
          onClick={saveConfiguration}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Save size={18} className="mr-2" />
          Save Configuration
        </button>
      </div>
    </div>
  )
}

export default Configuration
