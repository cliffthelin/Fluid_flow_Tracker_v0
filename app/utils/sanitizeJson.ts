/**
 * Sanitizes a JSON string by removing control characters
 * @param jsonString The JSON string to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJson(jsonString: string): string {
  if (!jsonString) return jsonString

  // Replace control characters that can cause JSON parsing errors
  return jsonString
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\") // Escape backslashes that aren't part of valid escape sequences
}

/**
 * Safely parses a JSON string, attempting to sanitize it if initial parsing fails
 * @param jsonString The JSON string to parse
 * @returns Parsed JSON object or null if parsing fails
 */
export function safeParseJson<T>(jsonString: string): T | null {
  try {
    // First try parsing the original string
    return JSON.parse(jsonString) as T
  } catch (error) {
    try {
      // If that fails, try sanitizing and parsing again
      const sanitized = sanitizeJson(jsonString)
      return JSON.parse(sanitized) as T
    } catch (sanitizedError) {
      console.error("Failed to parse JSON even after sanitization:", sanitizedError)
      return null
    }
  }
}
