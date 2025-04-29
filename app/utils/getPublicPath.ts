/**
 * Utility to help determine the correct path to public files
 * based on the current environment
 */
export function getPublicFilePath(relativePath: string): string {
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath

  // In browser environments, we can check if we're in development or production
  if (typeof window !== "undefined") {
    // Default path for most environments
    return `/${cleanPath}`
  }

  // Default fallback
  return `/${cleanPath}`
}

/**
 * Get all possible paths to try for a file
 */
export function getAllPossiblePaths(relativePath: string): string[] {
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath

  return [
    `/${cleanPath}`,
    `./${cleanPath}`,
    cleanPath,
    `/public/${cleanPath}`,
    `./public/${cleanPath}`,
    `../public/${cleanPath}`,
  ]
}
