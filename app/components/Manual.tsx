"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function Manual() {
  const [manualContent, setManualContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchManual() {
      try {
        // Use a hardcoded manual content for now to ensure it works
        const content = `
# Flow Tracker - User Manual

## Overview

Flow Tracker is a privacy-focused Progressive Web Application (PWA) designed to help users monitor and track their urinary health. The application provides tools for recording urination events, tracking fluid intake, and analyzing patterns over time. All data is stored locally on the user's device, ensuring complete privacy and security.

## Key Features

- **Privacy-First Design**: All data stays on your device
- **Comprehensive Tracking**: Monitor flow rate, volume, duration, and characteristics
- **Statistical Analysis**: View trends and patterns over time
- **Fluid Intake Monitoring**: Track hydration levels
- **Offline Capability**: Works without an internet connection
- **Data Export/Import**: Backup and restore your data
- **Educational Resources**: Access to urinary health information

## Application Pages

### Home / Dashboard

The Home page serves as the central dashboard for the Flow Tracker application.

**Features:**
- Quick overview of recent entries
- Summary statistics of urinary health metrics
- Fluid intake vs. output visualization
- Quick access to add new entries
- Notification of any concerning patterns

**User Tips:**
- Check the dashboard daily to monitor your overall urinary health
- Pay attention to the fluid balance indicator to ensure proper hydration
- Use the quick add buttons to record new events efficiently

### Add Entry

The Add Entry page allows users to record new urination events and fluid intake.

**Features:**
- Built-in timer for measuring duration
- Volume estimation tools
- Color selection based on standardized chart
- Concern/symptom recording
- Fluid intake tracking with common beverage presets
- Notes section for additional observations

**User Tips:**
- Use the timer for the most accurate flow rate calculation
- Be consistent in your volume estimation method
- Record any unusual characteristics immediately
- Track all fluid intake, not just water
`

        setManualContent(content)
        setError(null)
      } catch (error) {
        console.error("Failed to load manual content:", error)
        setError("Failed to load manual content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchManual()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="prose prose-blue dark:prose-invert max-w-none">
      {manualContent.split("\n").map((line, index) => {
        // Handle headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-50">
              {line.substring(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-50">
              {line.substring(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-50">
              {line.substring(4)}
            </h3>
          )
        }
        if (line.startsWith("#### ")) {
          return (
            <h4 key={index} className="text-lg font-bold mt-3 mb-2 text-gray-900 dark:text-gray-50">
              {line.substring(5)}
            </h4>
          )
        }

        // Handle lists
        if (line.startsWith("- ")) {
          // Check if the line contains bold text
          const content = line.substring(2)
          if (content.includes("**")) {
            const parts = content.split("**")
            if (parts.length >= 3) {
              return (
                <li key={index} className="ml-6 list-disc text-gray-800 dark:text-gray-100">
                  <strong>{parts[1]}</strong>
                  {parts[2]}
                </li>
              )
            }
          }
          return (
            <li key={index} className="ml-6 list-disc text-gray-800 dark:text-gray-100">
              {content}
            </li>
          )
        }

        // Handle empty lines
        if (line.trim() === "") {
          return <div key={index} className="h-4"></div>
        }

        // Handle paragraphs with bold text
        if (line.includes("**")) {
          const parts = line.split("**")
          if (parts.length >= 3) {
            return (
              <p key={index} className="my-2 text-gray-800 dark:text-gray-100">
                {parts[0]}
                <strong>{parts[1]}</strong>
                {parts[2]}
              </p>
            )
          }
        }

        // Regular paragraph
        return (
          <p key={index} className="my-2 text-gray-800 dark:text-gray-100">
            {line}
          </p>
        )
      })}
    </div>
  )
}
