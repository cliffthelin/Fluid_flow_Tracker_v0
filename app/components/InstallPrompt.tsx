"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the prompt to the user
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setShowPrompt(false)
    })
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg shadow-lg z-50 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Install Flow Tracker</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Install this app on your phone for easier access and offline use
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowPrompt(false)} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 bg-blue-500 text-white rounded flex items-center text-sm"
          >
            <Download size={14} className="mr-1" /> Install
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
