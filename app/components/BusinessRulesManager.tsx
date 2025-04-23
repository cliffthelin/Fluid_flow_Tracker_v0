"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { businessRulesRegistry, type BusinessRule } from "../services/importRules"
import { GripVertical, Check, X, Info, ArrowUp, ArrowDown } from "lucide-react"

interface BusinessRulesManagerProps {
  onRulesUpdated?: () => void
}

export default function BusinessRulesManager({ onRulesUpdated }: BusinessRulesManagerProps) {
  const [rules, setRules] = useState<BusinessRule[]>([])
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null)

  // Load rules on component mount
  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = () => {
    const currentRules = businessRulesRegistry.getRules()
    setRules(currentRules)
  }

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    businessRulesRegistry.setRuleEnabled(ruleId, enabled)
    loadRules()
    if (onRulesUpdated) onRulesUpdated()
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      businessRulesRegistry.reorderRule(index, index - 1)
      loadRules()
      if (onRulesUpdated) onRulesUpdated()
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < rules.length - 1) {
      businessRulesRegistry.reorderRule(index, index + 1)
      loadRules()
      if (onRulesUpdated) onRulesUpdated()
    }
  }

  const handleDragStart = (ruleId: string) => {
    setIsDragging(true)
    setDraggedRuleId(ruleId)
  }

  const handleDragOver = (e: React.DragEvent, targetRuleId: string) => {
    e.preventDefault()
    if (draggedRuleId && draggedRuleId !== targetRuleId) {
      const draggedIndex = rules.findIndex((rule) => rule.id === draggedRuleId)
      const targetIndex = rules.findIndex((rule) => rule.id === targetRuleId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Visual feedback could be added here
      }
    }
  }

  const handleDrop = (e: React.DragEvent, targetRuleId: string) => {
    e.preventDefault()
    if (draggedRuleId && draggedRuleId !== targetRuleId) {
      const draggedIndex = rules.findIndex((rule) => rule.id === draggedRuleId)
      const targetIndex = rules.findIndex((rule) => rule.id === targetRuleId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        businessRulesRegistry.reorderRule(draggedIndex, targetIndex)
        loadRules()
        if (onRulesUpdated) onRulesUpdated()
      }
    }
    setIsDragging(false)
    setDraggedRuleId(null)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedRuleId(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Import Business Rules</h3>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className={`border rounded-lg ${
              rule.enabled ? "border-blue-200 dark:border-blue-800" : "border-gray-200 dark:border-gray-700"
            } ${draggedRuleId === rule.id ? "opacity-50" : "opacity-100"}`}
            draggable
            onDragStart={() => handleDragStart(rule.id)}
            onDragOver={(e) => handleDragOver(e, rule.id)}
            onDrop={(e) => handleDrop(e, rule.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center p-3">
              <div
                className="cursor-move mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Drag to reorder"
              >
                <GripVertical size={20} />
              </div>

              <div className="flex-1">
                <div className="font-medium">{rule.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{rule.description}</div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    index === 0 ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === rules.length - 1}
                  className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    index === rules.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>

                <button
                  onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Toggle details"
                >
                  <Info size={16} />
                </button>

                <button
                  onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                  className={`p-1 rounded ${
                    rule.enabled
                      ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                  }`}
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  {rule.enabled ? <Check size={16} /> : <X size={16} />}
                </button>
              </div>
            </div>

            {expandedRuleId === rule.id && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                <div className="text-sm">
                  <p className="mb-2">
                    <strong>Description:</strong> {rule.description}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {rule.enabled ? "Enabled" : "Disabled"}
                  </p>
                  <p>
                    <strong>Execution Order:</strong> {rule.order}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">No business rules defined</div>
      )}
    </div>
  )
}
