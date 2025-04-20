// This is a simple test to verify the Manual component works correctly
export function testManualComponent() {
  // Check if the Manual.md file is accessible
  return fetch("/Manual.md")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Manual.md: ${response.status}`)
      }
      return response.text()
    })
    .then((text) => {
      // Check if the content is valid markdown
      if (!text || text.trim() === "") {
        throw new Error("Manual.md is empty")
      }

      // Check if it has at least one heading
      if (!text.includes("# ")) {
        throw new Error("Manual.md does not contain any headings")
      }

      return {
        success: true,
        message: "Manual.md is accessible and contains valid content",
        contentLength: text.length,
      }
    })
    .catch((error) => {
      return {
        success: false,
        message: error.message,
      }
    })
}
