"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Plus, X, Calculator } from "lucide-react"
import type { FormFieldConfig } from "../types/config"

interface FormulaBuilderProps {
  field: FormFieldConfig
  availableFields: FormFieldConfig[]
  onChange: (formula: FormFieldConfig["calculationFormula"]) => void
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ field, availableFields, onChange }) => {
  const [operator, setOperator] = useState<"+" | "-" | "*" | "/" | "custom">(field.calculationFormula?.operator || "+")
  const [operands, setOperands] = useState<string[]>(field.calculationFormula?.operands || [])
  const [customFormula, setCustomFormula] = useState<string>(field.calculationFormula?.customFormula || "")

  // Use a ref to track if we need to update the parent
  const initialRenderRef = useRef(true)
  const formulaRef = useRef({ operator, operands, customFormula })

  // Filter out the current field and non-numeric fields from available fields
  const eligibleFields = availableFields.filter(
    (f) => f.id !== field.id && (f.type === "number" || f.type === "calculated"),
  )

  // Only update the parent when there's an actual change, not on initial render
  useEffect(() => {
    // Skip the first render
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      return
    }

    // Check if the formula has actually changed
    const prevFormula = formulaRef.current
    if (
      prevFormula.operator !== operator ||
      prevFormula.customFormula !== customFormula ||
      JSON.stringify(prevFormula.operands) !== JSON.stringify(operands)
    ) {
      // Update our ref with the new values
      formulaRef.current = { operator, operands, customFormula }

      // Only then call onChange
      onChange({
        operator,
        operands,
        ...(operator === "custom" ? { customFormula } : {}),
      })
    }
  }, [operator, operands, customFormula, onChange])

  const handleAddOperand = (fieldId: string) => {
    if (!operands.includes(fieldId)) {
      setOperands([...operands, fieldId])
    }
  }

  const handleRemoveOperand = (fieldId: string) => {
    setOperands(operands.filter((id) => id !== fieldId))
  }

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find((f) => f.id === fieldId)
    return field ? field.label : fieldId
  }

  const renderOperatorDescription = () => {
    switch (operator) {
      case "+":
        return "Sum of all selected fields"
      case "-":
        return "First field minus second field"
      case "*":
        return "Product of all selected fields"
      case "/":
        return "First field divided by second field"
      case "custom":
        return "Custom formula using field IDs"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Operation</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as "+" | "-" | "*" | "/" | "custom")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
        >
          <option value="+">Addition (+)</option>
          <option value="-">Subtraction (-)</option>
          <option value="*">Multiplication (×)</option>
          <option value="/">Division (÷)</option>
          <option value="custom">Custom Formula</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">{renderOperatorDescription()}</p>
      </div>

      {operator === "custom" ? (
        <div>
          <label className="block text-sm font-medium mb-1">Custom Formula</label>
          <input
            type="text"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            placeholder="e.g., field1 * (field2 + field3)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use field IDs in your formula. Available fields: {eligibleFields.map((f) => f.id).join(", ")}
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Selected Fields</label>
            {operands.length === 0 ? (
              <p className="text-sm text-gray-500">No fields selected</p>
            ) : (
              <ul className="space-y-2">
                {operands.map((fieldId, index) => (
                  <li key={fieldId} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                    <span>
                      {index + 1}. {getFieldLabel(fieldId)} ({fieldId})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOperand(fieldId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Add Field</label>
            <div className="flex space-x-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                disabled={eligibleFields.length === 0}
                id="field-selector"
              >
                <option value="">Select a field to add</option>
                {eligibleFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label} ({field.id})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const select = document.getElementById("field-selector") as HTMLSelectElement
                  if (select && select.value) {
                    handleAddOperand(select.value)
                    select.value = ""
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={eligibleFields.length === 0}
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
          </div>
        </>
      )}

      <div className="pt-2 border-t dark:border-gray-600">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calculator size={16} className="mr-2" />
          <span>
            {operator === "custom"
              ? `Formula: ${customFormula}`
              : `Formula: ${operands.map((id) => getFieldLabel(id)).join(` ${operator} `)}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FormulaBuilder
