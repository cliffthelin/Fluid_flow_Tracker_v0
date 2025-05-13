"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

/**
 * TechnicalCompendium Component
 *
 * This component renders the technical compendium markdown content.
 * It follows the same pattern as the Manual component to ensure
 * consistent rendering of markdown content.
 */
export function TechnicalCompendium() {
  // State to store the compendium content
  const [compendiumContent, setCompendiumContent] = useState<string>("")
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true)
  // State to track error status
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompendium() {
      try {
        // Fetch the technical compendium markdown file
        const response = await fetch("/TECHNICAL_COMPENDIUM.md")
        if (!response.ok) {
          throw new Error(`Failed to fetch compendium: ${response.status}`)
        }

        const text = await response.text()
        setCompendiumContent(text)
        setError(null)
      } catch (error) {
        console.error("Failed to load technical compendium:", error)
        setError("Failed to load the technical compendium. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompendium()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
        <p>{error}</p>
      </div>
    )
  }

  // Simple function to escape HTML tags
  const escapeHtml = (unsafe: string) => {
    return unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  // Function to render a line with bold text
  const renderLineWithBold = (line: string, key: number, className: string) => {
    if (line.includes("**")) {
      const parts = line.split("**")
      return (
        <p key={key} className={className}>
          {parts.map((part, i) => (i % 2 === 0 ? part : <strong key={i}>{part}</strong>))}
        </p>
      )
    }
    return (
      <p key={key} className={className}>
        {line}
      </p>
    )
  }

  return (
    <div className="prose prose-blue dark:prose-invert max-w-none">
      {compendiumContent.split("\n").map((line, index) => {
        // Skip lines that are clearly HTML or CSS
        if (
          (line.trim().startsWith("<") && line.includes(">")) ||
          line.trim().startsWith("--") ||
          line.trim() === "}" ||
          line.trim().startsWith("<!DOCTYPE")
        ) {
          return null
        }

        // Handle headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-50">
              {line.substring(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-50">
              {line.substring(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-50">
              {line.substring(4)}
            </h3>
          )
        }
        if (line.startsWith("#### ")) {
          return (
            <h4 key={index} className="text-lg font-bold mt-3 mb-2 text-gray-900 dark:text-gray-50">
              {line.substring(5)}
            </h4>
          )
        }

        // Handle lists
        if (line.startsWith("- ")) {
          const content = line.substring(2)
          if (content.includes("**")) {
            const parts = content.split("**")
            return (
              <li key={index} className="ml-6 list-disc text-gray-800 dark:text-gray-100">
                {parts.map((part, i) => (i % 2 === 0 ? part : <strong key={i}>{part}</strong>))}
              </li>
            )
          }
          return (
            <li key={index} className="ml-6 list-disc text-gray-800 dark:text-gray-100">
              {content}
            </li>
          )
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(line)) {
          const content = line.replace(/^\d+\.\s/, "")
          return (
            <li key={index} className="ml-6 list-decimal text-gray-800 dark:text-gray-100">
              {content}
            </li>
          )
        }

        // Handle empty lines
        if (line.trim() === "") {
          return <div key={index} className="h-4"></div>
        }

        // Handle paragraphs (including those with bold text)
        return renderLineWithBold(line, index, "my-2 text-gray-800 dark:text-gray-100")
      })}
    </div>
  )
}
