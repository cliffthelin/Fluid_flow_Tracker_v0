/**
 * Utility function to safely load JSON data from a file
 * @param path Path to the JSON file
 * @returns Parsed JSON data or null if there was an error
 * @throws Error if the file cannot be loaded or parsed
 */
export async function loadJsonFile<T>(path: string): Promise<T | null> {
  try {
    console.log(`Attempting to load JSON from ${path}...`)

    const response = await fetch(path, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Prevent caching issues
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
    }

    // Get the response text first to check if it's valid JSON
    const text = await response.text()

    // Check if the response looks like HTML
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      throw new Error(`Response contains HTML instead of JSON. This usually means the file doesn't exist at ${path}`)
    }

    try {
      const data = JSON.parse(text) as T
      console.log(`Successfully loaded JSON data from ${path}`)
      return data
    } catch (parseError) {
      console.error(`Error parsing JSON from ${path}:`, parseError)
      console.error(`First 100 characters of response:`, text.substring(0, 100))
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
  } catch (error) {
    console.error(`Error loading JSON from ${path}:`, error)
    throw error
  }
}
