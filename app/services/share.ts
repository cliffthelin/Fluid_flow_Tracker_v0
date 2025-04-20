/**
 * Share Service Module
 *
 * This module provides utilities for sharing content from the application.
 * It includes functions for checking if the Web Share API is available,
 * sharing content via the Web Share API, and falling back to clipboard copying
 * when the Web Share API is not available or fails.
 */

/**
 * Checks if the Web Share API is available and likely to work
 *
 * This function performs several checks to determine if the Web Share API
 * is available and likely to work in the current environment:
 * 1. Checks if the app is running in an iframe (which often blocks Web Share API)
 * 2. Checks if the app is running in a preview environment (Vercel, Netlify, localhost)
 * 3. Checks if the browser supports the Web Share API
 *
 * @returns {boolean} True if Web Share API is available and likely to work, false otherwise
 */
export const isShareAvailable = (): boolean => {
  /**
   * Checks if the app is running in an iframe
   * @returns {boolean} True if in an iframe, false otherwise
   */
  const isInIframe = () => {
    try {
      return window.self !== window.top
    } catch (e) {
      return true // If we can't access parent window, we're in an iframe
    }
  }

  /**
   * Checks if the app is running in a preview environment
   * @returns {boolean} True if in a preview environment, false otherwise
   */
  const isInPreviewEnvironment = () => {
    return (
      window.location.hostname.includes("vercel") ||
      window.location.hostname.includes("netlify") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1") ||
      window.location.hostname.includes("preview")
    )
  }

  // If we're in an iframe or preview environment, don't even try to use Web Share API
  if (isInIframe() || isInPreviewEnvironment()) {
    return false
  }

  // Otherwise, check if the API is available
  return typeof navigator !== "undefined" && !!navigator.share
}

/**
 * Fallback sharing method that copies content to clipboard
 *
 * This function is used when the Web Share API is not available or fails.
 * It creates a temporary textarea element, copies the content to the clipboard,
 * and shows an alert to the user.
 *
 * @param {string} title - The title of the content being shared
 * @param {string} text - The text content to share
 */
export const fallbackShare = (title: string, text: string): void => {
  // Create a temporary textarea element to hold the text
  const textArea = document.createElement("textarea")
  textArea.value = `${title}\n${text}`

  // Position the textarea off-screen
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "-9999px"

  // Add the textarea to the DOM
  document.body.appendChild(textArea)

  // Select the text in the textarea
  textArea.focus()
  textArea.select()

  try {
    // Execute the copy command
    const successful = document.execCommand("copy")
    if (successful) {
      alert("Data copied to clipboard! You can now paste it in your messaging app.")
    } else {
      alert("Failed to copy data to clipboard.")
    }
  } catch (err) {
    console.error("Failed to copy text: ", err)
    alert("Failed to copy data to clipboard.")
  }

  // Remove the textarea from the DOM
  document.body.removeChild(textArea)
}

/**
 * Interface for share data
 */
interface ShareData {
  title: string
  text: string
  url?: string
  files?: File[]
}

/**
 * Safely shares content using Web Share API with fallback to clipboard
 *
 * This function attempts to use the Web Share API if available, and falls back
 * to clipboard copying if the Web Share API is not available or fails.
 *
 * @param {ShareData} data - The data to share
 * @returns {Promise<void>}
 */
export const safeShare = async (data: ShareData): Promise<void> => {
  try {
    // Skip Web Share API entirely if it's likely to fail
    if (!isShareAvailable()) {
      throw new Error("Web Share API not available in this environment")
    }

    // Attempt to use Web Share API
    await navigator.share(data)
  } catch (error: any) {
    console.error("Sharing failed:", error)

    // Always fall back to clipboard
    fallbackShare(data.title, data.text || "")
  }
}

/**
 * Helper function to share content with automatic fallback
 *
 * This function is a simplified version of safeShare that handles the most common
 * sharing scenario: sharing a title, text, and optional URL.
 *
 * @param {Object} data - The data to share
 * @param {string} data.title - The title of the content
 * @param {string} data.text - The text content to share
 * @param {string} [data.url] - Optional URL to share
 */
export const shareContent = (data: {
  title: string
  text: string
  url?: string
}): void => {
  // Skip Web Share API entirely if it's likely to fail
  if (!isShareAvailable()) {
    fallbackShare(data.title, data.text)
    return
  }

  // Try to use Web Share API with better error handling
  navigator
    .share({
      title: data.title,
      text: data.text,
      url: data.url,
    })
    .catch((error) => {
      console.error("Share failed:", error)
      fallbackShare(data.title, data.text)
    })
}
