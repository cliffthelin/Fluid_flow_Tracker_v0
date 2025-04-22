"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Download, Settings, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AutoBackupSettingsProps {
  triggerBackup: () => void
}

export default function AutoBackupSettings({ triggerBackup }: AutoBackupSettingsProps) {
  const { toast } = useToast()
  // Auto-backup settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [backupFrequency, setBackupFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [backupDay, setBackupDay] = useState<number>(1) // Day of week (0-6) or day of month (1-31)
  const [backupTime, setBackupTime] = useState("12:00")
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null)
  const [nextBackupDate, setNextBackupDate] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null)

  // Add these new state variables after the existing state declarations
  const [lastBackupNowTime, setLastBackupNowTime] = useState<number | null>(null)
  const [backupButtonCountdown, setBackupButtonCountdown] = useState<number>(0)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("autoBackupSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setAutoBackupEnabled(settings.enabled)
        setBackupFrequency(settings.frequency)
        setBackupDay(settings.day)
        setBackupTime(settings.time)
        setLastBackupDate(settings.lastBackup)
      } catch (error) {
        console.error("Error parsing auto-backup settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      enabled: autoBackupEnabled,
      frequency: backupFrequency,
      day: backupDay,
      time: backupTime,
      lastBackup: lastBackupDate,
    }
    localStorage.setItem("autoBackupSettings", JSON.stringify(settings))

    // Calculate and display next backup date
    if (autoBackupEnabled) {
      const nextDate = calculateNextBackupDate()
      setNextBackupDate(nextDate ? nextDate.toLocaleString() : null)
    } else {
      setNextBackupDate(null)
    }
  }, [autoBackupEnabled, backupFrequency, backupDay, backupTime, lastBackupDate])

  // Check if a backup should be performed
  useEffect(() => {
    if (!autoBackupEnabled) return

    const checkBackupSchedule = () => {
      const now = new Date()
      const shouldBackup = isBackupDue(now)

      if (shouldBackup) {
        // Perform backup
        try {
          triggerBackup()
          // Update last backup date
          const newLastBackupDate = now.toISOString()
          setLastBackupDate(newLastBackupDate)
          setStatusMessage({
            type: "success",
            text: `Automatic backup completed successfully at ${now.toLocaleString()}`,
          })

          // Show toast notification for automatic backup
          toast({
            title: "Automatic Backup Successful",
            description: `Backup completed at ${now.toLocaleString()}`,
            variant: "success",
          })

          // Save to localStorage
          const settings = {
            enabled: autoBackupEnabled,
            frequency: backupFrequency,
            day: backupDay,
            time: backupTime,
            lastBackup: newLastBackupDate,
          }
          localStorage.setItem("autoBackupSettings", JSON.stringify(settings))
        } catch (error) {
          console.error("Error during automatic backup:", error)
          setStatusMessage({
            type: "error",
            text: `Automatic backup failed: ${error instanceof Error ? error.message : String(error)}`,
          })

          // Show error toast
          toast({
            title: "Automatic Backup Failed",
            description: error instanceof Error ? error.message : String(error),
            variant: "destructive",
          })
        }
      }
    }

    // Check on component mount and then every minute
    checkBackupSchedule()
    const intervalId = setInterval(checkBackupSchedule, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [autoBackupEnabled, backupFrequency, backupDay, backupTime, lastBackupDate, triggerBackup, toast])

  // Function to determine if a backup is due
  const isBackupDue = (currentDate: Date): boolean => {
    if (!lastBackupDate) return true // No previous backup, so it's due

    const lastBackup = new Date(lastBackupDate)
    const [hours, minutes] = backupTime.split(":").map(Number)

    // Check if we're past the scheduled time today
    const scheduledTimeToday = new Date(currentDate)
    scheduledTimeToday.setHours(hours, minutes, 0, 0)
    const isPastScheduledTime = currentDate >= scheduledTimeToday

    switch (backupFrequency) {
      case "daily":
        // Check if last backup was before today's scheduled time
        return (
          (lastBackup.getDate() !== currentDate.getDate() ||
            lastBackup.getMonth() !== currentDate.getMonth() ||
            lastBackup.getFullYear() !== currentDate.getFullYear()) &&
          isPastScheduledTime
        )

      case "weekly":
        // Check if it's the right day of the week and we haven't backed up today
        return (
          currentDate.getDay() === backupDay &&
          (lastBackup.getDate() !== currentDate.getDate() ||
            lastBackup.getMonth() !== currentDate.getMonth() ||
            lastBackup.getFullYear() !== currentDate.getFullYear()) &&
          isPastScheduledTime
        )

      case "monthly":
        // Check if it's the right day of the month and we haven't backed up today
        return (
          currentDate.getDate() === backupDay &&
          (lastBackup.getDate() !== currentDate.getDate() ||
            lastBackup.getMonth() !== currentDate.getMonth() ||
            lastBackup.getFullYear() !== currentDate.getFullYear()) &&
          isPastScheduledTime
        )

      default:
        return false
    }
  }

  // Calculate the next backup date based on current settings
  const calculateNextBackupDate = (): Date | null => {
    if (!autoBackupEnabled) return null

    const now = new Date()
    const [hours, minutes] = backupTime.split(":").map(Number)
    const nextDate = new Date(now)

    // Set the time
    nextDate.setHours(hours, minutes, 0, 0)

    // If the time has already passed today, move to the next occurrence
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1)
    }

    switch (backupFrequency) {
      case "daily":
        // Already set correctly
        break

      case "weekly":
        // Move to the next occurrence of the specified day of week
        while (nextDate.getDay() !== backupDay) {
          nextDate.setDate(nextDate.getDate() + 1)
        }
        break

      case "monthly":
        // Move to the next occurrence of the specified day of month
        nextDate.setDate(backupDay)
        // If this day has already passed this month, move to next month
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1)
        }
        // Handle invalid dates (e.g., February 30)
        while (nextDate.getDate() !== backupDay) {
          // If we got an invalid date, move back to the last day of the month
          nextDate.setDate(0)
        }
        break
    }

    return nextDate
  }

  // Add this useEffect to handle the countdown timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (backupButtonCountdown > 0) {
      intervalId = setInterval(() => {
        setBackupButtonCountdown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [backupButtonCountdown])

  // Update the handleBackupNow function to include the delay logic
  const handleBackupNow = () => {
    // Check if button was pressed in the last minute
    const now = Date.now()
    if (lastBackupNowTime && now - lastBackupNowTime < 60000) {
      return // Don't allow backup if less than a minute has passed
    }

    try {
      triggerBackup()
      const currentDate = new Date()
      setLastBackupDate(currentDate.toISOString())
      setLastBackupNowTime(now)
      setBackupButtonCountdown(60) // Start 60 second countdown
      setStatusMessage({
        type: "success",
        text: `Manual backup completed successfully at ${currentDate.toLocaleString()}`,
      })

      // Show toast notification for manual backup
      toast({
        title: "Backup Successful",
        description: `Backup completed at ${currentDate.toLocaleString()}`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error during manual backup:", error)
      setStatusMessage({
        type: "error",
        text: `Manual backup failed: ${error instanceof Error ? error.message : String(error)}`,
      })

      // Show error toast
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 text-blue-500" size={20} />
          Automatic Backup Settings
        </h3>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="enable-auto-backup"
            checked={autoBackupEnabled}
            onChange={(e) => setAutoBackupEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="enable-auto-backup"
            className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enable automatic backups
          </label>
        </div>

        {autoBackupEnabled && (
          <div className="space-y-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={handleBackupNow}
                disabled={backupButtonCountdown > 0}
                className={`px-3 py-1 text-white text-sm rounded-lg flex items-center ${
                  backupButtonCountdown > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Download size={14} className="mr-1" />
                {backupButtonCountdown > 0 ? `Wait (${backupButtonCountdown}s)` : "Backup Now"}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Backup Frequency
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-full ${
                    backupFrequency === "daily"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setBackupFrequency("daily")}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full ${
                    backupFrequency === "weekly"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setBackupFrequency("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full ${
                    backupFrequency === "monthly"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  }`}
                  onClick={() => setBackupFrequency("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            {backupFrequency === "weekly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                <select
                  value={backupDay}
                  onChange={(e) => setBackupDay(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            {backupFrequency === "monthly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Month</label>
                <select
                  value={backupDay}
                  onChange={(e) => setBackupDay(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time of Day</label>
              <input
                type="time"
                value={backupTime}
                onChange={(e) => setBackupTime(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="flex flex-col space-y-2 mt-4 text-sm">
              {lastBackupDate && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    Last backup: <span className="font-medium">{new Date(lastBackupDate).toLocaleString()}</span>
                  </span>
                </div>
              )}
              {nextBackupDate && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="mr-2" />
                  <span>
                    Next backup: <span className="font-medium">{nextBackupDate}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center ${
              statusMessage.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : statusMessage.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle size={16} className="mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{statusMessage.text}</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Automatic backups will only occur when the app is open in your browser. Make sure to
          keep the app open at the scheduled backup time or perform manual backups regularly.
        </p>
      </div>
    </div>
  )
}
