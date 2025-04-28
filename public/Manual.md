# My Uro Log - User Manual

## Overview

My Uro Log is a privacy-focused Progressive Web Application (PWA) designed to help users monitor and track their urinary health. The application provides tools for recording urination events, tracking fluid intake, and analyzing patterns over time. All data is stored locally on the user's device, ensuring complete privacy and security.

## Key Features

- **Privacy-First Design**: All data stays on your device
- **Comprehensive Tracking**: Monitor flow rate, volume, duration, and characteristics
- **Statistical Analysis**: View trends and patterns over time
- **HydroLog Monitoring**: Track hydration levels
- **Offline Capability**: Works without an internet connection
- **Data Export/Import**: Backup and restore your data
- **Educational Resources**: Access to urinary health information

## Application Pages

### Home / Dashboard

The Home page serves as the central dashboard for the My Uro Log application.

**Features:**
- Quick overview of recent entries
- Summary statistics of urinary health metrics
- HydroLog vs. output visualization
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
- HydroLog tracking with common beverage presets
- Notes section for additional observations

**User Tips:**
- Use the timer for the most accurate flow rate calculation
- Be consistent in your volume estimation method
- Record any unusual characteristics immediately
- Track all fluid intake, not just water

### Stats

The Stats page provides detailed analysis and visualization of your recorded data.

**Features:**
- Daily, weekly, monthly, and yearly trend analysis
- Flow rate averages and variations
- Volume patterns over time
- Duration statistics
- HydroLog correlation with output
- Color distribution charts
- Concern frequency analysis

**User Tips:**
- Look for patterns in your data over time
- Compare your stats with healthy baseline ranges
- Use the date filters to focus on specific time periods
- Export charts for sharing with healthcare providers if needed

### Data Management

The Data Management page provides tools for managing your recorded information.

**Features:**
- Detailed entry logs with filtering and sorting
- Data export in CSV format
- Data import functionality
- Entry editing and deletion
- Mock data generation for testing
- Data backup and restore

**User Tips:**
- Export your data regularly as a backup
- Review your entries periodically for accuracy
- Use the search and filter tools to find specific entries
- Clear mock data before using the app for actual tracking

### Resources

The Resources page provides educational materials and references about urinary health.

**Features:**
- Links to trusted health organizations
- Educational articles about urinary health
- Information about hydration and kidney health
- Common urinary condition explanations
- Reference charts for normal values
- FAQ section for common questions

**User Tips:**
- Use the reference charts to understand what's normal
- Read the educational materials to better understand your urinary health
- Consult the hydration guidelines for optimal fluid intake
- Remember that this information is educational and not medical advice

## Installation Guide

My Uro Log can be installed as a Progressive Web App (PWA) on various devices:

### On iOS (iPhone/iPad):
1. Open My Uro Log in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top-right corner

### On Android:
1. Open My Uro Log in Chrome
2. Tap the menu button (three dots)
3. Tap "Add to Home screen"
4. Tap "Add" when prompted

### On Desktop (Chrome, Edge, etc.):
1. Open My Uro Log in your browser
2. Look for the install icon in the address bar
3. Click "Install" when prompted

## Privacy & Data Security

My Uro Log is designed with privacy as a core principle:

- All data is stored locally on your device using IndexedDB
- No data is ever sent to any server
- No account or login required
- No analytics or tracking
- Works offline as a Progressive Web App (PWA)

We recommend regularly exporting your data as a backup using the Export feature in the Data tab.

## Technical Specifications

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Data Storage**: IndexedDB via Dexie.js
- **PWA Features**: Service Worker, Web Manifest
- **Charts**: Recharts library
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Page-Specific Technologies

#### Home / Dashboard
- Recharts for visualization
- React Context for global state access
- Custom hooks for data aggregation

#### Add Entry
- Custom timer implementation
- Form validation
- IndexedDB transactions for data persistence

#### Stats
- Advanced data visualization with Recharts
- Data aggregation algorithms
- Custom date range selector
- Statistical calculation utilities

#### Data Management
- CSV parsing and generation
- File system access (where supported)
- Batch database operations
- Search and filter implementation

#### Resources
- Markdown rendering
- External link handling
- Image optimization

### Performance Optimizations

- Code splitting for reduced initial load time
- Service Worker for offline caching
- Lazy loading of non-critical components
- Optimized database queries
- Memoization of expensive calculations
- Efficient re-rendering with React.memo and useMemo

### Accessibility Features

- Semantic HTML structure
- ARIA attributes for screen readers
- Keyboard navigation support
- Color contrast compliance
- Responsive design for all device sizes
- Focus management for form elements

### Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

## Troubleshooting

### Common Issues and Solutions

1. **Data not saving**
   - Check if your device has sufficient storage
   - Try clearing browser cache
   - Ensure you're not in private/incognito mode

2. **App not working offline**
   - Make sure you've installed it as a PWA
   - Check if service worker is registered
   - Try refreshing the app when online

3. **Charts not displaying**
   - Ensure you have sufficient data entries
   - Try changing the date range
   - Check if JavaScript is enabled

4. **Installation issues**
   - Make sure you're using a supported browser
   - Check if PWAs are supported on your device
   - Try accessing the app from a different browser

5. **Export/Import not working**
   - Check file permissions
   - Ensure the file format is correct
   - Try with a smaller dataset first

For additional support or to report issues, please use the feedback form in the app or contact us through our GitHub repository.



Let's update the BackupRestore component to use the new type names:

\`\`\`typescriptreact file="app/components/BackupRestore.tsx"
[v0-no-op-code-block-prefix]"use client"

import type React from "react"

import { useState } from "react"
import { Save, Upload, Check, AlertCircle } from 'lucide-react'
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
        version: 1,
        timestamp: new Date().toISOString(),
        entries,
      }

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `my-uro-log-backup-${new Date().toISOString().split("T")[0]}.json`
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

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">Backup & Restore</h3>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <p>
          <strong>Backup (JSON):</strong> Creates a file with all your data that you can save to your device.
        </p>
        <p className="mt-1">
          <strong>Restore (JSON):</strong> Loads data from a previously created backup file.
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
