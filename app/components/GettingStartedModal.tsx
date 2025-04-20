"use client"

import type React from "react"
import { X, ShoppingBag, Clock, Github } from "lucide-react"

interface GettingStartedModalProps {
  onClose: () => void
}

const GettingStartedModal: React.FC<GettingStartedModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Getting Started with Flow Tracker</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <ShoppingBag className="mr-2" size={20} /> What You'll Need
            </h3>
            <p>
              To accurately track your urinary flow, you'll need a measuring pitcher. These can be purchased from most
              convenience stores or supermarkets for between $1-$5.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> Always wash the measuring pitcher in the bathroom sink immediately after
                taking urine measurements for hygiene purposes.
              </p>
            </div>
            <p className="text-sm">
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
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="mr-2" size={20} /> Recording Measurements
            </h3>
            <p>
              Flow Tracker allows you to record both the volume of urine and the duration of flow. You can enter these
              values in two ways:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Manual entry:</strong> Enter the volume and duration directly. You can also override the date
                and time for past measurements.
              </li>
              <li>
                <strong>Timer-assisted:</strong> Enter the volume and use the built-in timer to automatically record the
                duration while you urinate.
              </li>
            </ul>
            <p>
              Additional optional fields allow you to track urine color, urgency, concerns, and add notes for a more
              comprehensive health record.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Github className="mr-2" size={20} /> Support & Contact
            </h3>
            <p>
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

        <div className="border-t p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default GettingStartedModal
