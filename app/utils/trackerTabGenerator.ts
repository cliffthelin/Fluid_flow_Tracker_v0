import { getActiveTrackers } from "../services/trackerService"
import type { TabConfig, FormFieldConfig } from "../types/config"

/**
 * Generates tab configurations from active trackers
 */
export function generateTrackerTabs(): Record<string, TabConfig> {
  const activeTrackerGroups = getActiveTrackers()
  const tabs: Record<string, TabConfig> = {}

  activeTrackerGroups.forEach((group, groupIndex) => {
    // Create a tab ID based on the group name
    const tabId = `tab${groupIndex + 10}` // Start from tab10 to avoid conflicts with existing tabs

    // Create fields for this tab
    const fields: Record<string, FormFieldConfig> = {}

    group.items.forEach((item, itemIndex) => {
      const fieldId = `field${itemIndex + 1}`

      // Determine field type based on Common Units
      let fieldType: "text" | "number" | "select" | "checkbox" | "textarea" = "text"
      if (item["Common Units"].includes("1-10") || item["Common Units"].includes("scale")) {
        fieldType = "select"
      } else if (
        ["mL", "oz", "cm", "mm", "mg", "kg", "hours", "minutes", "seconds"].some((unit) =>
          item["Common Units"].includes(unit),
        )
      ) {
        fieldType = "number"
      } else if (item["Common Units"] === "boolean" || item["Common Units"] === "yes/no") {
        fieldType = "checkbox"
      } else if (item["Common Units"] === "text" && item["Entry Text"].length > 50) {
        fieldType = "textarea"
      }

      // Create options for select fields
      const options =
        fieldType === "select"
          ? Array.from({ length: 10 }, (_, i) => ({
              value: (i + 1).toString(),
              label: (i + 1).toString(),
            }))
          : undefined

      // Create the field configuration
      fields[fieldId] = {
        id: fieldId,
        label: item.Name,
        placeholder: `Enter ${item.Name.toLowerCase()}`,
        enabled: true,
        required: false,
        defaultValue: "",
        order: itemIndex + 1,
        type: fieldType,
        measurementType: item.Acronym,
        value_na: "Value_na",
        helpText: item["Entry Text"],
        options,
        commonUnits: item["Common Units"].split(",")[0].trim(),
      }
    })

    // Create the tab configuration
    tabs[tabId] = {
      id: tabId,
      label: group.group,
      icon: "activity", // Default icon
      enabled: true,
      order: groupIndex + 10, // Start from 10 to avoid conflicts with existing tabs
      fields,
    }
  })

  return tabs
}

/**
 * Updates the app configuration with tracker tabs
 */
export function updateConfigWithTrackerTabs(config: any): any {
  const trackerTabs = generateTrackerTabs()

  // Create a deep copy of the config
  const newConfig = JSON.parse(JSON.stringify(config))

  // Add tracker tabs to the first section of the first page
  if (newConfig.pages?.page1?.sections?.section1?.tabs) {
    // Remove any previously generated tracker tabs (tab10 and above)
    Object.keys(newConfig.pages.page1.sections.section1.tabs).forEach((tabId) => {
      if (tabId.startsWith("tab") && Number.parseInt(tabId.replace("tab", "")) >= 10) {
        delete newConfig.pages.page1.sections.section1.tabs[tabId]
      }
    })

    // Add the new tracker tabs
    Object.entries(trackerTabs).forEach(([tabId, tabConfig]) => {
      newConfig.pages.page1.sections.section1.tabs[tabId] = tabConfig
    })
  }

  return newConfig
}
