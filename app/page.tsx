"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import FlowEntryForm from "./components/FlowEntryForm"
import Stats from "./components/FluidStats"
import DataManagement, { generateDemoData, hasDemoData, deleteDemoData } from "./components/DataManagement"
import Resources from "./components/Resources"
import Help from "./components/Help"
import InstallPrompt from "./components/InstallPrompt"
import PWARegistration from "./components/PWARegistration"
import BottomNav from "./components/BottomNav"
import type { UroLog, HydroLog } from "./types"
import { addUroLog as dbAddUroLog, addHydroLog as dbAddHydroLog } from "./services/db"
import { Plus, BarChart, Database, BookMarked, BookOpen, Trash } from "lucide-react"

// Add imports for auto-backup system
import { createAutoBackup, restoreFromAutoBackup, hasAutoBackup } from "./services/autoBackup"

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [fontSize, setFontSize] = useState(0) // 0 is default, negative is smaller, positive is larger
  const [isLoading, setIsLoading] = useState(true)
  const [dataInitialized, setDataInitialized] = useState(false)
  const [activeSection, setActiveSection] = useState<"entry" | "stats" | "data" | "resources" | "help">("entry")
  const [dbCounts, setDbCounts] = useState<{ uroLogs: number; hydroLogs: number }>({ uroLogs: 0, hydroLogs: 0 })
  const [hasDemoDataState, setHasDemoDataState] = useState(false)

  // Update the useEffect that initializes the database to include auto-backup restoration
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true)
    }

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true")
    }

    // Load saved font size preference
    const savedFontSize = localStorage.getItem("fontSize")
    if (savedFontSize !== null) {
      setFontSize(Number.parseInt(savedFontSize))
    }

    // Initialize database
    const initDb = async () => {
      setIsLoading(true)
      try {
        // Import the database module
        const { migrateFromLocalStorage, db } = await import("./services/db")

        // Wait for the database to be ready
        await db.open()

        // Migrate data from localStorage if needed
        await migrateFromLocalStorage()

        // Check if we need to restore from auto-backup
        if (hasAutoBackup()) {
          await restoreFromAutoBackup()
        }

        setDataInitialized(true)

        // Create an auto-backup after successful initialization
        setTimeout(() => {
          createAutoBackup()
        }, 5000) // Wait 5 seconds to ensure everything is loaded
      } catch (error) {
        console.error("Error initializing database:", error)
        // Still set dataInitialized to true so the app can continue
        setDataInitialized(true)
      } finally {
        setIsLoading(false)
      }
    }

    initDb()

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Add a periodic auto-backup
  useEffect(() => {
    if (!isLoading && dataInitialized) {
      // Create auto-backup every 10 minutes while the app is open
      const backupInterval = setInterval(
        () => {
          createAutoBackup()
        },
        10 * 60 * 1000,
      )

      return () => clearInterval(backupInterval)
    }
  }, [isLoading, dataInitialized])

  useEffect(() => {
    if (!isLoading && dataInitialized) {
      // Check if there are any entries in the database
      const checkForEntries = async () => {
        try {
          const { db } = await import("./services/db")
          const uroLogCount = await db.uroLogs.count()
          const hydroLogCount = await db.hydroLogs.count()
          setDbCounts({ uroLogs: uroLogCount, hydroLogs: hydroLogCount })

          // Check if there's demo data
          const hasDemo = await hasDemoData()
          setHasDemoDataState(hasDemo)

          // If there are no entries, generate demo data and go to the help section
          if (uroLogCount === 0 && hydroLogCount === 0) {
            console.log("No entries found, generating demo data...")
            generateDemoData()
            setActiveSection("help")
          }
        } catch (error) {
          console.error("Error checking for entries:", error)
        }
      }

      checkForEntries()
    }
  }, [isLoading, dataInitialized])

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString())
    document.documentElement.style.setProperty("--font-size-adjustment", `${fontSize * 0.125}rem`)
  }, [fontSize])

  // Check for demo data periodically
  useEffect(() => {
    const checkDemoData = async () => {
      const hasDemo = await hasDemoData()
      setHasDemoDataState(hasDemo)
    }

    // Check initially and then every 5 seconds
    checkDemoData()
    const interval = setInterval(checkDemoData, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleDeleteDemoData = async () => {
    await deleteDemoData()
    setHasDemoDataState(false)

    // If we're on the data management page, refresh the data
    if (activeSection === "data") {
      // Force a re-render of the data management component
      setActiveSection("stats")
      setTimeout(() => {
        setActiveSection("data")
      }, 10)
    }
  }

  const addUroLog = async (entry: UroLog) => {
    try {
      // Add to IndexedDB
      await dbAddUroLog(entry)
      // Create a backup after adding new data
      createAutoBackup()
      // Navigate to stats page after saving
      setActiveSection("stats")
    } catch (error) {
      console.error("Error adding UroLog entry:", error)
      alert("Error saving entry. Please try again.")
    }
  }

  const addHydroLog = async (entry: HydroLog) => {
    try {
      // Add to IndexedDB
      await dbAddHydroLog(entry)
      // Create a backup after adding new data
      createAutoBackup()
      // Navigate to stats page after saving
      setActiveSection("stats")
    } catch (error) {
      console.error("Error adding HydroLog entry:", error)
      alert("Error saving entry. Please try again.")
    }
  }

  const fontSizeClass = `font-size-${fontSize}`

  // Render the components directly without CollapsibleSection wrappers
  return (
    <main className={`min-h-screen ${darkMode ? "dark" : ""} ${fontSizeClass} font-bold-enabled`}>
      <PWARegistration />
      <div className="bg-blue-50 dark:bg-slate-900 min-h-screen pb-32">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} />

        {/* Persistent Delete Demo Data button */}
        {hasDemoDataState && (
          <div className="fixed top-20 right-4 z-50">
            <button
              onClick={handleDeleteDemoData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center shadow-md"
            >
              <Trash className="mr-2" size={18} /> Delete Demo Data
            </button>
          </div>
        )}

        <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-32">
          {!isOnline && (
            <div className="mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-lg flex items-center justify-center shadow-sm animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              You're currently offline. Your data is saved locally.
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">Initializing My Uro Log...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSection === "entry" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <Plus className="mr-2 text-blue-500" size={24} />
                    <h2 className="text-xl font-semibold">Add New Entry</h2>
                  </div>
                  <FlowEntryForm addUroLog={addUroLog} addHydroLog={addHydroLog} />
                </div>
              )}

              {activeSection === "stats" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <BarChart className="mr-2 text-green-500" size={24} />
                    <h2 className="text-xl font-semibold">Stats</h2>
                  </div>
                  <Stats />
                </div>
              )}

              {activeSection === "data" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <Database className="mr-2 text-purple-500" size={24} />
                    <h2 className="text-xl font-semibold">Data Management</h2>
                  </div>
                  <DataManagement hasDemoDataState={hasDemoDataState} />
                </div>
              )}

              {activeSection === "resources" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <BookOpen className="mr-2 text-cyan-500" size={24} />
                    <h2 className="text-xl font-semibold">Resources</h2>
                  </div>
                  <Resources />
                </div>
              )}

              {activeSection === "help" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-4">
                    <BookMarked className="mr-2 text-amber-500" size={24} />
                    <h2 className="text-xl font-semibold">Help</h2>
                  </div>
                  <Help />
                </div>
              )}
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
              <p className="font-medium mb-2">Disclaimer:</p>
              <p className="mb-2">
                This application is for informational and personal tracking purposes only. Nothing on this app
                constitutes legal, professional, or medical advice. Always consult a licensed healthcare provider or
                professional for medical concerns or guidance.
              </p>
              <p>
                This application and its content are not intended for commercial use or profit. All content is provided
                as-is without warranty of any kind.
              </p>
            </div>
          </div>
        </div>

        <InstallPrompt />
        <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>
    </main>
  )
}
