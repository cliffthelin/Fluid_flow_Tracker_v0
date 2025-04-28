"use client"

import type React from "react"
import { Plus, BarChart, Database, BookMarked, BookOpen, Settings } from "lucide-react"

// Update the type definition to include "config"
type Section = "entry" | "stats" | "data" | "resources" | "help" | "config"

interface BottomNavProps {
  activeSection: Section
  setActiveSection: (section: Section) => void
}

// Update the BottomNav component to include 6 sections instead of 5
const BottomNav: React.FC<BottomNavProps> = ({ activeSection, setActiveSection }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 dark:bg-gray-950 text-white z-50 shadow-lg border-t border-gray-700">
      <div className="flex justify-around items-center">
        <button
          onClick={() => setActiveSection("entry")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "entry"
              ? "text-blue-400 border-t-4 border-blue-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="Add New Entry"
          aria-pressed={activeSection === "entry"}
        >
          <Plus size={24} className={activeSection === "entry" ? "text-blue-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "entry" ? "text-blue-400" : ""}`}>
            Add Entry
          </span>
        </button>
        <button
          onClick={() => setActiveSection("stats")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "stats"
              ? "text-green-400 border-t-4 border-green-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="UroLog Stats"
          aria-pressed={activeSection === "stats"}
        >
          <BarChart size={24} className={activeSection === "stats" ? "text-green-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "stats" ? "text-green-400" : ""}`}>
            UroLog Stats
          </span>
        </button>
        <button
          onClick={() => setActiveSection("data")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "data"
              ? "text-purple-400 border-t-4 border-purple-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="Data Management"
          aria-pressed={activeSection === "data"}
        >
          <Database size={24} className={activeSection === "data" ? "text-purple-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "data" ? "text-purple-400" : ""}`}>Data</span>
        </button>
        <button
          onClick={() => setActiveSection("resources")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "resources"
              ? "text-cyan-400 border-t-4 border-cyan-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="Resources"
          aria-pressed={activeSection === "resources"}
        >
          <BookOpen size={24} className={activeSection === "resources" ? "text-cyan-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "resources" ? "text-cyan-400" : ""}`}>
            Resources
          </span>
        </button>
        <button
          onClick={() => setActiveSection("help")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "help"
              ? "text-amber-400 border-t-4 border-amber-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="Help"
          aria-pressed={activeSection === "help"}
        >
          <BookMarked size={24} className={activeSection === "help" ? "text-amber-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "help" ? "text-amber-400" : ""}`}>Help</span>
        </button>
        <button
          onClick={() => setActiveSection("config")}
          className={`flex flex-col items-center py-4 px-2 w-1/6 ${
            activeSection === "config"
              ? "text-pink-400 border-t-4 border-pink-400 bg-gray-800 dark:bg-gray-800"
              : "text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
          } transition-all duration-200`}
          aria-label="Configuration"
          aria-pressed={activeSection === "config"}
        >
          <Settings size={24} className={activeSection === "config" ? "text-pink-400" : ""} />
          <span className={`text-xs mt-1 font-bold ${activeSection === "config" ? "text-pink-400" : ""}`}>Config</span>
        </button>
      </div>
    </div>
  )
}

export default BottomNav
