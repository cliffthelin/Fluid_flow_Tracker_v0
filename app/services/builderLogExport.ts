import type { BuilderLogEntry } from "../hooks/useBuilderLog"

export function exportBuilderLogToMarkdown(entries: BuilderLogEntry[]): string {
  let markdown = "# Flow Tracker App - Builders Log\n\n"
  markdown +=
    "This document tracks the development process, issues encountered, and solutions implemented during the building of the Flow Tracker app.\n\n"

  // Create table header
  markdown +=
    "| User Input | App Builder Output | Raw Response | AppBuilder Error Resolution | User Requested Refactor | Validation Test | Timestamp |\n"
  markdown +=
    "|------------|-------------------|--------------|----------------------------|-------------------------|----------------|----------|\n"

  // Add entries
  entries.forEach((entry) => {
    // Truncate raw response to a reasonable length for the markdown table
    const truncatedRawResponse =
      entry.rawResponse.length > 100 ? entry.rawResponse.substring(0, 100) + "..." : entry.rawResponse

    // Escape pipe characters in all fields to prevent breaking the markdown table
    const escapedUserInput = entry.userInput.replace(/\|/g, "\\|")
    const escapedBuilderOutput = entry.builderOutput.replace(/\|/g, "\\|")
    const escapedRawResponse = truncatedRawResponse.replace(/\|/g, "\\|")
    const escapedErrorResolution = entry.errorResolution.replace(/\|/g, "\\|")
    const escapedUserRequest = entry.userRequest.replace(/\|/g, "\\|")
    const escapedValidationTest = entry.validationTest.replace(/\|/g, "\\|")

    const timestamp = new Date(entry.timestamp).toLocaleString()

    markdown += `| ${escapedUserInput} | ${escapedBuilderOutput} | ${escapedRawResponse} | ${escapedErrorResolution} | ${escapedUserRequest} | ${escapedValidationTest} | ${timestamp} |\n`
  })

  return markdown
}

export function downloadBuilderLog(entries: BuilderLogEntry[]) {
  const markdown = exportBuilderLogToMarkdown(entries)
  const blob = new Blob([markdown], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "builders-log.md"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
