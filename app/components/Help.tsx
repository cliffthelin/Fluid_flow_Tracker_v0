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
} from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"
import { useBuilderLog } from "../hooks/useBuilderLog"
import { downloadBuilderLog } from "../services/builderLogExport"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HeaderTest } from "./HeaderTest"
import { Manual } from "./Manual"
import { ManualBuilder } from "./ManualBuilder"
import { ContrastTest } from "./ContrastTest"

const Help: React.FC = () => {
  const { logEntries } = useBuilderLog()

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
            <li>Export and backup your data</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
          </ul>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="How to Use" defaultExpanded={false}>
        <div className="space-y-4">
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
              <li>Export data as CSV for backup or analysis</li>
              <li>Import previously exported data</li>
              <li>Generate mock data for testing (if needed)</li>
              <li>Delete individual entries or mock data</li>
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
              <strong>Data Backup:</strong> Since all data is stored locally, we recommend regularly exporting your data
              using the Export feature in the Data tab. This will create a CSV file that you can save to your device or
              cloud storage.
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
              Use the Export feature in the Data tab to create a CSV file of your data. You can then import this file on
              your new device.
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
            title="Header Test"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-100">
                This test verifies that the header is not sticky and scrolls away when the page is scrolled.
              </p>
              <HeaderTest />
            </div>
          </CollapsibleSection>

          {/* Contrast Test Section */}
          <CollapsibleSection
            title="Contrast Test"
            defaultExpanded={false}
            className="mb-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4">
              <p className="text-gray-800 dark:text-gray-100">
                This test checks the contrast ratio of text elements on the page to ensure they meet accessibility
                standards in both light and dark modes.
              </p>
              <ContrastTest />
            </div>
          </CollapsibleSection>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export default Help
