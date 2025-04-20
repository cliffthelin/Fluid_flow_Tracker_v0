"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleSectionProps {
  title: string
  defaultExpanded?: boolean
  children: React.ReactNode
  title2?: React.ReactNode
  className?: string
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = false,
  children,
  title2,
  className = "mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={className}>
      <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="text-xl font-semibold flex items-center">
          {title2}
          {title}
        </h2>
        <div className="text-gray-500">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>
      {isExpanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  )
}

export default CollapsibleSection
