"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type React from "react"

interface CollapsibleSectionProps {
  title: string
  title2?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  titleClassName?: string
  contentClassName?: string
  isExpanded?: boolean
  setIsExpanded?: (expanded: boolean) => void
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  title2,
  children,
  defaultExpanded = true,
  className = "mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200",
  titleClassName = "text-xl font-semibold",
  contentClassName = "",
  isExpanded: controlledIsExpanded,
  setIsExpanded: controlledSetIsExpanded,
}) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

  // Determine if we're using controlled or uncontrolled state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded
  const setIsExpanded = controlledSetIsExpanded || setInternalIsExpanded

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0)
    }
  }, [isExpanded, children])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`${className} ${isExpanded ? "ring-1 ring-blue-100 dark:ring-blue-900/30" : ""}`}>
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
        onClick={toggleExpand}
      >
        <h2 className={`${titleClassName} text-gray-900 dark:text-gray-100 flex items-center`}>
          {title2}
          {title}
        </h2>
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      <div
        ref={contentRef}
        style={{ maxHeight: contentHeight }}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className={`p-4 pt-0 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  )
}

export default CollapsibleSection
