import type { BuilderLogEntry } from "../hooks/useBuilderLog"

/**
 * Tests that the builder log contains all expected entries
 * @param entries The current log entries
 * @returns An object with test results
 */
export function testBuilderLogCompleteness(entries: BuilderLogEntry[]) {
  const results = {
    totalEntries: entries.length,
    expectedTotal: 105, // Total number of expected entries
    isTotalCorrect: false,
    entriesByDate: {} as Record<string, number>,
    expectedByDate: {
      "2025-03-31": 1,
      "2025-04-12": 11,
      "2025-04-13": 10,
      "2025-04-14": 10,
      "2025-04-15": 10,
      "2025-04-18": 11,
      "2025-04-20": 53, // Including the most recent entries
    },
    areDateTotalsCorrect: false,
    hasSequentialCounts: false,
    missingCounts: [] as number[],
  }

  // Check total count
  results.isTotalCorrect = entries.length === results.expectedTotal

  // Check entries by date
  entries.forEach((entry) => {
    const date = new Date(entry.timestamp).toISOString().split("T")[0]
    results.entriesByDate[date] = (results.entriesByDate[date] || 0) + 1
  })

  // Check if date totals match expected
  let allDateTotalsCorrect = true
  Object.entries(results.expectedByDate).forEach(([date, count]) => {
    if ((results.entriesByDate[date] || 0) !== count) {
      allDateTotalsCorrect = false
    }
  })
  results.areDateTotalsCorrect = allDateTotalsCorrect

  // Check for sequential counts
  const counts = entries.map((entry) => entry.count).sort((a, b) => a - b)
  const expectedCounts = Array.from({ length: results.expectedTotal }, (_, i) => i + 1)

  results.hasSequentialCounts =
    counts.length === expectedCounts.length && counts.every((count, i) => count === expectedCounts[i])

  // Find missing counts
  if (!results.hasSequentialCounts) {
    expectedCounts.forEach((count) => {
      if (!counts.includes(count)) {
        results.missingCounts.push(count)
      }
    })
  }

  return results
}

/**
 * Runs the builder log completeness test and logs the results
 * @param entries The current log entries
 */
export function runBuilderLogTest(entries: BuilderLogEntry[]) {
  const results = testBuilderLogCompleteness(entries)

  console.log("Builder Log Test Results:")
  console.log(
    `Total entries: ${results.totalEntries}/${results.expectedTotal} (${results.isTotalCorrect ? "PASS" : "FAIL"})`,
  )
  console.log("Entries by date:")

  Object.entries(results.expectedByDate).forEach(([date, expectedCount]) => {
    const actualCount = results.entriesByDate[date] || 0
    console.log(`  ${date}: ${actualCount}/${expectedCount} (${actualCount === expectedCount ? "PASS" : "FAIL"})`)
  })

  console.log(`Sequential counts: ${results.hasSequentialCounts ? "PASS" : "FAIL"}`)

  if (results.missingCounts.length > 0) {
    console.log(`Missing counts: ${results.missingCounts.join(", ")}`)
  }

  return results
}
