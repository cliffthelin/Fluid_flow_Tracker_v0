import type { UroLog, HydroLog, KegelLog } from "../types"

// Define the types for our business rules system
export type LogEntryType = UroLog | HydroLog | KegelLog
export type LogType = "UroLog" | "HydroLog" | "KegelLog"

export interface RuleContext {
  entry: LogEntryType
  logType: LogType
  existingEntries: LogEntryType[]
  importBatch: LogEntryType[]
}

export interface BusinessRule {
  id: string
  name: string
  description: string
  enabled: boolean
  order: number
  apply: (context: RuleContext) => {
    action: "accept" | "reject" | "modify"
    modifiedEntry?: LogEntryType
    reason?: string
  }
}

// Create a registry for business rules
class BusinessRulesRegistry {
  private rules: BusinessRule[] = []

  constructor() {
    // Initialize with default rules
    this.registerDefaultRules()
  }

  // Register a new rule
  registerRule(rule: BusinessRule): void {
    // Check if rule with this ID already exists
    const existingRuleIndex = this.rules.findIndex((r) => r.id === rule.id)

    if (existingRuleIndex >= 0) {
      // Update existing rule
      this.rules[existingRuleIndex] = rule
    } else {
      // Add new rule
      this.rules.push(rule)
    }

    // Sort rules by order
    this.sortRules()
  }

  // Get all registered rules
  getRules(): BusinessRule[] {
    return [...this.rules]
  }

  // Get a specific rule by ID
  getRule(id: string): BusinessRule | undefined {
    return this.rules.find((rule) => rule.id === id)
  }

  // Update rule properties
  updateRule(id: string, updates: Partial<BusinessRule>): void {
    const ruleIndex = this.rules.findIndex((rule) => rule.id === id)
    if (ruleIndex >= 0) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
      this.sortRules()
    }
  }

  // Enable or disable a rule
  setRuleEnabled(id: string, enabled: boolean): void {
    const rule = this.getRule(id)
    if (rule) {
      rule.enabled = enabled
    }
  }

  // Change rule order
  setRuleOrder(id: string, order: number): void {
    const rule = this.getRule(id)
    if (rule) {
      rule.order = order
      this.sortRules()
    }
  }

  // Reorder rules (move a rule from one position to another)
  reorderRule(fromIndex: number, toIndex: number): void {
    if (
      fromIndex >= 0 &&
      fromIndex < this.rules.length &&
      toIndex >= 0 &&
      toIndex < this.rules.length &&
      fromIndex !== toIndex
    ) {
      // Get the rule to move
      const rule = this.rules[fromIndex]

      // Remove the rule from its current position
      this.rules.splice(fromIndex, 1)

      // Insert the rule at the new position
      this.rules.splice(toIndex, 0, rule)

      // Update order numbers for all rules
      this.rules.forEach((rule, index) => {
        rule.order = index + 1
      })
    }
  }

  // Sort rules by order
  private sortRules(): void {
    this.rules.sort((a, b) => a.order - b.order)
  }

  // Apply all enabled rules to an entry
  applyRules(context: RuleContext): {
    action: "accept" | "reject" | "modify"
    modifiedEntry?: LogEntryType
    reason?: string
    appliedRules: string[]
  } {
    let currentEntry = context.entry
    let finalAction: "accept" | "reject" | "modify" = "accept"
    let finalReason: string | undefined
    const appliedRules: string[] = []

    // Apply each enabled rule in order
    for (const rule of this.rules.filter((r) => r.enabled)) {
      const ruleContext = {
        ...context,
        entry: currentEntry,
      }

      const result = rule.apply(ruleContext)

      // Track which rule was applied
      appliedRules.push(rule.id)

      if (result.action === "reject") {
        // If any rule rejects, we're done
        return {
          action: "reject",
          reason: result.reason || `Rejected by rule: ${rule.name}`,
          appliedRules,
        }
      } else if (result.action === "modify" && result.modifiedEntry) {
        // Update the entry for the next rule
        currentEntry = result.modifiedEntry
        finalAction = "modify"
      }

      // Keep track of the last reason
      if (result.reason) {
        finalReason = result.reason
      }
    }

    return {
      action: finalAction,
      modifiedEntry: finalAction === "modify" ? currentEntry : undefined,
      reason: finalReason,
      appliedRules,
    }
  }

  // Register the default business rules
  private registerDefaultRules(): void {
    // Rule 1: GUID Matching
    this.registerRule({
      id: "guid-matching",
      name: "GUID Matching",
      description: "Check for matching GUIDs and resolve discrepancies in receiving date/time",
      enabled: true,
      order: 1,
      apply: (context) => {
        const { entry, importBatch } = context

        // Check if entry has a GUID
        if (!("guid" in entry) || !entry.guid) {
          // No GUID to match, pass through
          return { action: "accept" }
        }

        // Look for other entries with the same GUID in the current import batch
        const matchingEntries = importBatch.filter((e) => "guid" in e && e.guid === (entry as any).guid && e !== entry)

        if (matchingEntries.length === 0) {
          // No matching GUIDs found, pass through
          return { action: "accept" }
        }

        // Found matching GUIDs, resolve discrepancies
        // For this example, we'll keep the entry with the most recent timestamp
        const allMatchingEntries = [entry, ...matchingEntries]
        const sortedEntries = allMatchingEntries.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

        const mostRecentEntry = sortedEntries[0]

        if (mostRecentEntry === entry) {
          // Current entry is the most recent, keep it
          return {
            action: "accept",
            reason: "Kept as most recent entry with matching GUID",
          }
        } else {
          // Another entry is more recent, reject this one
          return {
            action: "reject",
            reason: "Rejected due to more recent entry with same GUID",
          }
        }
      },
    })

    // Rule 2: Data Combination
    this.registerRule({
      id: "data-combination",
      name: "Data Combination",
      description:
        "If the import data contains separate date and time fields, combine them into a single, usable datetime value.",
      enabled: true,
      order: 2,
      apply: (context) => {
        const { entry } = context

        // Check if entry has separate date and time fields
        if (!("date" in entry) || !("time" in entry)) {
          // No separate date and time fields, pass through
          return { action: "accept" }
        }

        // Combine date and time fields
        const date = (entry as any).date
        const time = (entry as any).time

        if (!date || !time) {
          return {
            action: "reject",
            reason: "Missing date or time field",
          }
        }

        const combinedTimestamp = new Date(`${date} ${time}`).toISOString()

        // Modify the entry to use the combined timestamp
        const modifiedEntry = {
          ...entry,
          timestamp: combinedTimestamp,
        }

        return {
          action: "modify",
          modifiedEntry,
          reason: "Combined date and time fields into a single timestamp",
        }
      },
    })

    // Rule 3: Entry Log Handling (Skip Duplicates)
    this.registerRule({
      id: "skip-duplicates",
      name: "Skip Duplicate Entries",
      description: "Skip entry logs with the same date, hour, and minute as existing entries",
      enabled: true,
      order: 3,
      apply: (context) => {
        const { entry, existingEntries, logType } = context

        // Parse the timestamp
        const entryDate = new Date(entry.timestamp)

        // Check for existing entries with the same date, hour, and minute
        const duplicates = existingEntries.filter((existingEntry) => {
          const existingDate = new Date(existingEntry.timestamp)

          return existingDate.getFullYear() === entryDate.getFullYear() &&
            existingDate.getMonth() === entryDate.getMonth() &&
            existingDate.getDate() === entryDate.getDate() &&
            existingDate.getHours() === entryDate.getHours() &&
            existingDate.getMinutes() === entryDate.getMinutes() &&
            // Only compare entries of the same type
            "type" in existingEntry &&
            "type" in entry
            ? (existingEntry as any).type === (entry as any).type
            : true
        })

        if (duplicates.length > 0) {
          // Found duplicate entries, reject
          return {
            action: "reject",
            reason: `Duplicate entry found with same date, hour, and minute (${entryDate.toLocaleString()})`,
          }
        }

        // No duplicates found, accept
        return { action: "accept" }
      },
    })
  }
}

// Create and export a singleton instance
export const businessRulesRegistry = new BusinessRulesRegistry()

// Helper function to apply rules to a batch of entries
export async function applyBusinessRulesToBatch<T extends LogEntryType>(
  entries: T[],
  logType: LogType,
  existingEntries: T[],
): Promise<{
  accepted: T[]
  modified: T[]
  rejected: T[]
  rejectionReasons: Record<string, string>
}> {
  const accepted: T[] = []
  const modified: T[] = []
  const rejected: T[] = []
  const rejectionReasons: Record<string, string> = {}

  // Process each entry through the rules
  for (const entry of entries) {
    const result = businessRulesRegistry.applyRules({
      entry,
      logType,
      existingEntries,
      importBatch: entries,
    })

    if (result.action === "reject") {
      rejected.push(entry)
      if (result.reason) {
        rejectionReasons[entry.timestamp] = result.reason
      }
    } else if (result.action === "modify" && result.modifiedEntry) {
      modified.push(result.modifiedEntry as T)
    } else {
      accepted.push(entry)
    }
  }

  return {
    accepted,
    modified,
    rejected,
    rejectionReasons,
  }
}
