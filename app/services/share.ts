// Check if Web Share API is available and likely to work
export const isShareAvailable = (): boolean => {
  // Check if we're in an iframe, which often blocks Web Share API
  const isInIframe = () => {
    try {
      return window.self !== window.top
    } catch (e) {
      return true // If we can't access parent window, we're in an iframe
    }
  }

  // Check if we're in a preview environment (common in development tools)
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

export const fallbackShare = (title: string, text: string): void => {
  const textArea = document.createElement("textarea")
  textArea.value = `${title}\n${text}`
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "-9999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
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

  document.body.removeChild(textArea)
}

interface ShareData {
  title: string
  text: string
  url?: string
  files?: File[]
}

export const safeShare = async (data: ShareData): Promise<void> => {
  try {
    // Skip Web Share API entirely if it's likely to fail
    if (!isShareAvailable()) {
      throw new Error("Web Share API not available in this environment")
    }

    await navigator.share(data)
  } catch (error: any) {
    console.error("Sharing failed:", error)

    // Always fall back to clipboard
    fallbackShare(data.title, data.text || "")
  }
}

// Helper function to share content with automatic fallback
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
