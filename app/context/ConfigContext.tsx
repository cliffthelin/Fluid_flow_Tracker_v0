"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { MEASUREMENT_OPTIONS, type MeasurementOption } from "../constants/measurements"

export interface EntryTabConfig {
  id: string
  title: string
  type: "basic" | "fluid" | "kegel" | "custom"
  enabled: boolean
}

interface ConfigContextType {
  appTitle: string
  setAppTitle: (title: string) => void
  appSlogan: string
  setAppSlogan: (slogan: string) => void
  menuTitleEntry: string
  setMenuTitleEntry: (title: string) => void
  menuTitleStats: string
  setMenuTitleStats: (title: string) => void
  menuTitleData: string
  setMenuTitleData: (title: string) => void
  menuTitleResources: string
  setMenuTitleResources: (title: string) => void
  menuTitleHelp: string
  setMenuTitleHelp: (title: string) => void
  entryTabs: EntryTabConfig[]
  setEntryTabs: (tabs: EntryTabConfig[]) => void
  addEntryTab: (tab: EntryTabConfig) => void
  updateEntryTab: (id: string, updates: Partial<EntryTabConfig>) => void
  removeEntryTab: (id: string) => void
  measurementOptions: MeasurementOption[]
  // New configuration options
  uroLogMeasurement: string
  setUroLogMeasurement: (measurement: string) => void
  uroLogUnit: string
  setUroLogUnit: (unit: string) => void
  saveConfig: () => void
}

const defaultEntryTabs: EntryTabConfig[] = [
  { id: "basic", title: "UroLog Entry", type: "basic", enabled: true },
  { id: "fluid", title: "HydroLog", type: "fluid", enabled: true },
  { id: "kegel", title: "KegelLog", type: "kegel", enabled: true },
]

const defaultConfig = {
  appTitle: "My Uro Log",
  setAppTitle: () => {},
  appSlogan: "Monitor Your Urological Health",
  setAppSlogan: () => {},
  menuTitleEntry: "Add Entry",
  setMenuTitleEntry: () => {},
  menuTitleStats: "Stats",
  setMenuTitleStats: () => {},
  menuTitleData: "Data",
  setMenuTitleData: () => {},
  menuTitleResources: "Resources",
  setMenuTitleResources: () => {},
  menuTitleHelp: "Help",
  setMenuTitleHelp: () => {},
  entryTabs: defaultEntryTabs,
  setEntryTabs: () => {},
  addEntryTab: () => {},
  updateEntryTab: () => {},
  removeEntryTab: () => {},
  measurementOptions: MEASUREMENT_OPTIONS,
  // Default to Urine Volume measurement
  uroLogMeasurement: "Urine Volume",
  setUroLogMeasurement: () => {},
  uroLogUnit: "mL",
  setUroLogUnit: () => {},
  saveConfig: () => {},
}

const ConfigContext = createContext<ConfigContextType>(defaultConfig)

export const useConfig = () => useContext(ConfigContext)

interface ConfigProviderProps {
  children: ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [appTitle, setAppTitle] = useState<string>(defaultConfig.appTitle)
  const [appSlogan, setAppSlogan] = useState<string>(defaultConfig.appSlogan)
  const [menuTitleEntry, setMenuTitleEntry] = useState<string>(defaultConfig.menuTitleEntry)
  const [menuTitleStats, setMenuTitleStats] = useState<string>(defaultConfig.menuTitleStats)
  const [menuTitleData, setMenuTitleData] = useState<string>(defaultConfig.menuTitleData)
  const [menuTitleResources, setMenuTitleResources] = useState<string>(defaultConfig.menuTitleResources)
  const [menuTitleHelp, setMenuTitleHelp] = useState<string>(defaultConfig.menuTitleHelp)
  const [entryTabs, setEntryTabs] = useState<EntryTabConfig[]>(defaultEntryTabs)
  const [isInitialized, setIsInitialized] = useState(false)
  // New state for UroLog measurement configuration
  const [uroLogMeasurement, setUroLogMeasurement] = useState<string>("Urine Volume")
  const [uroLogUnit, setUroLogUnit] = useState<string>("mL")

  // Load config from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("app_config")
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          if (parsedConfig.appTitle) {
            setAppTitle(parsedConfig.appTitle)
          }
          if (parsedConfig.appSlogan) {
            setAppSlogan(parsedConfig.appSlogan)
          }
          if (parsedConfig.menuTitleEntry) {
            setMenuTitleEntry(parsedConfig.menuTitleEntry)
          }
          if (parsedConfig.menuTitleStats) {
            setMenuTitleStats(parsedConfig.menuTitleStats)
          }
          if (parsedConfig.menuTitleData) {
            setMenuTitleData(parsedConfig.menuTitleData)
          }
          if (parsedConfig.menuTitleResources) {
            setMenuTitleResources(parsedConfig.menuTitleResources)
          }
          if (parsedConfig.menuTitleHelp) {
            setMenuTitleHelp(parsedConfig.menuTitleHelp)
          }
          if (parsedConfig.entryTabs) {
            // Ensure we always have the default tabs
            const savedTabs = parsedConfig.entryTabs
            const mergedTabs = [...defaultEntryTabs]

            // Update existing tabs from saved config
            for (let i = 0; i < mergedTabs.length; i++) {
              const savedTab = savedTabs.find((tab) => tab.id === mergedTabs[i].id)
              if (savedTab) {
                mergedTabs[i] = { ...mergedTabs[i], ...savedTab }
              }
            }

            // Add any new custom tabs
            savedTabs.forEach((savedTab) => {
              if (!mergedTabs.some((tab) => tab.id === savedTab.id) && savedTab.type === "custom") {
                mergedTabs.push(savedTab)
              }
            })

            setEntryTabs(mergedTabs)
          }
          // Load UroLog measurement configuration
          if (parsedConfig.uroLogMeasurement) {
            setUroLogMeasurement(parsedConfig.uroLogMeasurement)
          }
          if (parsedConfig.uroLogUnit) {
            setUroLogUnit(parsedConfig.uroLogUnit)
          }
        }
      } catch (error) {
        console.error("Error loading config:", error)
      }
      setIsInitialized(true)
    }
  }, [])

  // Entry tab management functions
  const addEntryTab = (tab: EntryTabConfig) => {
    setEntryTabs((prev) => [...prev, tab])
  }

  const updateEntryTab = (id: string, updates: Partial<EntryTabConfig>) => {
    setEntryTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)))
  }

  const removeEntryTab = (id: string) => {
    // Don't allow removing default tabs
    if (["basic", "fluid", "kegel"].includes(id)) {
      return
    }
    setEntryTabs((prev) => prev.filter((tab) => tab.id !== id))
  }

  // Save config to localStorage
  const saveConfig = () => {
    if (typeof window !== "undefined") {
      try {
        const configToSave = {
          appTitle,
          appSlogan,
          menuTitleEntry,
          menuTitleStats,
          menuTitleData,
          menuTitleResources,
          menuTitleHelp,
          entryTabs,
          uroLogMeasurement,
          uroLogUnit,
        }
        localStorage.setItem("app_config", JSON.stringify(configToSave))
        alert("Settings saved successfully!")
      } catch (error) {
        console.error("Error saving config:", error)
        alert("Failed to save settings. Please try again.")
      }
    }
  }

  return (
    <ConfigContext.Provider
      value={{
        appTitle,
        setAppTitle,
        appSlogan,
        setAppSlogan,
        menuTitleEntry,
        setMenuTitleEntry,
        menuTitleStats,
        setMenuTitleStats,
        menuTitleData,
        setMenuTitleData,
        menuTitleResources,
        setMenuTitleResources,
        menuTitleHelp,
        setMenuTitleHelp,
        entryTabs,
        setEntryTabs,
        addEntryTab,
        updateEntryTab,
        removeEntryTab,
        measurementOptions: MEASUREMENT_OPTIONS,
        uroLogMeasurement,
        setUroLogMeasurement,
        uroLogUnit,
        setUroLogUnit,
        saveConfig,
      }}
    >
      {isInitialized ? children : null}
    </ConfigContext.Provider>
  )
}
