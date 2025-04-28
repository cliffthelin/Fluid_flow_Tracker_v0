import type { FormFieldConfig } from "../types/config"

/**
 * Evaluates a formula based on field values
 * @param formula The calculation formula configuration
 * @param fieldValues Object containing field values by field ID
 * @returns The calculated value or null if calculation cannot be performed
 */
export function evaluateFormula(
  formula: FormFieldConfig["calculationFormula"],
  fieldValues: Record<string, any>,
): number | null {
  if (!formula) return null

  // Check if all operands have values
  const operandValues = formula.operands.map((fieldId) => {
    const value = fieldValues[fieldId]
    return typeof value === "number" ? value : null
  })

  if (operandValues.some((value) => value === null)) return null

  // Perform calculation based on operator
  switch (formula.operator) {
    case "+":
      return operandValues.reduce((sum, value) => sum + value, 0)
    case "-":
      return operandValues.length === 2 ? operandValues[0] - operandValues[1] : null
    case "*":
      return operandValues.reduce((product, value) => product * value, 1)
    case "/":
      return operandValues.length === 2 && operandValues[1] !== 0 ? operandValues[0] / operandValues[1] : null
    case "custom":
      if (formula.customFormula) {
        try {
          // Create a safe evaluation context with only the field values
          const evalContext: Record<string, number> = {}
          formula.operands.forEach((fieldId, index) => {
            evalContext[fieldId] = operandValues[index]
          })

          // Replace field IDs with their values in the custom formula
          let evalFormula = formula.customFormula
          for (const fieldId of formula.operands) {
            evalFormula = evalFormula.replace(new RegExp(fieldId, "g"), evalContext[fieldId].toString())
          }

          // Use Function constructor for safer evaluation
          const result = new Function(`return ${evalFormula}`)()
          return typeof result === "number" ? result : null
        } catch (error) {
          console.error("Error evaluating custom formula:", error)
          return null
        }
      }
      return null
    default:
      return null
  }
}

/**
 * Updates calculated fields in an entry based on form configuration
 * @param entry The entry object with field values
 * @param tabConfig The tab configuration containing field definitions
 * @returns A new entry object with updated calculated fields
 */
export function updateCalculatedFields(
  entry: Record<string, any>,
  tabConfig: Record<string, FormFieldConfig>,
): Record<string, any> {
  const updatedEntry = { ...entry }

  // Find all calculated fields
  const calculatedFields = Object.values(tabConfig).filter((field) => field.isCalculated && field.calculationFormula)

  // Update each calculated field
  for (const field of calculatedFields) {
    if (field.calculationFormula) {
      const value = evaluateFormula(field.calculationFormula, entry)
      if (value !== null) {
        updatedEntry[field.id] = value
      }
    }
  }

  return updatedEntry
}
