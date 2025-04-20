"use client"

import type React from "react"
import { HelpCircle, Info, AlertTriangle, CheckCircle, Plus, BarChart, Database, BookOpen } from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"

const Help: React.FC = () => {
  return (
    <div className="space-y-6">
      <CollapsibleSection title="About This App" defaultExpanded={true}>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Flow Tracker is a privacy-focused application designed to help you monitor and track your urinary health.
            All data is stored locally on your device and is never sent to any server.
          </p>

          <h4 className="flex items-center mt-4">
            <Info className="mr-2 text-blue-500" size={18} />
            Key Features
          </h4>
          <ul className="space-y-2">
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
            <p className="text-sm mt-2">
              Use this tab to record new urination events and fluid intake. For best results:
            </p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
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
            <p className="text-sm mt-2">View statistics and trends about your urinary health and fluid intake:</p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
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
            <p className="text-sm mt-2">Manage your recorded data:</p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
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
            <p className="text-sm mt-2">Access educational resources and references:</p>
            <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
              <li>Links to trusted health organizations</li>
              <li>Educational materials about urinary health</li>
              <li>Information about hydration and kidney health</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Privacy & Data" defaultExpanded={false}>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            <strong>Your privacy is our priority.</strong> Flow Tracker is designed with privacy in mind:
          </p>

          <ul className="space-y-2">
            <li>All data is stored locally on your device</li>
            <li>No data is ever sent to any server</li>
            <li>No account or login required</li>
            <li>No analytics or tracking</li>
            <li>Works offline as a Progressive Web App (PWA)</li>
          </ul>

          <div className="flex items-start mt-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle className="mr-2 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={18} />
            <p className="text-sm">
              <strong>Data Backup:</strong> Since all data is stored locally, we recommend regularly exporting your data
              using the Export feature in the Data tab. This will create a CSV file that you can save to your device or
              cloud storage.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Installation (PWA)" defaultExpanded={false}>
        <div className="prose dark:prose-invert max-w-none">
          <p>Flow Tracker can be installed as a Progressive Web App (PWA) on your device for offline use:</p>

          <h4 className="mt-4">On iOS (iPhone/iPad):</h4>
          <ol className="space-y-2">
            <li>Open Flow Tracker in Safari</li>
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top-right corner</li>
          </ol>

          <h4 className="mt-4">On Android:</h4>
          <ol className="space-y-2">
            <li>Open Flow Tracker in Chrome</li>
            <li>Tap the menu button (three dots)</li>
            <li>Tap "Add to Home screen"</li>
            <li>Tap "Add" when prompted</li>
          </ol>

          <h4 className="mt-4">On Desktop (Chrome, Edge, etc.):</h4>
          <ol className="space-y-2">
            <li>Open Flow Tracker in your browser</li>
            <li>Look for the install icon in the address bar</li>
            <li>Click "Install" when prompted</li>
          </ol>

          <div className="flex items-start mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="mr-2 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={18} />
            <p className="text-sm">
              <strong>Benefits of installing as PWA:</strong> Once installed, Flow Tracker will work offline, load
              faster, and feel more like a native app. Your data will still be stored locally on your device.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="FAQ" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Is my data private?
            </h4>
            <p className="text-sm mt-2">
              Yes, all data is stored locally on your device and is never sent to any server. We have no access to your
              data.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              What if I get a new device?
            </h4>
            <p className="text-sm mt-2">
              Use the Export feature in the Data tab to create a CSV file of your data. You can then import this file on
              your new device.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              How accurate is the flow rate calculation?
            </h4>
            <p className="text-sm mt-2">
              The flow rate is calculated based on the volume and duration you enter. For the most accurate results, use
              the timer for duration and estimate volume as precisely as possible.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-medium flex items-center">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Can I use this app offline?
            </h4>
            <p className="text-sm mt-2">
              Yes, Flow Tracker works offline when installed as a Progressive Web App (PWA). See the Installation
              section for instructions.
            </p>
          </div>

          <div>
            <h4 className="font-medium flex items-center">
              <HelpCircle className="mr-2 text-blue-500" size={16} />
              Is this a medical device?
            </h4>
            <p className="text-sm mt-2">
              No, Flow Tracker is not a medical device. It is a personal tracking tool for informational purposes only.
              Always consult a healthcare professional for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export default Help
