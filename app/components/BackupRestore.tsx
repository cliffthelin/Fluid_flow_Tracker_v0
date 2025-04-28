"use client"

import type React from "react"

import { useState } from "react"
import { Save, Upload, Check, AlertCircle } from "lucide-react"
import type { UroLog } from "../types"

interface BackupRestoreProps {
  entries: UroLog[]
  setEntries: (entries: UroLog[]) => void
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ entries, setEntries }) => {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const createBackup = () => {
    try {
      const data = {
        version: 2,
        timestamp: new Date().toISOString(),
        entries,
        metadata: {
          displayOrder: {
            tabs: getTabDisplayOrder(),
            sections: getSectionDisplayOrder(),
            fields: getFieldDisplayOrder(),
          },
          activeStatus: {
            tabs: getTabActiveStatus(),
            sections: getSectionActiveStatus(),
            fields: getFieldActiveStatus(),
          },
        },
      }

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Format date as MMDDYY_HHMM
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      const year = String(now.getFullYear()).slice(-2)
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      const dateTimeStr = `${month}${day}${year}_${hours}${minutes}`

      link.download = `my-uro-log-backup_${dateTimeStr}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup created successfully!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create backup. Please try again." })
    }
  }

  // Helper function to get tab display order from localStorage
  const getTabDisplayOrder = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const tabOrder = {}

      // Extract tab display order from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              if (section.tabs) {
                Object.entries(section.tabs).forEach(([tabId, tab]) => {
                  tabOrder[`${pageId}.${sectionId}.${tabId}`] = tab.order
                })
              }
            })
          }
        })
      }

      return tabOrder
    } catch (error) {
      console.error("Error getting tab display order:", error)
      return {}
    }
  }

  // Helper function to get section display order from localStorage
  const getSectionDisplayOrder = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const sectionOrder = {}

      // Extract section display order from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              sectionOrder[`${pageId}.${sectionId}`] = section.order
            })
          }
        })
      }

      return sectionOrder
    } catch (error) {
      console.error("Error getting section display order:", error)
      return {}
    }
  }

  // Helper function to get field display order from localStorage
  const getFieldDisplayOrder = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const fieldOrder = {}

      // Extract field display order from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              if (section.tabs) {
                Object.entries(section.tabs).forEach(([tabId, tab]) => {
                  if (tab.fields) {
                    Object.entries(tab.fields).forEach(([fieldId, field]) => {
                      fieldOrder[`${pageId}.${sectionId}.${tabId}.${fieldId}`] = field.order
                    })
                  }
                })
              }
            })
          }
        })
      }

      return fieldOrder
    } catch (error) {
      console.error("Error getting field display order:", error)
      return {}
    }
  }

  // Helper function to get tab active status from localStorage
  const getTabActiveStatus = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const tabStatus = {}

      // Extract tab active status from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              if (section.tabs) {
                Object.entries(section.tabs).forEach(([tabId, tab]) => {
                  tabStatus[`${pageId}.${sectionId}.${tabId}`] = tab.enabled
                })
              }
            })
          }
        })
      }

      return tabStatus
    } catch (error) {
      console.error("Error getting tab active status:", error)
      return {}
    }
  }

  // Helper function to get section active status from localStorage
  const getSectionActiveStatus = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const sectionStatus = {}

      // Extract section active status from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              sectionStatus[`${pageId}.${sectionId}`] = section.enabled
            })
          }
        })
      }

      return sectionStatus
    } catch (error) {
      console.error("Error getting section active status:", error)
      return {}
    }
  }

  // Helper function to get field active status from localStorage
  const getFieldActiveStatus = () => {
    try {
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      const fieldStatus = {}

      // Extract field active status from config
      if (appConfig.pages) {
        Object.entries(appConfig.pages).forEach(([pageId, page]) => {
          if (page.sections) {
            Object.entries(page.sections).forEach(([sectionId, section]) => {
              if (section.tabs) {
                Object.entries(section.tabs).forEach(([tabId, tab]) => {
                  if (tab.fields) {
                    Object.entries(tab.fields).forEach(([fieldId, field]) => {
                      fieldStatus[`${pageId}.${sectionId}.${tabId}.${fieldId}`] = field.enabled
                    })
                  }
                })
              }
            })
          }
        })
      }

      return fieldStatus
    } catch (error) {
      console.error("Error getting field active status:", error)
      return {}
    }
  }

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (!data.entries || !Array.isArray(data.entries)) {
          throw new Error("Invalid backup file format")
        }

        // Validate entries
        const validEntries = data.entries.filter((entry: any) => {
          return (
            typeof entry.timestamp === "string" &&
            typeof entry.volume === "number" &&
            typeof entry.duration === "number" &&
            typeof entry.flowRate === "number"
          )
        })

        if (validEntries.length === 0) {
          throw new Error("No valid entries found in backup")
        }

        if (confirm(`Restore ${validEntries.length} entries from backup? This will replace your current data.`)) {
          setEntries(validEntries)

          // If metadata exists in the backup, restore display order and active status
          if (data.metadata) {
            restoreDisplayOrderAndStatus(data.metadata)
          }

          setMessage({ type: "success", text: `Successfully restored ${validEntries.length} entries!` })
          setTimeout(() => setMessage(null), 3000)
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to restore backup. Invalid file format." })
        setTimeout(() => setMessage(null), 3000)
      }
    }

    reader.readAsText(file)
    // Reset the input
    event.target.value = ""
  }

  // Helper function to restore display order and active status
  const restoreDisplayOrderAndStatus = (metadata: any) => {
    try {
      // Get current app config
      const appConfig = JSON.parse(localStorage.getItem("appConfig") || "{}")
      let configUpdated = false

      // Update tab display order and active status
      if (metadata.displayOrder?.tabs && metadata.activeStatus?.tabs) {
        Object.entries(metadata.displayOrder.tabs).forEach(([path, order]) => {
          const [pageId, sectionId, tabId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
            appConfig.pages[pageId].sections[sectionId].tabs[tabId].order = order
            configUpdated = true
          }
        })

        Object.entries(metadata.activeStatus.tabs).forEach(([path, enabled]) => {
          const [pageId, sectionId, tabId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]) {
            appConfig.pages[pageId].sections[sectionId].tabs[tabId].enabled = enabled
            configUpdated = true
          }
        })
      }

      // Update section display order and active status
      if (metadata.displayOrder?.sections && metadata.activeStatus?.sections) {
        Object.entries(metadata.displayOrder.sections).forEach(([path, order]) => {
          const [pageId, sectionId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]) {
            appConfig.pages[pageId].sections[sectionId].order = order
            configUpdated = true
          }
        })

        Object.entries(metadata.activeStatus.sections).forEach(([path, enabled]) => {
          const [pageId, sectionId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]) {
            appConfig.pages[pageId].sections[sectionId].enabled = enabled
            configUpdated = true
          }
        })
      }

      // Update field display order and active status
      if (metadata.displayOrder?.fields && metadata.activeStatus?.fields) {
        Object.entries(metadata.displayOrder.fields).forEach(([path, order]) => {
          const [pageId, sectionId, tabId, fieldId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
            appConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].order = order
            configUpdated = true
          }
        })

        Object.entries(metadata.activeStatus.fields).forEach(([path, enabled]) => {
          const [pageId, sectionId, tabId, fieldId] = path.split(".")
          if (appConfig.pages?.[pageId]?.sections?.[sectionId]?.tabs?.[tabId]?.fields?.[fieldId]) {
            appConfig.pages[pageId].sections[sectionId].tabs[tabId].fields[fieldId].enabled = enabled
            configUpdated = true
          }
        })
      }

      // Save updated config if changes were made
      if (configUpdated) {
        localStorage.setItem("appConfig", JSON.stringify(appConfig))
        console.log("Display order and active status restored successfully")
      }
    } catch (error) {
      console.error("Error restoring display order and active status:", error)
    }
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">Backup & Restore</h3>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <p>
          <strong>Backup (JSON):</strong> Creates a file with all your data, display order, and active status settings
          that you can save to your device.
        </p>
        <p className="mt-1">
          <strong>Restore (JSON):</strong> Loads data and settings from a previously created backup file.
        </p>
      </div>

      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-4">
          <button
            onClick={createBackup}
            className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center"
          >
            <Save className="mr-2" /> Backup to JSON
          </button>
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="w-full p-3 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center cursor-pointer">
            <Upload className="mr-2" /> Restore from JSON
            <input type="file" accept=".json" onChange={restoreBackup} className="hidden" />
          </label>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded flex items-center ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check size={18} className="mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}

export default BackupRestore
