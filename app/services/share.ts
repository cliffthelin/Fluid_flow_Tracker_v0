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
      window.location.hostname.includes("127.0.0.1")
    )
  }

  // If we're in an iframe or preview environment, don't even try to use Web Share API
  if (isInIframe() || isInPreviewEnvironment()) {
    return false
  }

  // Otherwise, check if the API is available
  return typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare
}

// Check if file sharing is supported
export const canShareFiles = (): boolean => {
  if (!isShareAvailable()) return false

  try {
    // Test if file sharing is supported
    const testFile = new File(["test"], "test.txt", { type: "text/plain" })
    return navigator.canShare?.({ files: [testFile] }) || false
  } catch (e) {
    return false
  }
}

// Share content, with automatic fallback to clipboard
export const shareContent = (data: {
  title: string
  text: string
  url?: string
}): void => {
  // Skip Web Share API entirely if it's likely to fail
  if (!isShareAvailable()) {
    copyToClipboard(data.title, data.text, data.url)
    return
  }

  // Try to use Web Share API
  navigator
    .share({
      title: data.title,
      text: data.text,
      url: data.url,
    })
    .catch((error) => {
      console.error("Share failed:", error)
      copyToClipboard(data.title, data.text, data.url)
    })
}

// Copy content to clipboard with user notification
export const copyToClipboard = (title: string, text: string, url?: string): void => {
  // Create textarea to copy text
  const textArea = document.createElement("textarea")
  textArea.value = `${title}\n\n${text}${url ? "\n\n" + url : ""}`
  textArea.style.position = "fixed"
  textArea.style.left = "-999999px"
  textArea.style.top = "-999999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand("copy")
    if (successful) {
      alert("Content copied to clipboard! You can now paste it in your messaging app.")
    } else {
      alert("Failed to copy content to clipboard.")
    }
  } catch (err) {
    console.error("Failed to copy text: ", err)
    alert("Failed to copy content to clipboard.")
  }

  document.body.removeChild(textArea)
}

export const safeShare = async (shareData: { title: string; text: string; url?: string }) => {
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.error("Web Share API failed:", error)
      copyToClipboard(shareData.title, shareData.text, shareData.url)
    }
  } else {
    copyToClipboard(shareData.title, shareData.text, shareData.url)
  }
}

export const fallbackShare = (title: string, text: string) => {
  copyToClipboard(title, text)
}
