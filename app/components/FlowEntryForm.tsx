"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  Save,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Coffee,
  TrendingUp,
  TrendingDown,
  Check,
  Dumbbell,
} from "lucide-react"
import type { UroLog, UrineColor, UrgencyRating, ConcernType, FluidType, HydroLog, KegelLog } from "../types"

interface FlowEntryFormProps {
  addUroLog: (entry: UroLog) => void
  addHydroLog: (entry: HydroLog) => void
  addKegelLog: (entry: KegelLog) => void
  title2?: React.ReactNode
}

const FlowEntryForm: React.FC<FlowEntryFormProps> = ({ addUroLog, addHydroLog, addKegelLog, title2 }) => {
  // Add this near the top of the component
  const [dbUroLogs, setDbUroLogs] = useState<UroLog[]>([])
  const [dbHydroLogs, setDbHydroLogs] = useState<HydroLog[]>([])
  const [dbKegelLogs, setDbKegelLogs] = useState<KegelLog[]>([])

  // UroLog Entry state
  const [volume, setVolume] = useState("")
  const [duration, setDuration] = useState("")
  const [color, setColor] = useState<UrineColor>("")
  const [urgency, setUrgency] = useState<UrgencyRating>("")
  const [concerns, setConcerns] = useState<ConcernType[]>([])
  const [flowNotes, setFlowNotes] = useState("")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [calculatedFlowRate, setCalculatedFlowRate] = useState<number | null>(null)

  // HydroLog state
  const [hydroLogType, setFluidType] = useState<FluidType>("")
  const [customFluidType, setCustomFluidType] = useState("")
  const [hydroLogAmount, setFluidAmount] = useState("")
  const [hydroLogUnit, setFluidUnit] = useState<"oz" | "mL">("mL")
  const [useCustomAmount, setUseCustomAmount] = useState(false)
  const [hydroLogNotes, setFluidNotes] = useState("")

  // KegelLog state
  const [kegelReps, setKegelReps] = useState("")
  const [kegelHoldTime, setKegelHoldTime] = useState("")
  const [kegelSets, setKegelSets] = useState("")
  const [kegelTotalTime, setKegelTotalTime] = useState(0)
  const [kegelCompleted, setKegelCompleted] = useState(false)
  const [kegelNotes, setKegelNotes] = useState("")
  const [isKegelTimerRunning, setIsKegelTimerRunning] = useState(false)
  const [kegelTimerStart, setKegelTimerStart] = useState<number | null>(null)
  const [kegelElapsedTime, setKegelElapsedTime] = useState(0)
  const [kegelGuidedTimer, setKegelGuidedTimer] = useState(false)
  const [kegelRepsCompleted, setKegelRepsCompleted] = useState("")

  // Shared state
  const [activeTab, setActiveTab] = useState<"basic" | "fluid" | "kegel">("basic")
  const [isExpanded, setIsExpanded] = useState(true)
  const [entryDate, setEntryDate] = useState("")
  const [entryTime, setEntryTime] = useState("")
  const [useCustomDateTime, setUseCustomDateTime] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)
  const [saveMessage, setSaveMessage] = useState("")

  // Averages for comparison
  const [overallAverage, setOverallAverage] = useState<number>(0)
  const [weekAverage, setWeekAverage] = useState<number>(0)
  const [monthAverage, setMonthAverage] = useState<number>(0)
  const [dayAverage, setDayAverage] = useState<number>(0)

  const colorOptions: { value: UrineColor; label: string; bgColor: string; textColor: string }[] = [
    { value: "", label: "Select color (optional)", bgColor: "bg-white dark:bg-gray-700", textColor: "text-gray-500" },
    { value: "Light Yellow", label: "Light Yellow", bgColor: "bg-yellow-200", textColor: "text-yellow-800" },
    { value: "Clear", label: "Clear", bgColor: "bg-gray-100", textColor: "text-gray-800" },
    { value: "Dark Yellow", label: "Dark Yellow", bgColor: "bg-yellow-300", textColor: "text-yellow-800" },
    { value: "Amber or Honey", label: "Amber or Honey", bgColor: "bg-amber-300", textColor: "text-amber-800" },
    { value: "Orange", label: "Orange", bgColor: "bg-orange-300", textColor: "text-orange-800" },
    { value: "Pink or Red", label: "Pink or Red", bgColor: "bg-red-200", textColor: "text-red-800" },
    { value: "Blue or Green", label: "Blue or Green", bgColor: "bg-teal-200", textColor: "text-teal-800" },
    {
      value: "Brown or Cola-colored",
      label: "Brown or Cola-colored",
      bgColor: "bg-amber-700",
      textColor: "text-white",
    },
    { value: "Cloudy or Murky", label: "Cloudy or Murky", bgColor: "bg-gray-300", textColor: "text-gray-800" },
    { value: "Foamy or Bubbly", label: "Foamy or Bubbly", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  ]

  const urgencyOptions: { value: UrgencyRating; label: string }[] = [
    { value: "", label: "Select urgency (optional)" },
    { value: "Normal", label: "Normal" },
    { value: "Hour < 60 min", label: "Hour < 60 min" },
    { value: "Hold < 15 min", label: "Hold < 15 min" },
    { value: "Hold < 5 minutes", label: "Hold < 5 minutes" },
    { value: "Had drips", label: "Had drips" },
    { value: "Couldn't hold it", label: "Couldn't hold it" },
  ]

  const fluidTypeOptions: { value: FluidType; label: string }[] = [
    { value: "", label: "Select type" },
    { value: "Water", label: "Water" },
    { value: "Juice", label: "Juice" },
    { value: "Tea", label: "Tea" },
    { value: "Soda", label: "Soda" },
    { value: "Coffee", label: "Coffee" },
    { value: "Alcohol", label: "Alcohol" },
    { value: "Other", label: "Other" },
  ]

  const commonSizes = [
    { label: "Small (8 oz / 240 mL)", oz: 8, mL: 240 },
    { label: "Medium (12 oz / 355 mL)", oz: 12, mL: 355 },
    { label: "Large (16 oz / 475 mL)", oz: 16, mL: 475 },
    { label: "Extra Large (20 oz / 590 mL)", oz: 20, mL: 590 },
    { label: "750 mL (25.4 oz)", oz: 25.4, mL: 750 },
    { label: "1000 mL (33.8 oz)", oz: 33.8, mL: 1000 },
  ]

  const concernOptions: ConcernType[] = [
    "Straining",
    "Dribbling",
    "Frequent urges",
    "Incomplete emptying",
    "Waking just to pee",
    "Pain",
    "Burning",
    "Blood",
  ]

  // Add this useEffect to fetch data from IndexedDB
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { db } = await import("../services/db")

        // Check if the tables exist before trying to access them
        if (db.uroLogs && typeof db.uroLogs.toArray === "function") {
          const uroLogs = await db.uroLogs.toArray()
          setDbUroLogs(uroLogs)
        } else {
          console.warn("uroLogs table not found or not properly initialized")
          setDbUroLogs([])
        }

        if (db.hydroLogs && typeof db.hydroLogs.toArray === "function") {
          const hydroLogs = await db.hydroLogs.toArray()
          setDbHydroLogs(hydroLogs)
        } else {
          console.warn("hydroLogs table not found or not properly initialized")
          setDbHydroLogs([])
        }

        if (db.kegelLogs && typeof db.kegelLogs.toArray === "function") {
          const kegelLogs = await db.kegelLogs.toArray()
          setDbKegelLogs(kegelLogs)
        } else {
          console.warn("kegelLogs table not found or not properly initialized")
          setDbKegelLogs([])
        }
      } catch (error) {
        console.error("Error fetching entries from database:", error)
        // Set empty arrays to prevent further errors
        setDbUroLogs([])
        setDbHydroLogs([])
        setDbKegelLogs([])
      }
    }

    fetchEntries()
  }, [])

  // Calculate averages from entries
  useEffect(() => {
    if (dbUroLogs.length === 0) return

    // Overall average
    const allFlowRates = dbUroLogs.map((entry) => entry.flowRate)
    setOverallAverage(allFlowRates.reduce((sum, rate) => sum + rate, 0) / allFlowRates.length)

    // Last 7 days average
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekEntries = dbUroLogs.filter((entry) => new Date(entry.timestamp) >= oneWeekAgo)
    if (weekEntries.length > 0) {
      const weekRates = weekEntries.map((entry) => entry.flowRate)
      setWeekAverage(weekRates.reduce((sum, rate) => sum + rate, 0) / weekRates.length)
    }

    // Last month average
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const monthEntries = dbUroLogs.filter((entry) => new Date(entry.timestamp) >= oneMonthAgo)
    if (monthEntries.length > 0) {
      const monthRates = monthEntries.map((entry) => entry.flowRate)
      setMonthAverage(monthRates.reduce((sum, rate) => sum + rate, 0) / monthRates.length)
    }

    // Today's average
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = dbUroLogs.filter((entry) => new Date(entry.timestamp) >= today)
    if (todayEntries.length > 0) {
      const todayRates = todayEntries.map((entry) => entry.flowRate)
      setDayAverage(todayRates.reduce((sum, rate) => sum + rate, 0) / todayRates.length)
    }
  }, [dbUroLogs])

  // Initialize date and time fields with current values
  useEffect(() => {
    const now = new Date()
    setEntryDate(now.toISOString().split("T")[0])
    setEntryTime(now.toTimeString().substring(0, 5))
  }, [])

  // Calculate flow rate when volume or duration changes
  useEffect(() => {
    if (volume && duration && Number(volume) > 0 && Number(duration) > 0) {
      const flowRate = Number(volume) / Number(duration)
      setCalculatedFlowRate(flowRate)
    } else {
      setCalculatedFlowRate(null)
    }
  }, [volume, duration])

  const toggleConcern = (concern: ConcernType) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((c) => c !== concern))
    } else {
      setConcerns([...concerns, concern])
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerStart) {
          const elapsed = (Date.now() - timerStart) / 1000
          setElapsedTime(elapsed)
        }
      }, 100)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timerStart])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const tenths = Math.floor((timeInSeconds * 10) % 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create timestamp based on user input or current time
    let timestamp: string
    if (useCustomDateTime && entryDate && entryTime) {
      timestamp = new Date(`${entryDate}T${entryTime}`).toISOString()
    } else {
      timestamp = new Date().toISOString()
    }

    let hasUroLog = false
    let hasHydroLog = false
    let hasKegelLog = false

    // Save UroLog if data is provided
    if (volume && (duration || isTimerRunning)) {
      let durationValue = Number.parseFloat(duration)

      if (isTimerRunning && timerStart) {
        durationValue = (Date.now() - timerStart) / 1000
        setIsTimerRunning(false)
        setTimerStart(null)
        setElapsedTime(0)
      }

      const flowRate = Number.parseFloat(volume) / durationValue

      const uroLog: UroLog = {
        timestamp,
        volume: Number.parseFloat(volume),
        duration: durationValue,
        flowRate,
        color: color || undefined,
        urgency: urgency || undefined,
        concerns: concerns.length > 0 ? concerns : undefined,
        notes: flowNotes || undefined,
      }

      addUroLog(uroLog)
      hasUroLog = true

      // Reset flow entry form
      setVolume("")
      setDuration("")
      setColor("")
      setUrgency("")
      setConcerns([])
      setFlowNotes("")
      setCalculatedFlowRate(null)
    }

    // Save HydroLog if data is provided
    if (hydroLogType) {
      const amount = useCustomAmount
        ? Number(hydroLogAmount)
        : hydroLogUnit === "oz"
          ? commonSizes[Number(hydroLogAmount)].oz
          : commonSizes[Number(hydroLogAmount)].mL

      const hydroLog: HydroLog = {
        timestamp,
        type: hydroLogType,
        customType: hydroLogType === "Other" ? customFluidType : undefined,
        amount,
        unit: hydroLogUnit,
        notes: hydroLogNotes || undefined,
      }

      addHydroLog(hydroLog)
      hasHydroLog = true

      // Reset fluid intake form
      setFluidType("")
      setCustomFluidType("")
      setFluidAmount("")
      setUseCustomAmount(false)
      setFluidNotes("")
    }

    // Save KegelLog if data is provided
    if (kegelReps && kegelHoldTime && kegelSets) {
      const totalTime = Number(kegelHoldTime) * Number(kegelReps) * Number(kegelSets)

      const kegelLog: KegelLog = {
        timestamp,
        reps: Number(kegelReps),
        holdTime: Number(kegelHoldTime),
        sets: Number(kegelSets),
        totalTime: totalTime,
        completed: kegelCompleted,
        notes: kegelNotes || undefined,
      }

      addKegelLog(kegelLog)
      hasKegelLog = true

      // Reset kegel entry form
      setKegelReps("")
      setKegelHoldTime("")
      setKegelSets("")
      setKegelTotalTime(0)
      setKegelCompleted(false)
      setKegelNotes("")
      setKegelRepsCompleted("")
    }

    // Reset shared form elements
    // Reset date and time to current
    const now = new Date()
    setEntryDate(now.toISOString().split("T")[0])
    setEntryTime(now.toTimeString().substring(0, 5))
    setUseCustomDateTime(false)

    // Show success message
    if (hasUroLog || hasHydroLog || hasKegelLog) {
      setSaveSuccess(true)

      if (hasUroLog && hasHydroLog && hasKegelLog) {
        setSaveMessage("UroLog, HydroLog, and KegelLog saved successfully!")
      } else if (hasUroLog && hasHydroLog) {
        setSaveMessage("UroLog and HydroLog saved successfully!")
      } else if (hasUroLog && hasKegelLog) {
        setSaveMessage("UroLog and KegelLog saved successfully!")
      } else if (hasHydroLog && hasKegelLog) {
        setSaveMessage("HydroLog and KegelLog saved successfully!")
      } else if (hasUroLog) {
        setSaveMessage("UroLog saved successfully!")
      } else if (hasHydroLog) {
        setSaveMessage("HydroLog saved successfully!")
      } else {
        setSaveMessage("KegelLog saved successfully!")
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveMessage("")
      }, 3000)

      // Collapse the section after saving
      setIsExpanded(false)
    } else {
      setSaveSuccess(false)
      setSaveMessage("Please enter data for at least one entry type")

      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveMessage("")
      }, 3000)
    }
  }

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
      if (timerStart) {
        const durationInSeconds = (Date.now() - timerStart) / 1000
        setDuration(durationInSeconds.toFixed(1))
        setElapsedTime(0)
      }
      setTimerStart(null)
    } else {
      setIsTimerRunning(true)
      setTimerStart(Date.now())
      setDuration("")
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerStart(null)
    setElapsedTime(0)
    setDuration("")
  }

  const handleSizeSelection = (index: number) => {
    setFluidAmount(index.toString())
    setUseCustomAmount(false)
  }

  // Get comparison class for flow rate
  const getComparisonClass = (current: number, average: number) => {
    if (current > average * 1.1) return "text-green-600 dark:text-green-400"
    if (current < average * 0.9) return "text-red-600 dark:text-red-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  // Check if Save button should be enabled
  const isFlowDataValid = Number(volume) > 0 && (Number(duration) > 0 || isTimerRunning)
  const isFluidDataValid = hydroLogType !== "" && (useCustomAmount ? Number(hydroLogAmount) > 0 : hydroLogAmount !== "")
  const isKegelDataValid = Number(kegelReps) > 0 && Number(kegelHoldTime) > 0 && Number(kegelSets) > 0
  const isSaveEnabled = isFlowDataValid || isFluidDataValid || isKegelDataValid

  return (
    <>
      {/* Save button and success/error message */}
      <div className="mb-4 flex flex-col items-center">
        <button
          onClick={handleSubmit}
          disabled={!isSaveEnabled}
          className={`min-h-[48px] px-6 rounded-lg flex items-center justify-center shadow-sm text-white text-lg w-full max-w-md mb-2 ${
            isSaveEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          aria-label="Save entry"
        >
          <Save size={22} className="mr-2" /> Save Entry
        </button>

        {saveSuccess !== null && (
          <div
            className={`p-3 rounded-lg flex items-center justify-center w-full max-w-md ${
              saveSuccess
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            }`}
          >
            {saveSuccess ? (
              <Check size={18} className="mr-2 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            )}
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium text-lg ${
              activeTab === "basic"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            } transition-colors`}
            onClick={() => setActiveTab("basic")}
          >
            UroLog Entry
          </button>
          <button
            className={`px-4 py-3 font-medium text-lg flex items-center ${
              activeTab === "fluid"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            } transition-colors`}
            onClick={() => setActiveTab("fluid")}
          >
            <Coffee size={20} className="mr-2" />
            HydroLog
          </button>
          <button
            className={`px-4 py-3 font-medium text-lg flex items-center ${
              activeTab === "kegel"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            } transition-colors`}
            onClick={() => setActiveTab("kegel")}
          >
            <Dumbbell size={20} className="mr-2" />
            KegelLog
          </button>
        </div>
      </div>

      {/* Date and Time Override - Moved above the tabs */}
      <div className="mb-4 max-w-[414px] mx-auto">
        <div className="flex items-center mb-2">
          <Calendar size={20} className="mr-2 text-teal-500" />
          <label
            htmlFor="custom-datetime"
            className="flex items-center cursor-pointer text-gray-800 dark:text-gray-300 text-lg"
          >
            <input
              type="checkbox"
              id="custom-datetime"
              checked={useCustomDateTime}
              onChange={() => setUseCustomDateTime(!useCustomDateTime)}
              className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Override date/time</span>
          </label>
        </div>

        {useCustomDateTime && (
          <div className="space-y-2 animate-fade-in bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
            <div>
              <label htmlFor="entry-date" className="block mb-1 text-lg text-gray-800 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                id="entry-date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg"
              />
            </div>
            <div>
              <label htmlFor="entry-time" className="block mb-1 text-lg text-gray-800 dark:text-gray-300">
                Time
              </label>
              <input
                type="time"
                id="entry-time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="animate-fade-in">
        {activeTab === "basic" && (
          <div className="max-w-[414px] mx-auto">
            <div className="form-group p-0">
              {/* Timer Display with Start Button and Save Button */}
              <div className="flex flex-col mb-4">
                <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-lg text-center mb-2 shadow-inner">
                  <div className="text-6xl font-mono font-bold tabular-nums text-blue-800 dark:text-white">
                    {isTimerRunning ? formatTime(elapsedTime) : formatTime(Number(duration) || 0)}
                  </div>

                  {/* Flow Rate Display - Directly below timer */}
                  {calculatedFlowRate !== null && (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {calculatedFlowRate.toFixed(1)} mL/s
                      </div>

                      <div className="flex items-center justify-center gap-4 mt-1">
                        {/* Percentage comparison to last entry */}
                        {dbUroLogs.length > 0 &&
                          (() => {
                            const lastEntry = [...dbUroLogs].sort(
                              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                            )[0]
                            if (lastEntry) {
                              const percentChange =
                                ((calculatedFlowRate - lastEntry.flowRate) / lastEntry.flowRate) * 100
                              const isIncrease = percentChange > 0
                              return (
                                <div className="flex items-center">
                                  {isIncrease ? (
                                    <TrendingUp size={20} className="text-green-600 dark:text-green-400 mr-1" />
                                  ) : (
                                    <TrendingDown size={20} className="text-red-600 dark:text-red-400 mr-1" />
                                  )}
                                  <span
                                    className={`text-lg font-bold ${isIncrease ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                  >
                                    {isIncrease ? "+" : ""}
                                    {percentChange.toFixed(1)}%
                                  </span>
                                </div>
                              )
                            }
                            return null
                          })()}

                        {/* Percentage comparison to overall average */}
                        {dbUroLogs.length > 0 &&
                          (() => {
                            const percentChange = ((calculatedFlowRate - overallAverage) / overallAverage) * 100
                            const isIncrease = percentChange > 0
                            return (
                              <div className="flex items-center">
                                <span className="text-gray-700 dark:text-gray-400 mr-1">Avg:</span>
                                {isIncrease ? (
                                  <TrendingUp size={20} className="text-green-600 dark:text-green-400 mr-1" />
                                ) : (
                                  <TrendingDown size={20} className="text-red-600 dark:text-red-400 mr-1" />
                                )}
                                <span
                                  className={`text-lg font-bold ${isIncrease ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                >
                                  {isIncrease ? "+" : ""}
                                  {percentChange.toFixed(1)}%
                                </span>
                              </div>
                            )
                          })()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className="min-h-[48px] px-6 text-white rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-all text-lg w-[48%] bg-green-600 hover:bg-green-700"
                    aria-label={isTimerRunning ? "Stop timer" : "Start timer"}
                  >
                    {isTimerRunning ? <Pause size={22} /> : <Play size={22} />}
                    <span className="ml-2 font-medium">{isTimerRunning ? "Stop" : "Start"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetTimer}
                    className="min-h-[48px] px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center shadow-sm hover:shadow transition-all text-lg w-[48%]"
                    aria-label="Reset timer"
                  >
                    <RotateCcw size={22} className="mr-2" /> Reset
                  </button>
                </div>
              </div>

              {/* Duration Timer Controls */}
              <div className="mb-4">
                <label htmlFor="duration" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  Duration (seconds)
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => {
                      const val = Math.min(600, Number(e.target.value))
                      setDuration(val.toString())
                    }}
                    disabled={isTimerRunning}
                    className={`border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-full text-lg ${
                      isTimerRunning ? "opacity-50" : ""
                    } ${duration && !isTimerRunning ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" : ""}`}
                    placeholder="Sec"
                    max={600}
                    aria-label="Duration in seconds"
                  />
                </div>
              </div>

              {/* Volume Field */}
              <div className="mb-4">
                <label htmlFor="volume" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  Volume (mL)
                </label>
                <input
                  type="number"
                  id="volume"
                  value={volume}
                  onChange={(e) => {
                    const val = Math.min(800, Number(e.target.value))
                    setVolume(val.toString())
                  }}
                  className={`border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-lg w-full ${
                    duration && !volume ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 animate-pulse" : ""
                  }`}
                  required
                  placeholder="mL"
                  max={800}
                  aria-label="Volume in milliliters"
                />
              </div>

              {/* Dividing line after Volume */}
              <div className="my-6 border-t-2 border-gray-200 dark:border-gray-700"></div>

              {/* Urgency Rating */}
              <div className="mb-4">
                <label
                  htmlFor="urgency"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Clock size={20} className="mr-2 text-purple-500" />
                  Urgency Rating
                </label>
                <select
                  id="urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyRating)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                >
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urine Color */}
              <div className="mb-4">
                <label
                  htmlFor="color"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  Urine Color
                </label>
                <div className="relative">
                  <select
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value as UrineColor)}
                    className="w-full p-2.5 pl-10 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                    style={{
                      colorScheme: "light dark",
                    }}
                  >
                    {colorOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={`${option.value ? option.bgColor : ""} ${option.value ? option.textColor : ""}`}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <div
                      className={`w-5 h-5 rounded ${
                        color ? colorOptions.find((o) => o.value === color)?.bgColor || "bg-gray-200" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Concerns - One per row */}
              <div className="mb-4">
                <label className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300">
                  <AlertTriangle size={20} className="mr-2 text-amber-500" />
                  Concerns
                </label>
                <div className="space-y-2">
                  {concernOptions.map((concern) => (
                    <div
                      key={concern}
                      className={`flex items-center p-2 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors text-lg ${
                        concerns.includes(concern)
                          ? "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                      onClick={() => toggleConcern(concern)}
                    >
                      <input
                        type="checkbox"
                        id={`concern-${concern}`}
                        checked={concerns.includes(concern)}
                        onChange={() => toggleConcern(concern)}
                        className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`concern-${concern}`} className="cursor-pointer flex-1">
                        {concern}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Field - Full Width */}
              <div className="mb-4">
                <label
                  htmlFor="flow-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  Notes (max 256 characters)
                </label>
                <textarea
                  id="flow-notes"
                  value={flowNotes}
                  onChange={(e) => setFlowNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder="Add any additional notes here..."
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{flowNotes.length}/256 characters</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fluid" && (
          <div className="max-w-[414px] mx-auto">
            <div className="form-group bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <div className="mb-4">
                <label
                  htmlFor="fluid-type"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Coffee size={20} className="mr-2 text-cyan-500" />
                  Beverage Type
                </label>
                <select
                  id="fluid-type"
                  value={hydroLogType}
                  onChange={(e) => setFluidType(e.target.value as FluidType)}
                  className={`w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select ${
                    !hydroLogType ? "border-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-800 animate-pulse" : ""
                  }`}
                >
                  {fluidTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {hydroLogType === "Other" && (
                <div className="mb-4 animate-fade-in">
                  <label
                    htmlFor="custom-fluid-type"
                    className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                  >
                    Specify Beverage
                  </label>
                  <input
                    type="text"
                    id="custom-fluid-type"
                    value={customFluidType}
                    onChange={(e) => setCustomFluidType(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                    placeholder="Enter beverage type"
                    required={hydroLogType === "Other"}
                  />
                </div>
              )}

              <div className="mb-4">
                <label
                  className={`block mb-2 text-lg font-medium ${
                    hydroLogType && (!hydroLogAmount || hydroLogAmount === "")
                      ? "text-cyan-600 dark:text-cyan-400 animate-pulse"
                      : "text-gray-800 dark:text-gray-300"
                  }`}
                >
                  Beverage Size
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {commonSizes.map((size, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg cursor-pointer transition-all text-lg ${
                        !useCustomAmount && hydroLogAmount === index.toString()
                          ? "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700 shadow-sm text-cyan-800 dark:text-cyan-200"
                          : hydroLogType && (!hydroLogAmount || hydroLogAmount === "")
                            ? "bg-white dark:bg-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-cyan-300 dark:border-cyan-700"
                            : "bg-white dark:bg-gray-700 hover:bg-cyan-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                      }`}
                      onClick={() => handleSizeSelection(index)}
                    >
                      <div className="font-medium">{size.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="custom-amount"
                    checked={useCustomAmount}
                    onChange={() => setUseCustomAmount(!useCustomAmount)}
                    className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="custom-amount" className="cursor-pointer text-gray-800 dark:text-gray-300 text-lg">
                    Custom amount
                  </label>
                </div>

                {useCustomAmount && (
                  <div className="flex items-center mt-3 animate-fade-in">
                    <input
                      type="number"
                      value={hydroLogAmount}
                      onChange={(e) => setFluidAmount(e.target.value)}
                      className="p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 w-28 mr-3 text-lg text-gray-800 dark:text-gray-200"
                      placeholder="Amount"
                      required={useCustomAmount}
                      min="1"
                    />
                    <select
                      value={hydroLogUnit}
                      onChange={(e) => setFluidUnit(e.target.value as "oz" | "mL")}
                      className="p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                    >
                      <option value="oz">oz</option>
                      <option value="mL">mL</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notes Field for Fluid Intake */}
              <div className="mb-4">
                <label
                  htmlFor="fluid-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  Notes (max 256 characters)
                </label>
                <textarea
                  id="fluid-notes"
                  value={hydroLogNotes}
                  onChange={(e) => setFluidNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder="Add any additional notes about this fluid intake..."
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{hydroLogNotes.length}/256 characters</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "kegel" && (
          <div className="max-w-[414px] mx-auto">
            <div className="form-group bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700">
              {/* Reps Field */}
              <div className="mb-4">
                <label htmlFor="kegel-reps" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  Reps (Number of Squeezes)
                </label>
                <input
                  type="number"
                  id="kegel-reps"
                  value={kegelReps}
                  onChange={(e) => setKegelReps(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder="Enter number of squeezes"
                />
              </div>

              {/* Hold Time Field */}
              <div className="mb-4">
                <label
                  htmlFor="kegel-hold-time"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  Hold Time (seconds)
                </label>
                <input
                  type="number"
                  id="kegel-hold-time"
                  value={kegelHoldTime}
                  onChange={(e) => setKegelHoldTime(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder="Enter duration of each squeeze"
                />
              </div>

              {/* Sets Field */}
              <div className="mb-4">
                <label htmlFor="kegel-sets" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  Sets (Number of Sets)
                </label>
                <input
                  type="number"
                  id="kegel-sets"
                  value={kegelSets}
                  onChange={(e) => setKegelSets(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder="Enter number of sets"
                />
              </div>

              {/* Total Time (calculated) */}
              <div className="mb-4">
                <label className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  Total Time (estimated)
                </label>
                <div className="p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-700 text-lg text-gray-800 dark:text-gray-200">
                  {Number(kegelHoldTime) * Number(kegelReps) * Number(kegelSets)} seconds
                </div>
              </div>

              {/* Guided Timer */}
              <div className="mb-4">
                <label className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={kegelGuidedTimer}
                    onChange={() => setKegelGuidedTimer(!kegelGuidedTimer)}
                    className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Use Guided Timer
                </label>
              </div>

              {kegelGuidedTimer && (
                <div className="mb-4">
                  {/* Timer Display */}
                  <div className="bg-yellow-50 dark:bg-gray-800 p-3 rounded-lg text-center mb-2 shadow-inner">
                    <div className="text-6xl font-mono font-bold tabular-nums text-yellow-800 dark:text-white">
                      {formatTime(kegelElapsedTime)}
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsKegelTimerRunning(!isKegelTimerRunning)
                        setKegelTimerStart(Date.now())
                      }}
                      className="min-h-[48px] px-6 text-white rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-all text-lg w-[48%] bg-green-600 hover:bg-green-700"
                    >
                      {isKegelTimerRunning ? <Pause size={22} /> : <Play size={22} />}
                      <span className="ml-2 font-medium">{isKegelTimerRunning ? "Pause" : "Start"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsKegelTimerRunning(false)
                        setKegelTimerStart(null)
                        setKegelElapsedTime(0)
                      }}
                      className="min-h-[48px] px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center shadow-sm hover:shadow transition-all text-lg w-[48%]"
                    >
                      <RotateCcw size={22} className="mr-2" /> Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Reps Completed Field */}
              <div className="mb-4">
                <label
                  htmlFor="kegel-reps-completed"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  Reps Completed
                </label>
                <input
                  type="number"
                  id="kegel-reps-completed"
                  value={kegelRepsCompleted}
                  onChange={(e) => setKegelRepsCompleted(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder="Enter number of reps completed"
                />
              </div>

              {/* Completed Checkbox */}
              <div className="mb-4">
                <label className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={kegelCompleted}
                    onChange={() => setKegelCompleted(!kegelCompleted)}
                    className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Completed All Sets
                </label>
              </div>

              {/* Notes Field */}
              <div className="mb-4">
                <label
                  htmlFor="kegel-notes"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  Notes (max 256 characters)
                </label>
                <textarea
                  id="kegel-notes"
                  value={kegelNotes}
                  onChange={(e) => setKegelNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder="Add any additional notes about this exercise..."
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{kegelNotes.length}/256 characters</div>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    How to Perform Kegel Exercises:
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200">
                    "To do Kegels, imagine you're sitting on a marble. Tighten your pelvic muscles as if you're lifting
                    the marble upward, toward your head. Try it for three seconds at a time. Then relax for a count of
                    three."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default FlowEntryForm
