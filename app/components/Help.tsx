"use client"

import type React from "react"
import {
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Plus,
  BarChart,
  Database,
  BookOpen,
  Clock,
  Download,
  Code,
  FileText,
  BookOpenCheck,
  ShoppingBag,
  Github,
  Activity,
} from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"
import { useBuilderLog } from "../hooks/useBuilderLog"
import { downloadBuilderLog } from "../services/builderLogExport"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Manual } from "./Manual"
import { ManualBuilder } from "./ManualBuilder"
import { TechnicalCompendium } from "./TechnicalCompendium"
import { isShareAvailable, fallbackShare } from "../services/share"
import { useState, useEffect } from "react"
import { StorageTests } from "./StorageTests"
import { DatabaseReset } from "./DatabaseReset"
import { ValidateAll } from "./ValidateAll"
import { ApplicationLog } from "./ApplicationLog"
import { getDatabaseCounts } from "../services/db"
// Add this import at the top
import TrackerHelp from "./TrackerHelp"

const Help: React.FC = () => {
  const { logEntries } = useBuilderLog()
  // Add the necessary state and functions for the Share Test
  // Add these at the beginning of the Help component, after the logEntries declaration:

  const [shareTestResults, setShareTestResults] = useState<string | null>(null)
  const [dbCounts, setDbCounts] = useState<{ uroLogs: number; hydroLogs: number }>({ uroLogs: 0, hydroLogs: 0 })

  useEffect(() => {
    const fetchDbCounts = async () => {
      try {
        const counts = await getDatabaseCounts()
        setDbCounts(counts)
      } catch (error) {
        console.error("Error fetching database counts:", error)
      }
    }

    fetchDbCounts()
  }, [])

  // Add these functions inside the Help component:

  // Helper function to detect platform
  const detectPlatform = (): string => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return "Server"
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return "iOS"
    }

    // Android detection
    if (/android/i.test(userAgent)) {
      return "Android"
    }

    // Windows detection
    if (/Win/.test(navigator.platform)) {
      return "Windows"
    }

    // macOS detection
    if (/Mac/.test(navigator.platform)) {
      return "macOS"
    }

    // Linux detection
    if (/Linux/.test(navigator.platform)) {
      return "Linux"
    }

    return "Unknown"
  }

  // Run a test to verify sharing works across platforms
  const runShareTest = () => {
    // Generate test data
    const testData = {
      title: "Flow Tracker Share Test",
      text: "This is a test of the sharing functionality.",
    }

    // Check if Web Share API is available
    const shareApiAvailable = isShareAvailable()

    // Determine platform
    const platform = detectPlatform()

    // Create test results
    let results = `Share Functionality Test Results:\n\n`
    results += `Platform: ${platform}\n`
    results += `Web Share API Available: ${shareApiAvailable ? "Yes" : "No"}\n`
    results += `Test Time: ${new Date().toLocaleString()}\n\n`

    if (shareApiAvailable) {
      results += `Share Method: Native Web Share API\n`
      results += `Fallback: Clipboard copy if sharing fails\n`
    } else {
      results += `Share Method: Clipboard copy\n`
      results += `Reason: Web Share API not available on this platform/environment\n`
    }

    // Set test results to display
    setShareTestResults(results)

    // Try to share test data
    try {
      if (shareApiAvailable) {
        navigator
          .share(testData)
          .then(() => {
            setShareTestResults(results + "\nShare successful!")
          })
          .catch((error) => {
            setShareTestResults(results + `\nShare failed: ${error.message}\nFalling back to clipboard.`)
            fallbackShare(testData.title, testData.text)
          })
      } else {
        fallbackShare(testData.title, testData.text)
        setShareTestResults(results + "\nUsed clipboard fallback method.")
      }
    } catch (error) {
      setShareTestResults(results + `\nError: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="space-y-6">
      <CollapsibleSection title="About This App" defaultExpanded={true}>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-800 dark:text-gray-100">
            Flow Tracker is a privacy-focused application designed to help you monitor and track your urinary health.
            All data is stored locally on your device and is never sent to any server.
          </p>

          <h4 className="flex items-center mt-4 text-gray-900 dark:text-gray-100">
            <Info className="mr-2 text-blue-500" size={18} />
            Key Features
          </h4>
          <ul className="space-y-2 text-gray-800 dark:text-gray-100">
            <li>Track urination flow rate, volume, and duration</li>
            <li>Monitor fluid intake</li>
            <li>Record urine color and other characteristics</li>
            <li>View statistics and trends over time</li>
            <li>Share, backup, and restore your data</li>
            <li>Designed with privacy in mind</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
          </ul>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="How to Use" defaultExpanded={false}>
        <div className="space-y-4">
          {/* Getting Started Section - Migrated from modal */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-medium text-blue-700 dark:text-blue-300 text-lg mb-3">
              Getting Started with Flow Tracker
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                  <ShoppingBag className="mr-2" size={18} /> What You'll Need
                </h4>
                <p className="text-gray-800 dark:text-gray-100">
                  To accurately track your urinary flow, you'll need a measuring pitcher. These can be purchased from
                  most convenience stores or supermarkets for between $1-$5.
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <strong>Important:</strong> Always wash the measuring pitcher in the bathroom sink immediately after
                    taking urine measurements for hygiene purposes.
                  </p>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  Example search:{" "}
                  <a
                    href="https://www.walmart.com/search?q=measuring+pitcher&typeahead=measuring+pitcher&max_price=5&sort=price_low&facet=volume_capacity%3A1000+mL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Walmart - Measuring Pitchers under $5
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                  <Clock className="mr-2" size={18} /> Recording Measurements
                </h4>
                <p className="text-gray-800 dark:text-gray-100">
                  Flow Tracker allows you to record both the volume of urine and the duration of flow. You can enter
                  these values in two ways:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-100">
                  <li>
                    <strong>Manual entry:</strong> Enter the volume and duration directly. You can also override the
                    date and time for past measurements.
                  </li>
                  <li>
                    <strong>Timer-assisted:</strong> Enter the volume and use the built-in timer to automatically record
                    the duration while you urinate.
                  </li>
                </ul>
                <p className="text-gray-800 dark:text-gray-100">
                  Additional optional fields allow you to track urine color, urgency, concerns, and add notes for a more
                  comprehensive health record.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                  <Github className="mr-2" size={18} /> Support & Contact
                </h4>
                <p className="text-gray-800 dark:text-gray-100">
                  For questions, feature requests, or to report issues, please visit the GitHub page and contact the
                  creator:
                </p>
                <a
                  href="https://github.com/yourusername/flow-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  github.com/yourusername/flow-tracker
                </a>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center">
              <Plus className="mr-2" size={18} />
              Add Entry Tab
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              Use this tab to record new urination events and fluid intake. For best results:
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5 text-gray-800 dark:text-gray-100">
              <li>Measure duration using the built-in timer</li>
              <li>Estimate volume as accurately as possible</li>
              <li>Record any concerns or unusual characteristics</li>
              <li>Track your fluid intake to correlate with output</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center">
              <BarChart className="mr-2" size={18} />
              Stats Tab
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              View statistics and trends about your urinary health and fluid intake:
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5 text-gray-800 dark:text-gray-100">
              <li>Average flow rate, volume, and duration</li>
              <li>Fluid intake patterns</li>
              <li>Color distribution and concerns</li>
              <li>Weekly, monthly, and yearly trends</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center">
              <Database className="mr-2" size={18} />
              Data Tab
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">Manage your recorded data:</p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5 text-gray-800 dark:text-gray-100">
              <li>View detailed entry logs</li>
              <li>Backup your data to a file for safekeeping</li>
              <li>Restore your data from a previous backup file</li>
              <li>Generate demo data to try out the app features, then remove it with one click</li>
              <li>Delete individual entries</li>
              <li>Share all or targeted data</li>
            </ul>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-cyan-700 dark:text-cyan-300 flex items-center">
              <BookOpen className="mr-2" size={18} />
              Resources Tab
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              Access educational resources and references:
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5 text-gray-800 dark:text-gray-100">
              <li>Links to trusted health organizations</li>
              <li>Educational materials about urinary health</li>
              <li>Information about hydration and kidney health</li>
              <li>Add your own links for reference (just for you)</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Privacy & Data" defaultExpanded={false}>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-800 dark:text-gray-100">
            <strong>Your privacy is our priority.</strong> Flow Tracker is designed with privacy in mind:
          </p>

          <ul className="space-y-2 text-gray-800 dark:text-gray-100">
            <li>All data is stored locally on your device</li>
            <li>No data is ever sent to any server</li>
            <li>No account or login required</li>
            <li>No analytics or tracking</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
          </ul>

          <div className="flex items-start mt-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle className="mr-2 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={18} />
            <p className="text-sm text-gray-800 dark:text-gray-100">
              <strong>Data Backup:</strong> Since all data is stored locally, we recommend regularly backing up your
              data using the Backup feature in the Data tab. This will create a backup file (CSV format) that you can
              save to your device or cloud storage.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Installation (PWA)" defaultExpanded={false}>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-800 dark:text-gray-100">
            Flow Tracker can be installed as a Progressive Web App (PWA) on your device for offline use:
          </p>

          <h4 className="mt-4 text-gray-900 dark:text-gray-100">On iOS (iPhone/iPad):</h4>
          <ol className="space-y-2 text-gray-800 dark:text-gray-100">
            <li>Open Flow Tracker in Safari</li>
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top-right corner</li>
          </ol>

          <h4 className="mt-4 text-gray-900 dark:text-gray-100">On Android:</h4>
          <ol className="space-y-2 text-gray-800 dark:text-gray-100">
            <li>Open Flow Tracker in Chrome</li>
            <li>Tap the menu button (three dots)</li>
            <li>Tap "Add to Home screen"</li>
            <li>Tap "Add" when prompted</li>
          </ol>

          <h4 className="mt-4 text-gray-900 dark:text-gray-100">On Desktop (Chrome, Edge, etc.):</h4>
          <ol className="space-y-2 text-gray-800 dark:text-gray-100">
            <li>Open Flow Tracker in your browser</li>
            <li>Look for the install icon in the address bar</li>
            <li>Click "Install" when prompted</li>
          </ol>

          <div className="flex items-start mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="mr-2 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={18} />
            <p className="text-sm text-gray-800 dark:text-gray-100">
              <strong>Benefits of installing as PWA:</strong> Once installed, Flow Tracker will work offline, load
              faster, and feel more like a native app. Your data will still be stored locally on your device.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="FAQ" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Is my data private?
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              Yes, all data is stored locally on your device and is never sent to any server. We have no access to your
              data.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              What if I get a new device?
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              Use the Backup feature in the Data tab to create a backup file of your data. You can then restore this
              file on your new device using the Restore feature.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              How accurate is the flow rate calculation?
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              The flow rate is calculated based on the volume and duration you enter. For the most accurate results, use
              the timer for duration and estimate volume as precisely as possible.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Can I use this app offline?
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              Yes, Flow Tracker works offline when installed as a Progressive Web App (PWA). See the Installation
              section for instructions.
            </p>
          </div>

          <div>
            <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Is this a medical device?
            </h4>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-100">
              No, Flow Tracker is not a medical device. It is a personal tracking tool for informational purposes only.
              Always consult a healthcare professional for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Add this section to the Help component, right before the Manual section */}
      <CollapsibleSection
        title="Custom Trackers"
        defaultExpanded={false}
        title2={<Activity className="mr-2 text-purple-500" size={20} />}
        className="mb-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl shadow-md border border-purple-100 dark:border-purple-800/30 overflow-hidden transition-all duration-200"
      >
        <TrackerHelp />
      </CollapsibleSection>

      {/* Manual Section */}
      <CollapsibleSection
        title="Manual"
        defaultExpanded={false}
        title2={<FileText className="mr-2 text-green-500" size={20} />}
        className="mb-6 bg-green-50 dark:bg-green-900/10 rounded-xl shadow-md border border-green-100 dark:border-green-800/30 overflow-hidden transition-all duration-200"
      >
        <Manual />
      </CollapsibleSection>

      {/* Development Section */}
      <CollapsibleSection
        title="Development"
        defaultExpanded={false}
        title2={<Code className="mr-2 text-indigo-500" size={20} />}
        className="mb-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-800/30 overflow-hidden transition-all duration-200"
      >
        <div className="space-y-6">
          {/* Technical Compendium Section */}
          <CollapsibleSection
            title="Technical Compendium"
            defaultExpanded={false}
            title2={<BookOpenCheck className="mr-2 text-blue-500" size={20} />}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-100">
                This technical compendium provides a comprehensive overview of the Flow Tracker codebase, including
                detailed explanations of each component, utility, and service.
              </p>
              <TechnicalCompendium />
            </div>
          </CollapsibleSection>

          {/* Builders Log Section */}
          <CollapsibleSection
            title="Builders Log"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Development History</h3>
              <button
                onClick={() => downloadBuilderLog(logEntries)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Download size={16} className="mr-2" />
                Export Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-gray-700 dark:text-gray-100">#</TableHead>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-100">User Input</TableHead>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-100">App Builder Output</TableHead>
                    <TableHead className="w-[300px] text-gray-700 dark:text-gray-100">Raw Response</TableHead>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-100">Error Resolution</TableHead>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-100">User Request</TableHead>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-100">Validation Test</TableHead>
                    <TableHead className="w-[150px] text-gray-700 dark:text-gray-100">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logEntries.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{index + 1}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">{entry.userInput}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">{entry.builderOutput}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">
                        <div className="max-h-[200px] overflow-y-auto">{entry.rawResponse}</div>
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">{entry.errorResolution}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">{entry.userRequest}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">{entry.validationTest}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-100">
                        {new Date(entry.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed flex items-center">
                <Clock className="mr-2 text-blue-500" size={16} />
                <span>
                  <strong>Last updated:</strong>{" "}
                  {logEntries.length > 0
                    ? new Date(logEntries[logEntries.length - 1].timestamp).toLocaleString()
                    : "No entries yet"}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed mt-2">
                <strong>Note:</strong> This log tracks the development process, issues encountered, and solutions
                implemented during the building of the Flow Tracker app.
              </p>
            </div>
          </CollapsibleSection>

          {/* Manual Builder Section */}
          <CollapsibleSection
            title="Manual Builder"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-100">
                Use this tool to rebuild the application manual with the latest features and documentation.
              </p>
              <ManualBuilder />
            </div>
          </CollapsibleSection>

          {/* Header Test Section */}
          <CollapsibleSection
            title="Storage Tests"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-100">
                This section provides tests to validate that all data is properly being stored in IndexedDB and not in
                localStorage, which could cause duplication issues during data restoration.
              </p>
              <StorageTests />
            </div>
          </CollapsibleSection>

          {/* Database Reset Section */}
          <CollapsibleSection
            title="Database Reset"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-100">
                This section provides tools to reset the database if you're experiencing persistent issues.
                <strong className="text-red-600 dark:text-red-400"> Warning: These actions cannot be undone!</strong>
              </p>
              <DatabaseReset />
            </div>
          </CollapsibleSection>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Validate All"
        defaultExpanded={false}
        className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <ValidateAll />
      </CollapsibleSection>

      {/* Application Log - Add this at the very end, right before the final closing </div> */}
      <ApplicationLog />
    </div>
  )
}

export default Help
