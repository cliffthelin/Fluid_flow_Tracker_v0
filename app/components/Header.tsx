"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Moon, Sun, Droplets, ZoomIn, ZoomOut } from "lucide-react"

interface HeaderProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
  fontSize: number
  setFontSize: (size: number) => void
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, fontSize, setFontSize }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 1, 5))
  }

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 1, -2))
  }

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? "bg-blue-100/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm" : "bg-blue-50 dark:bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-blue-700 dark:text-blue-400">
              <Droplets className="mr-2 h-8 w-8" /> Flow Tracker
            </h1>
            <p className="text-lg text-blue-600 dark:text-gray-400 mt-0.5">Monitor Your Fluids</p>
          </div>
          <div className="flex items-center space-x-2">
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
    </header>
  )
}

export default Header
