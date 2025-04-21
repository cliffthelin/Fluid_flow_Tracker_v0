"use client"

import { useEffect, useState } from "react"

export default function PWARegistration() {
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope)
            setIsRegistered(true)
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      })
    }
  }, [])

  return null // This component doesn't render anything visible
}
