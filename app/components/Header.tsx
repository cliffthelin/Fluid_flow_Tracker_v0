"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Moon, Sun, Droplets, ZoomIn, ZoomOut, HelpCircle, Trash } from "lucide-react"
import GettingStartedModal from "./GettingStartedModal"
import { deleteAllUroLogs, deleteAllHydroLogs, getDatabaseCounts } from "../services/db"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
  fontSize: number
  setFontSize: (size: number) => void
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, fontSize, setFontSize }) => {
  const [showGettingStarted, setShowGettingStarted] = useState(false)
  const [showDeleteDemoData, setShowDeleteDemoData] = useState(false)
  const [dbCounts, setDbCounts] = useState<{ uroLogs: number; hydroLogs: number }>({ uroLogs: 0, hydroLogs: 0 })

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 1, 5))
  }

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 1, -2))
  }

  const toggleGettingStarted = () => {
    setShowGettingStarted(!showGettingStarted)
  }

  const fetchDbCounts = async () => {
    try {
      const counts = await getDatabaseCounts()
      setDbCounts(counts)
      setShowDeleteDemoData(counts.uroLogs > 0 || counts.hydroLogs > 0)
    } catch (error) {
      console.error("Error fetching database counts:", error)
    }
  }

  const deleteDemoData = async () => {
    if (!confirm("This will delete all mock data entries. Continue?")) {
      return
    }

    try {
      await deleteAllUroLogs()
      await deleteAllHydroLogs()
      // Refresh counts
      fetchDbCounts()
      setShowDeleteDemoData(false)
    } catch (error) {
      console.error("Error deleting demo data:", error)
    }
  }

  useEffect(() => {
    fetchDbCounts()
  }, [])

  return (
    <header className="w-full bg-blue-50 dark:bg-transparent">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-blue-700 dark:text-blue-400">
              <Droplets className="mr-2 h-8 w-8" /> My Uro Log
            </h1>
            <p className="text-lg text-blue-600 dark:text-gray-400 mt-0.5">Monitor Your Urological Health</p>
          </div>
          <div className="flex items-center space-x-2">
            {showDeleteDemoData && (
              <button
                onClick={deleteDemoData}
                className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                aria-label="Delete Demo Data"
                title="Delete Demo Data"
              >
                <Trash className="h-7 w-7 text-red-700 dark:text-red-400" />
              </button>
            )}
            <button
              onClick={toggleGettingStarted}
              className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Getting Started"
              title="Getting Started"
            >
              <HelpCircle className="h-7 w-7 text-blue-700 dark:text-blue-400" />
            </button>
            <div className="flex items-center bg-blue-200 dark:bg-gray-800 rounded-lg p-1 mr-2">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 rounded-full hover:bg-blue-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                <ZoomOut className="h-6 w-6 text-blue-800 dark:text-gray-200" />
              </button>
              <button
                onClick={increaseFontSize}
                className="p-1.5 rounded-full hover:bg-blue-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Increase font size"
                title="Increase font size"
              >
                <ZoomIn className="h-6 w-6 text-blue-800 dark:text-gray-200" />
              </button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-7 w-7 text-amber-500" /> : <Moon className="h-7 w-7 text-blue-700" />}
            </button>
          </div>
        </div>
      </div>

      {showGettingStarted && <GettingStartedModal onClose={() => setShowGettingStarted(false)} />}
    </header>
  )
}

export default Header
