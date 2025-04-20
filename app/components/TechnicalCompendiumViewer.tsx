/**
 * TechnicalCompendiumViewer Component
 *
 * This component provides a viewer for the technical compendium document.
 * It fetches the markdown content, renders it with syntax highlighting,
 * and provides navigation controls.
 */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FileText, ChevronUp, ChevronDown, Search, X, Loader2 } from "lucide-react"

export function TechnicalCompendiumViewer() {
  // State to store the compendium content
  const [content, setContent] = useState<string>("")
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true)
  // State to track error status
  const [error, setError] = useState<string | null>(null)
  // State to store the search query
  const [searchQuery, setSearchQuery] = useState("")
  // State to track if search is active
  const [isSearching, setIsSearching] = useState(false)
  // State to store search results
  const [searchResults, setSearchResults] = useState<Array<{ index: number; text: string }>>([])
  // State to track current search result index
  const [currentResultIndex, setCurrentResultIndex] = useState(0)

  /**
   * Fetches the technical compendium content
   */
  useEffect(() => {
    async function fetchCompendium() {
      setIsLoading(true)
      try {
        // Fetch the compendium markdown file
        const response = await fetch("/TECHNICAL_COMPENDIUM.md")
        if (!response.ok) {
          throw new Error(`Failed to fetch compendium: ${response.status}`)
        }

        const text = await response.text()
        setContent(text)
        setError(null)
      } catch (error) {
        console.error("Failed to load compendium:", error)
        setError("Failed to load the technical compendium. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompendium()
  }, [])

  /**
   * Handles search query changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value === "") {
      setIsSearching(false)
      setSearchResults([])
    }
  }

  /**
   * Executes the search
   */
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Split content into lines for better context
    const lines = content.split("\n")
    const results: Array<{ index: number; text: string }> = []

    // Search for query in each line
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ index, text: line })
      }
    })

    setSearchResults(results)
    setCurrentResultIndex(0)

    // Scroll to first result if found
    if (results.length > 0) {
      scrollToResult(0)
    }
  }

  /**
   * Navigates to the next search result
   */
  const nextResult = () => {
    if (searchResults.length === 0) return

    const newIndex = (currentResultIndex + 1) % searchResults.length
    setCurrentResultIndex(newIndex)
    scrollToResult(newIndex)
  }

  /**
   * Navigates to the previous search result
   */
  const prevResult = () => {
    if (searchResults.length === 0) return

    const newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length
    setCurrentResultIndex(newIndex)
    scrollToResult(newIndex)
  }

  /**
   * Scrolls to a specific search result
   */
  const scrollToResult = (index: number) => {
    const resultElement = document.getElementById(`search-result-${index}`)
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  /**
   * Clears the search
   */
  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
    setSearchResults([])
  }

  /**
   * Renders the compendium content with search highlighting
   */
  const renderContent = () => {
    if (!content) return null

    // Split content into lines
    const lines = content.split("\n")

    return (
      <div className="prose prose-blue dark:prose-invert max-w-none">
        {lines.map((line, index) => {
          // Check if this line is a search result
          const isSearchResult = isSearching && searchResults.some((result) => result.index === index)
          const isCurrentResult = isSearchResult && searchResults[currentResultIndex]?.index === index

          // Handle headings
          if (line.startsWith("# ")) {
            return (
              <h1
                key={index}
                id={`line-${index}`}
                className={`text-3xl font-bold mt-6 mb-4 ${isSearchResult ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isCurrentResult ? "ring-2 ring-blue-500" : ""}`}
                {...(isSearchResult
                  ? { id: `search-result-${searchResults.findIndex((r) => r.index === index)}` }
                  : {})}
              >
                {highlightSearchText(line, searchQuery)}
              </h1>
            )
          }
          if (line.startsWith("## ")) {
            return (
              <h2
                key={index}
                id={`line-${index}`}
                className={`text-2xl font-bold mt-5 mb-3 ${isSearchResult ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isCurrentResult ? "ring-2 ring-blue-500" : ""}`}
                {...(isSearchResult
                  ? { id: `search-result-${searchResults.findIndex((r) => r.index === index)}` }
                  : {})}
              >
                {highlightSearchText(line.substring(3), searchQuery)}
              </h2>
            )
          }
          if (line.startsWith("### ")) {
            return (
              <h3
                key={index}
                id={`line-${index}`}
                className={`text-xl font-bold mt-4 mb-2 ${isSearchResult ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isCurrentResult ? "ring-2 ring-blue-500" : ""}`}
                {...(isSearchResult
                  ? { id: `search-result-${searchResults.findIndex((r) => r.index === index)}` }
                  : {})}
              >
                {highlightSearchText(line.substring(4), searchQuery)}
              </h3>
            )
          }

          // Handle code blocks
          if (line.startsWith("```")) {
            return (
              <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <code>{line.substring(3)}</code>
              </pre>
            )
          }

          // Handle list items
          if (line.startsWith("- ")) {
            return (
              <li
                key={index}
                className={`ml-6 ${isSearchResult ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isCurrentResult ? "ring-2 ring-blue-500" : ""}`}
                {...(isSearchResult
                  ? { id: `search-result-${searchResults.findIndex((r) => r.index === index)}` }
                  : {})}
              >
                {highlightSearchText(line.substring(2), searchQuery)}
              </li>
            )
          }

          // Handle empty lines
          if (line.trim() === "") {
            return <div key={index} className="h-4"></div>
          }

          // Handle regular paragraphs
          return (
            <p
              key={index}
              className={`my-2 ${isSearchResult ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isCurrentResult ? "ring-2 ring-blue-500" : ""}`}
              {...(isSearchResult ? { id: `search-result-${searchResults.findIndex((r) => r.index === index)}` } : {})}
            >
              {highlightSearchText(line, searchQuery)}
            </p>
          )
        })}
      </div>
    )
  }

  /**
   * Highlights search text in a string
   */
  const highlightSearchText = (text: string, query: string) => {
    if (!query || !isSearching) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText className="mr-2 text-blue-500" size={24} />
          Technical Compendium
        </h2>

        {/* Search controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search compendium..."
              className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Search results navigation */}
      {isSearching && searchResults.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
          <span className="text-sm">
            {currentResultIndex + 1} of {searchResults.length} results
          </span>
          <div className="flex space-x-2">
            <button
              onClick={prevResult}
              className="p-1 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              aria-label="Previous result"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={nextResult}
              className="p-1 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              aria-label="Next result"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        // Error state
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
          <p>{error}</p>
        </div>
      ) : (
        // Content
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>
      )}
    </div>
  )
}
