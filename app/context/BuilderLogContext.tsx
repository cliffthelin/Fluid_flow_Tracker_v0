"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useBuilderLog, type BuilderLogEntry } from "../hooks/useBuilderLog"

interface BuilderLogContextType {
  logEntries: BuilderLogEntry[]
  addLogEntry: (entry: Omit<BuilderLogEntry, "id" | "timestamp">) => BuilderLogEntry
  updateLogEntry: (id: string, updates: Partial<BuilderLogEntry>) => void
  deleteLogEntry: (id: string) => void
}

const BuilderLogContext = createContext<BuilderLogContextType | undefined>(undefined)

export function BuilderLogProvider({ children }: { children: ReactNode }) {
  const builderLog = useBuilderLog()

  return <BuilderLogContext.Provider value={builderLog}>{children}</BuilderLogContext.Provider>
}

export function useBuilderLogContext() {
  const context = useContext(BuilderLogContext)
  if (context === undefined) {
    throw new Error("useBuilderLogContext must be used within a BuilderLogProvider")
  }
  return context
}
