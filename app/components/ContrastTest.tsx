/**
 * ContrastTest Component
 *
 * This component tests the contrast ratios of text elements against their backgrounds
 * to ensure they meet WCAG AA accessibility standards (minimum 4.5:1 ratio).
 *
 * Features:
 * - Tests headings, paragraphs, list items, buttons, links, and table cells
 * - Toggles between light and dark mode to test both themes
 * - Provides detailed results with pass/fail status for each element
 * - Calculates overall accessibility compliance percentage
 */

"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, RefreshCw, Check, X } from "lucide-react"

/**
 * Calculates the contrast ratio between two colors
 *
 * @param foreground - Foreground color in hex format (e.g., "#ffffff")
 * @param background - Background color in hex format (e.g., "#000000")
 * @returns Contrast ratio as a number (e.g., 21.0 for white on black)
 */
function calculateContrastRatio(foreground: string, background: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    // Remove # if present
    hex = hex.replace(/^#/, "")

    // Parse hex values
    let r, g, b
    if (hex.length === 3) {
      // Handle shorthand hex format (e.g., #FFF)
      r = Number.parseInt(hex[0] + hex[0], 16)
      g = Number.parseInt(hex[1] + hex[1], 16)
      b = Number.parseInt(hex[2] + hex[2], 16)
    } else {
      // Handle full hex format (e.g., #FFFFFF)
      r = Number.parseInt(hex.substring(0, 2), 16)
      g = Number.parseInt(hex.substring(2, 4), 16)
      b = Number.parseInt(hex.substring(4, 6), 16)
    }

    return { r, g, b }
  }

  /**
   * Converts RGB values to relative luminance
   * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
   */
  const rgbToLuminance = (r: number, g: number, b: number): number => {
    // Convert RGB values to sRGB
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    // Calculate luminance using WCAG formula
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  // Extract RGB values
  let fg, bg
  try {
    fg = hexToRgb(foreground)
    bg = hexToRgb(background)
  } catch (e) {
    return 1 // Return 1 (fail) if colors can't be parsed
  }

  // Calculate luminance
  const l1 = rgbToLuminance(fg.r, fg.g, fg.b)
  const l2 = rgbToLuminance(bg.r, bg.g, bg.b)

  // Calculate contrast ratio using WCAG formula
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  // Round to 2 decimal places for readability
  return Math.round(ratio * 100) / 100
}

/**
 * Gets the computed color of an element in hex format
 *
 * @param element - DOM element to get color from
 * @param property - CSS property to get (e.g., "color", "background-color")
 * @returns Color in hex format (e.g., "#ffffff")
 */
function getComputedColor(element: Element, property: string): string {
  const color = window.getComputedStyle(element).getPropertyValue(property).trim()

  // Handle rgba format
  if (color.startsWith("rgba")) {
    const values = color.match(/rgba$$(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)$$/)
    if (values) {
      const r = Number.parseInt(values[1])
      const g = Number.parseInt(values[2])
      const b = Number.parseInt(values[3])
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    }
  }

  // Handle rgb format
  if (color.startsWith("rgb")) {
    const values = color.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
    if (values) {
      const r = Number.parseInt(values[1])
      const g = Number.parseInt(values[2])
      const b = Number.parseInt(values[3])
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    }
  }

  // Handle hex format
  if (color.startsWith("#")) {
    return color
  }

  // Default fallback
  return "#000000"
}

/**
 * ContrastTest Component
 * Tests contrast ratios of text elements against WCAG AA standards
 */
export function ContrastTest() {
  // State to track current theme mode
  const [isDarkMode, setIsDarkMode] = useState(false)
  // State to store test results
  const [testResults, setTestResults] = useState<
    Array<{
      element: string
      textColor: string
      bgColor: string
      ratio: number
      passes: boolean
    }>
  >([])
  // State to track if test is running
  const [isRunning, setIsRunning] = useState(false)
  // State to store summary statistics
  const [summary, setSummary] = useState({ total: 0, passed: 0, percentage: 0 })

  /**
   * Toggles between light and dark mode
   */
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)

    // Apply dark mode class to HTML element
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Run test after mode change with a delay to allow styles to update
    setTimeout(runTest, 500)
  }

  /**
   * Runs the contrast test on all text elements
   */
  const runTest = () => {
    setIsRunning(true)
    setTestResults([])

    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const results: Array<{
        element: string
        textColor: string
        bgColor: string
        ratio: number
        passes: boolean
      }> = []

      // Test headings (h1-h6)
      document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((element) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `Heading (${element.tagName.toLowerCase()})`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard for normal text
        })
      })

      // Test paragraphs
      document.querySelectorAll("p").forEach((element, index) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `Paragraph ${index + 1}`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard
        })
      })

      // Test list items
      document.querySelectorAll("li").forEach((element, index) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `List item ${index + 1}`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard
        })
      })

      // Test buttons
      document.querySelectorAll("button").forEach((element, index) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `Button ${index + 1}`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard
        })
      })

      // Test links
      document.querySelectorAll("a").forEach((element, index) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `Link ${index + 1}`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard
        })
      })

      // Test table elements
      document.querySelectorAll("th, td").forEach((element, index) => {
        const textColor = getComputedColor(element, "color")
        const bgColor = getComputedColor(element, "background-color")
        const ratio = calculateContrastRatio(textColor, bgColor)
        results.push({
          element: `Table cell ${index + 1}`,
          textColor,
          bgColor,
          ratio,
          passes: ratio >= 4.5, // WCAG AA standard
        })
      })

      // Calculate summary statistics
      const total = results.length
      const passed = results.filter((r) => r.passes).length
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0

      // Update state with results and summary
      setTestResults(results)
      setSummary({ total, passed, percentage })
      setIsRunning(false)
    }, 1000)
  }

  // Run test on component mount
  useEffect(() => {
    // Check if dark mode is active
    setIsDarkMode(document.documentElement.classList.contains("dark"))

    // Run initial test
    runTest()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Test control button */}
        <button
          onClick={runTest}
          disabled={isRunning}
          className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
          Run Contrast Test
        </button>

        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center px-4 py-2 font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {isDarkMode ? (
            <>
              <Sun size={16} className="mr-2" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon size={16} className="mr-2" />
              Switch to Dark Mode
            </>
          )}
        </button>
      </div>

      {/* Test results section */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          {/* Summary panel */}
          <div
            className={`p-4 rounded-lg ${
              summary.percentage >= 90
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : summary.percentage >= 70
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
            }`}
          >
            <h3 className="font-medium text-lg mb-2">Test Summary</h3>
            <p>
              <strong>Mode:</strong> {isDarkMode ? "Dark" : "Light"}
            </p>
            <p>
              <strong>Elements tested:</strong> {summary.total}
            </p>
            <p>
              <strong>Elements passing WCAG AA (4.5:1):</strong> {summary.passed} ({summary.percentage}%)
            </p>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Element
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Text Color
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Background
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Contrast Ratio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    WCAG AA (4.5:1)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {testResults.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {result.element}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 mr-2 border border-gray-300 dark:border-gray-600 rounded"
                          style={{ backgroundColor: result.textColor }}
                        ></div>
                        {result.textColor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 mr-2 border border-gray-300 dark:border-gray-600 rounded"
                          style={{ backgroundColor: result.bgColor }}
                        ></div>
                        {result.bgColor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {result.ratio}:1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.passes ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <Check size={16} className="mr-1" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400">
                          <X size={16} className="mr-1" /> Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
