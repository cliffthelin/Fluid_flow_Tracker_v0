/**
 * Header Component Test
 *
 * This test verifies that the header is not sticky (fixed) when scrolling.
 */

export function testHeaderNotSticky(): { success: boolean; message: string } {
  try {
    // Find the header element
    const header = document.querySelector("header")

    if (!header) {
      return { success: false, message: "Header element not found" }
    }

    // Check if header has sticky or fixed position
    const headerStyles = window.getComputedStyle(header)
    const position = headerStyles.position

    if (position === "sticky" || position === "fixed") {
      return {
        success: false,
        message: `Header has position: ${position}, expected: static or relative`,
      }
    }

    // Test passed
    return { success: true, message: "Header is not sticky and scrolls away as expected" }
  } catch (error) {
    return {
      success: false,
      message: `Test threw an error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
