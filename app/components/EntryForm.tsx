"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Clock, AlertTriangle, FileText, Coffee, Dumbbell, Thermometer, Droplet, Activity } from "lucide-react"
import type { UroLog, UrineColor, UrgencyRating, ConcernType, FluidType, HydroLog, KegelLog } from "../types"
import type { AppConfig, FormFieldConfig } from "../types/config"
// Add this import at the top
import { updateConfigWithTrackerTabs } from "../utils/trackerTabGenerator"

interface EntryFormProps {
  addUroLog: (entry: UroLog) => void
  addHydroLog: (entry: HydroLog) => void
  addKegelLog: (entry: KegelLog) => void
  appConfig: AppConfig
  title2?: React.ReactNode
}

// Update the form state to include isDemo
interface FormState {
  // Existing fields...
  volume: string
  duration: string
  color: UrineColor
  urgency: UrgencyRating
  concerns: ConcernType[]
  flowNotes: string
  isTimerRunning: boolean
  timerStart: number | null
  elapsedTime: number
  calculatedFlowRate: number | null
  hydroLogType: FluidType
  customFluidType: string
  hydroLogAmount: string
  hydroLogUnit: "oz" | "mL"
  useCustomAmount: boolean
  hydroLogNotes: string
  kegelReps: string
  kegelHoldTime: string
  kegelSets: string
  kegelTotalTime: number
  kegelCompleted: boolean
  kegelNotes: string
  isKegelTimerRunning: boolean
  kegelTimerStart: number | null
  kegelElapsedTime: number
  kegelGuidedTimer: boolean
  kegelRepsCompleted: string
  activeTab: "basic" | "fluid" | "kegel" | "stricture" | "hydration"
  isExpanded: boolean
  entryDate: string
  entryTime: string
  useCustomDateTime: boolean
  saveSuccess: boolean | null
  saveMessage: string
  overallAverage: number
  weekAverage: number
  monthAverage: number
  dayAverage: number
  isDemo: boolean
  // Hydration tab fields
  hydrationBeverageType: string
  hydrationCustomType: string
  hydrationAmount: string
  hydrationUnit: "oz" | "mL" | "cups"
  hydrationTemperature: string
  hydrationTimeOfDay: string
  hydrationGoal: string
  hydrationNotes: string
}

const EntryForm: React.FC<EntryFormProps> = ({ addUroLog, addHydroLog, addKegelLog, appConfig, title2 }) => {
  // Get configuration for form fields
  const getFieldConfig = (tabId: string, fieldId: string): FormFieldConfig | undefined => {
    return appConfig.pages["page1"]?.sections["section1"]?.tabs[tabId]?.fields[fieldId]
  }

  // Check if a tab is enabled
  const isTabEnabled = (tabId: string): boolean => {
    return !!appConfig.pages["page1"]?.sections["section1"]?.tabs[tabId]?.enabled
  }

  // Add this near the top of the component
  const [dbUroLogs, setDbUroLogs] = useState<UroLog[]>([])
  const [dbHydroLogs, setDbHydroLogs] = useState<HydroLog[]>([])
  const [dbKegelLogs, setDbKegelLogs] = useState<KegelLog[]>([])

  // Add timer interval refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const strictureTimerIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Stricture Log state
  const [strictureVolume, setStrictureVolume] = useState("")
  const [strictureDuration, setStrictureDuration] = useState("")
  const [strictureFlowRate, setStrictureFlowRate] = useState<number | null>(null)
  const [strictureColor, setStrictureColor] = useState<UrineColor>("")
  const [strictureUrgency, setStrictureUrgency] = useState<UrgencyRating>("")
  const [strictureSymptoms, setStrictureSymptoms] = useState<string[]>([])
  const [streamQuality, setStreamQuality] = useState("")
  const [painLevel, setPainLevel] = useState("")
  const [strictureNotes, setStrictureNotes] = useState("")
  const [isStrictureTimerRunning, setIsStrictureTimerRunning] = useState(false)
  const [strictureTimerStart, setStrictureTimerStart] = useState<number | null>(null)
  const [strictureElapsedTime, setStrictureElapsedTime] = useState(0)

  // Hydration tab state
  const [hydrationBeverageType, setHydrationBeverageType] = useState("")
  const [hydrationCustomType, setHydrationCustomType] = useState("")
  const [hydrationAmount, setHydrationAmount] = useState("")
  const [hydrationUnit, setHydrationUnit] = useState<"oz" | "mL" | "cups">("mL")
  const [hydrationTemperature, setHydrationTemperature] = useState("")
  const [hydrationTimeOfDay, setHydrationTimeOfDay] = useState("")
  const [hydrationGoal, setHydrationGoal] = useState("")
  const [hydrationNotes, setHydrationNotes] = useState("")

  // Shared state
  const [activeTab, setActiveTab] = useState<"basic" | "fluid" | "kegel" | "stricture" | "hydration">("basic")
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

  const [formState, setFormState] = useState<FormState>({
    volume: "",
    duration: "",
    color: "",
    urgency: "",
    concerns: [],
    flowNotes: "",
    isTimerRunning: false,
    timerStart: null,
    elapsedTime: 0,
    calculatedFlowRate: null,
    hydroLogType: "",
    customFluidType: "",
    hydroLogAmount: "",
    hydroLogUnit: "mL",
    useCustomAmount: false,
    hydroLogNotes: "",
    kegelReps: "",
    kegelHoldTime: "",
    kegelSets: "",
    kegelTotalTime: 0,
    kegelCompleted: false,
    kegelNotes: "",
    isKegelTimerRunning: false,
    kegelTimerStart: null,
    kegelElapsedTime: 0,
    kegelGuidedTimer: false,
    kegelRepsCompleted: "",
    activeTab: "basic",
    isExpanded: true,
    entryDate: "",
    entryTime: "",
    useCustomDateTime: false,
    saveSuccess: null,
    saveMessage: "",
    overallAverage: 0,
    weekAverage: 0,
    monthAverage: 0,
    dayAverage: 0,
    isDemo: false,
    hydrationBeverageType: "",
    hydrationCustomType: "",
    hydrationAmount: "",
    hydrationUnit: "mL",
    hydrationTemperature: "",
    hydrationTimeOfDay: "",
    hydrationGoal: "",
    hydrationNotes: "",
  })

  // Calculate flow rate when volume or duration changes
  useEffect(() => {
    if (volume && duration && Number(volume) > 0 && Number(duration) > 0) {
      const flowRate = Number(volume) / Number(duration)
      setCalculatedFlowRate(Number.parseFloat(flowRate.toFixed(2)))
    } else {
      setCalculatedFlowRate(null)
    }
  }, [volume, duration])

  // Calculate stricture flow rate
  useEffect(() => {
    if (strictureVolume && strictureDuration && Number(strictureVolume) > 0 && Number(strictureDuration) > 0) {
      const flowRate = Number(strictureVolume) / Number(strictureDuration)
      setStrictureFlowRate(Number.parseFloat(flowRate.toFixed(2)))
    } else {
      setStrictureFlowRate(null)
    }
  }, [strictureVolume, strictureDuration])

  // Calculate kegel total time
  useEffect(() => {
    if (kegelReps && kegelHoldTime && kegelSets) {
      const totalTime = Number(kegelReps) * Number(kegelHoldTime) * Number(kegelSets)
      setKegelTotalTime(totalTime)
    } else {
      setKegelTotalTime(0)
    }
  }, [kegelReps, kegelHoldTime, kegelSets])

  // Get color options from configuration or use defaults
  const colorOptions: { value: UrineColor; label: string; bgColor: string; textColor: string }[] = [
    { value: "", label: "Select color (optional)", bgColor: "bg-white dark:bg-gray-700", textColor: "text-gray-500" },
    { value: "Light Yellow", label: "Light Yellow", bgColor: "bg-yellow-200", textColor: "text-yellow-800" },
    { value: "Clear", label: "Clear", bgColor: "bg-gray-100", textColor: "text-gray-800" },
    { value: "Dark Yellow", label: "Dark Yellow", bgColor: "bg-yellow-300", textColor: "text-yellow-800" },
    { value: "Amber or Honey", label: "Amber or Honey", bgColor: "bg-amber-300", textColor: "text-amber-800" },
    { value: "Orange", label: "Orange", bgColor: "bg-orange-300", textColor: "text-orange-800" },
    { value: "Pink or Red", label: "Pink or Red", bgColor: "bg-red-200", textColor: "text-red-800" },
  ].filter((color) => color.value !== undefined)

  // Update the availableTabs array to include the new tab
  const availableTabs = [
    { id: "tab1", key: "basic", label: "UroLog Entry", icon: <Droplet size={20} className="mr-2 text-blue-500" /> },
    { id: "tab2", key: "fluid", label: "HydroLog", icon: <Coffee size={20} className="mr-2 text-brown-500" /> },
    { id: "tab3", key: "kegel", label: "KegelLog", icon: <Dumbbell size={20} className="mr-2 text-purple-500" /> },
    {
      id: "tab4",
      key: "stricture",
      label: "Urethral Stricture",
      icon: <AlertTriangle size={20} className="mr-2 text-orange-500" />,
    },
    { id: "tab5", key: "hydration", label: "Hydration", icon: <Droplet size={20} className="mr-2 text-cyan-500" /> },
  ].filter((tab) => isTabEnabled(tab.id))

  // Define validation functions
  const isFlowDataValid = volume !== "" && duration !== ""
  const isFluidDataValid = hydroLogType !== "" && hydroLogAmount !== ""
  const isKegelDataValid = kegelReps !== "" && kegelHoldTime !== "" && kegelSets !== ""
  const isStrictureDataValid = strictureVolume !== "" && strictureDuration !== ""
  const isHydrationDataValid =
    getFieldConfig("tab5", "field1")?.enabled &&
    hydrationBeverageType !== "" &&
    (hydrationBeverageType !== "Other" || (hydrationBeverageType === "Other" && hydrationCustomType !== "")) &&
    Number(hydrationAmount) > 0

  const isSaveEnabled =
    (activeTab === "basic" && isFlowDataValid) ||
    (activeTab === "fluid" && isFluidDataValid) ||
    (activeTab === "kegel" && isKegelDataValid) ||
    (activeTab === "stricture" && isStrictureDataValid) ||
    (activeTab === "hydration" && isHydrationDataValid)

  // Timer functions
  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true)
      const startTime = Date.now() - elapsedTime
      setTimerStart(startTime)

      // Create interval and store its ID
      const intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
        setDuration(Math.floor((Date.now() - startTime) / 1000).toString())
      }, 100)

      // Store interval ID in a ref to clear it later
      timerIntervalRef.current = intervalId
    }
  }

  const pauseTimer = () => {
    if (isTimerRunning && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
      setIsTimerRunning(false)
    }
  }

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setIsTimerRunning(false)
    setTimerStart(null)
    setElapsedTime(0)
    setDuration("")
  }

  // Stricture timer functions
  const startStrictureTimer = () => {
    if (!isStrictureTimerRunning) {
      setIsStrictureTimerRunning(true)
      const startTime = Date.now() - strictureElapsedTime
      setStrictureTimerStart(startTime)

      // Create interval and store its ID
      const intervalId = setInterval(() => {
        setStrictureElapsedTime(Date.now() - startTime)
        setStrictureDuration(Math.floor((Date.now() - startTime) / 1000).toString())
      }, 100)

      // Store interval ID in a ref to clear it later
      strictureTimerIntervalRef.current = intervalId
    }
  }

  const pauseStrictureTimer = () => {
    if (isStrictureTimerRunning && strictureTimerIntervalRef.current) {
      clearInterval(strictureTimerIntervalRef.current)
      strictureTimerIntervalRef.current = null
      setIsStrictureTimerRunning(false)
    }
  }

  const resetStrictureTimer = () => {
    if (strictureTimerIntervalRef.current) {
      clearInterval(strictureTimerIntervalRef.current)
      strictureTimerIntervalRef.current = null
    }
    setIsStrictureTimerRunning(false)
    setStrictureTimerStart(null)
    setStrictureElapsedTime(0)
    setStrictureDuration("")
  }

  // Format timer display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const tenths = Math.floor((ms % 1000) / 100)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${tenths}`
  }

  // Handle form submission
  const handleSubmit = () => {
    const timestamp = new Date().toISOString()
    const id = Date.now().toString()

    if (activeTab === "basic" && isFlowDataValid) {
      const uroLogEntry: UroLog = {
        id,
        timestamp,
        volume: Number(volume),
        duration: Number(duration),
        flowRate: calculatedFlowRate || 0,
        color: color || "",
        concerns: concerns,
        urgency: urgency || "",
        notes: flowNotes,
        isDemo: false,
      }
      addUroLog(uroLogEntry)
      resetForm("basic")
    } else if (activeTab === "fluid" && isFluidDataValid) {
      const hydroLogEntry: HydroLog = {
        id,
        timestamp,
        volume: Number(hydroLogAmount),
        type: hydroLogType === "Other" ? customFluidType : hydroLogType,
        notes: hydroLogNotes,
        isDemo: false,
      }
      addHydroLog(hydroLogEntry)
      resetForm("fluid")
    } else if (activeTab === "kegel" && isKegelDataValid) {
      const kegelLogEntry: KegelLog = {
        id,
        timestamp,
        duration: Number(kegelHoldTime),
        intensity: 0, // Default value
        sets: Number(kegelSets),
        notes: kegelNotes,
        isDemo: false,
      }
      addKegelLog(kegelLogEntry)
      resetForm("kegel")
    } else if (activeTab === "stricture" && isStrictureDataValid) {
      const strictureEntry: UroLog = {
        id,
        timestamp,
        volume: Number(strictureVolume),
        duration: Number(strictureDuration),
        flowRate: strictureFlowRate || 0,
        color: strictureColor || "",
        concerns: strictureSymptoms,
        urgency: strictureUrgency || "",
        notes: strictureNotes,
        isDemo: false,
        streamQuality: streamQuality,
        painLevel: painLevel,
      }
      addUroLog(strictureEntry)
      resetForm("stricture")
    } else if (activeTab === "hydration" && isHydrationDataValid) {
      const hydroLogEntry: HydroLog = {
        id,
        timestamp,
        volume: Number(hydrationAmount),
        type: hydrationBeverageType === "Other" ? hydrationCustomType : hydrationBeverageType,
        notes: hydrationNotes,
        isDemo: false,
        temperature: hydrationTemperature,
        timeOfDay: hydrationTimeOfDay,
        unit: hydrationUnit,
      }
      addHydroLog(hydroLogEntry)
      resetForm("hydration")
    }
  }

  // Reset form fields based on tab
  const resetForm = (tab: string) => {
    if (tab === "basic") {
      setVolume("")
      setDuration("")
      setColor("")
      setUrgency("")
      setConcerns([])
      setFlowNotes("")
      resetTimer()
    } else if (tab === "fluid") {
      setFluidType("")
      setCustomFluidType("")
      setFluidAmount("")
      setFluidUnit("mL")
      setFluidNotes("")
    } else if (tab === "kegel") {
      setKegelReps("")
      setKegelHoldTime("")
      setKegelSets("")
      setKegelCompleted(false)
      setKegelNotes("")
    } else if (tab === "stricture") {
      setStrictureVolume("")
      setStrictureDuration("")
      setStrictureColor("")
      setStrictureUrgency("")
      setStrictureSymptoms([])
      setStreamQuality("")
      setPainLevel("")
      setStrictureNotes("")
      resetStrictureTimer()
    } else if (tab === "hydration") {
      setHydrationBeverageType("")
      setHydrationCustomType("")
      setHydrationAmount("")
      setHydrationUnit("mL")
      setHydrationTemperature("")
      setHydrationTimeOfDay("")
      setHydrationGoal("")
      setHydrationNotes("")
    }
  }

  // Toggle concern selection
  const toggleConcern = (concern: ConcernType) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((c) => c !== concern))
    } else {
      setConcerns([...concerns, concern])
    }
  }

  // Toggle stricture symptom selection
  const toggleSymptom = (symptom: string) => {
    if (strictureSymptoms.includes(symptom)) {
      setStrictureSymptoms(strictureSymptoms.filter((s) => s !== symptom))
    } else {
      setStrictureSymptoms([...strictureSymptoms, symptom])
    }
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (strictureTimerIntervalRef.current) {
        clearInterval(strictureTimerIntervalRef.current)
      }
    }
  }, [])

  // In the EntryForm component, update the useEffect that initializes the component
  useEffect(() => {
    // Update the appConfig with tracker tabs
    const updatedConfig = updateConfigWithTrackerTabs(appConfig)

    // Use the updated config for the rest of the initialization
    const tabsConfig = updatedConfig.pages.page1?.sections.section1?.tabs || {}

    // Rest of your existing code...
  }, [appConfig])

  return (
    <div className="flow-entry-form">
      {/* Tab navigation */}
      <div className="flex flex-wrap mb-4 border-b">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg flex items-center ${
              activeTab === tab.key
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* UroLog tab content */}
      {activeTab === "basic" && isTabEnabled("tab1") && (
        <div className="max-w-[414px] mx-auto">
          <div className="form-group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            {/* Volume */}
            {getFieldConfig("tab1", "field1")?.enabled && (
              <div className="mb-4">
                <label htmlFor="volume" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab1", "field1")?.label || "Volume (mL)"}
                </label>
                <input
                  type="number"
                  id="volume"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab1", "field1")?.placeholder || "mL"}
                  required={getFieldConfig("tab1", "field1")?.required}
                  min={getFieldConfig("tab1", "field1")?.min || 0}
                  max={getFieldConfig("tab1", "field1")?.max || 800}
                />
                {getFieldConfig("tab1", "field1")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab1", "field1")?.helpText}</p>
                )}
              </div>
            )}

            {/* Duration with Timer */}
            {getFieldConfig("tab1", "field2")?.enabled && (
              <div className="mb-4">
                <label htmlFor="duration" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab1", "field2")?.label || "Duration (seconds)"}
                </label>
                <div className="flex flex-col">
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 mb-2"
                    placeholder={getFieldConfig("tab1", "field2")?.placeholder || "Sec"}
                    required={getFieldConfig("tab1", "field2")?.required}
                    min={getFieldConfig("tab1", "field2")?.min || 0}
                    max={getFieldConfig("tab1", "field2")?.max || 600}
                  />

                  {/* Timer Display */}
                  {getFieldConfig("tab1", "field2")?.enableTimer && (isTimerRunning || elapsedTime > 0) && (
                    <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg p-3 mb-2 text-center">
                      <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>
                  )}

                  {/* Timer Controls */}
                  {getFieldConfig("tab1", "field2")?.enableTimer && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        onClick={isTimerRunning ? pauseTimer : startTimer}
                        className={`p-3 rounded-lg text-white font-medium ${
                          isTimerRunning
                            ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                            : "bg-green-500 hover:bg-green-600 active:bg-green-700"
                        }`}
                      >
                        {isTimerRunning ? "Pause Timer" : "Start Timer"}
                      </button>
                      <button
                        type="button"
                        onClick={resetTimer}
                        className="p-3 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                      >
                        Reset Timer
                      </button>
                    </div>
                  )}
                </div>
                {getFieldConfig("tab1", "field2")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab1", "field2")?.helpText}</p>
                )}
              </div>
            )}

            {/* Flow Rate (Calculated) */}
            {getFieldConfig("tab1", "field3")?.enabled && (
              <div className="mb-4">
                <label htmlFor="flow-rate" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab1", "field3")?.label || "Flow Rate (mL/s)"}
                </label>
                <input
                  type="text"
                  id="flow-rate"
                  value={calculatedFlowRate !== null ? calculatedFlowRate.toString() : ""}
                  readOnly
                  className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab1", "field3")?.placeholder || "mL/s"}
                />
                {getFieldConfig("tab1", "field3")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab1", "field3")?.helpText}</p>
                )}
              </div>
            )}

            {/* Urine Color */}
            {getFieldConfig("tab1", "field4")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="urine-color"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab1", "field4")?.label || "Urine Color"}
                </label>
                <select
                  id="urine-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value as UrineColor)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab1", "field4")?.required}
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Urgency Rating */}
            {getFieldConfig("tab1", "field5")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="urgency-rating"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Clock size={20} className="mr-2 text-purple-500" />
                  {getFieldConfig("tab1", "field5")?.label || "Urgency Rating"}
                </label>
                <select
                  id="urgency-rating"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyRating)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab1", "field5")?.required}
                >
                  {getFieldConfig("tab1", "field5")?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Concerns/Symptoms */}
            {getFieldConfig("tab1", "field6")?.enabled && (
              <div className="mb-4">
                <label className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab1", "field6")?.label || "Concerns/Symptoms"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getFieldConfig("tab1", "field6")?.options?.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`concern-${option.value}`}
                        checked={concerns.includes(option.value as ConcernType)}
                        onChange={() => toggleConcern(option.value as ConcernType)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`concern-${option.value}`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {getFieldConfig("tab1", "field9")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="flow-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  {getFieldConfig("tab1", "field9")?.label || "Notes"}
                  {getFieldConfig("tab1", "field9")?.helpText && (
                    <span className="ml-2 text-sm text-gray-500">({getFieldConfig("tab1", "field9")?.helpText})</span>
                  )}
                </label>
                <textarea
                  id="flow-notes"
                  value={flowNotes}
                  onChange={(e) => setFlowNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder={getFieldConfig("tab1", "field9")?.placeholder || "Add any additional notes..."}
                  required={getFieldConfig("tab1", "field9")?.required}
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{flowNotes.length}/256 characters</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HydroLog tab content */}
      {activeTab === "fluid" && isTabEnabled("tab2") && (
        <div className="max-w-[414px] mx-auto">
          <div className="form-group bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            {/* Beverage Type */}
            {getFieldConfig("tab2", "field1")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="beverage-type"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Coffee size={20} className="mr-2 text-brown-500" />
                  {getFieldConfig("tab2", "field1")?.label || "Beverage Type"}
                </label>
                <select
                  id="beverage-type"
                  value={hydroLogType}
                  onChange={(e) => setFluidType(e.target.value as FluidType)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab2", "field1")?.required}
                >
                  {getFieldConfig("tab2", "field1")?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Beverage Type */}
            {hydroLogType === "Other" && getFieldConfig("tab2", "field2")?.enabled && (
              <div className="mb-4 animate-fade-in">
                <label
                  htmlFor="custom-beverage-type"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab2", "field2")?.label || "Custom Beverage Type"}
                </label>
                <input
                  type="text"
                  id="custom-beverage-type"
                  value={customFluidType}
                  onChange={(e) => setCustomFluidType(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab2", "field2")?.placeholder || "Enter beverage type"}
                  required={hydroLogType === "Other" && getFieldConfig("tab2", "field2")?.required}
                />
              </div>
            )}

            {/* Amount */}
            {getFieldConfig("tab2", "field3")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="fluid-amount"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab2", "field3")?.label || "Amount"}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="fluid-amount"
                    value={hydroLogAmount}
                    onChange={(e) => setFluidAmount(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 mr-2"
                    placeholder={getFieldConfig("tab2", "field3")?.placeholder || "Amount"}
                    required={getFieldConfig("tab2", "field3")?.required}
                    min={getFieldConfig("tab2", "field3")?.min || 1}
                    max={getFieldConfig("tab2", "field3")?.max || 2000}
                  />
                  <select
                    id="fluid-unit"
                    value={hydroLogUnit}
                    onChange={(e) => setFluidUnit(e.target.value as "oz" | "mL")}
                    className="p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  >
                    {getFieldConfig("tab2", "field4")?.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            {getFieldConfig("tab2", "field5")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="fluid-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  {getFieldConfig("tab2", "field5")?.label || "Notes"}
                  {getFieldConfig("tab2", "field5")?.helpText && (
                    <span className="ml-2 text-sm text-gray-500">({getFieldConfig("tab2", "field5")?.helpText})</span>
                  )}
                </label>
                <textarea
                  id="fluid-notes"
                  value={hydroLogNotes}
                  onChange={(e) => setFluidNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder={
                    getFieldConfig("tab2", "field5")?.placeholder ||
                    "Add any additional notes about this fluid intake..."
                  }
                  required={getFieldConfig("tab2", "field5")?.required}
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{hydroLogNotes.length}/256 characters</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KegelLog tab content */}
      {activeTab === "kegel" && isTabEnabled("tab3") && (
        <div className="max-w-[414px] mx-auto">
          <div className="form-group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            {/* Reps */}
            {getFieldConfig("tab3", "field1")?.enabled && (
              <div className="mb-4">
                <label htmlFor="kegel-reps" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab3", "field1")?.label || "Reps (Number of Squeezes)"}
                </label>
                <input
                  type="number"
                  id="kegel-reps"
                  value={kegelReps}
                  onChange={(e) => setKegelReps(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab3", "field1")?.placeholder || "Enter number of squeezes"}
                  required={getFieldConfig("tab3", "field1")?.required}
                  min={getFieldConfig("tab3", "field1")?.min || 1}
                  max={getFieldConfig("tab3", "field1")?.max || 100}
                />
              </div>
            )}

            {/* Hold Time */}
            {getFieldConfig("tab3", "field2")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="kegel-hold-time"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab3", "field2")?.label || "Hold Time (seconds)"}
                </label>
                <input
                  type="number"
                  id="kegel-hold-time"
                  value={kegelHoldTime}
                  onChange={(e) => setKegelHoldTime(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab3", "field2")?.placeholder || "Enter duration of each squeeze"}
                  required={getFieldConfig("tab3", "field2")?.required}
                  min={getFieldConfig("tab3", "field2")?.min || 1}
                  max={getFieldConfig("tab3", "field2")?.max || 60}
                />
              </div>
            )}

            {/* Sets */}
            {getFieldConfig("tab3", "field3")?.enabled && (
              <div className="mb-4">
                <label htmlFor="kegel-sets" className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab3", "field3")?.label || "Sets (Number of Sets)"}
                </label>
                <input
                  type="number"
                  id="kegel-sets"
                  value={kegelSets}
                  onChange={(e) => setKegelSets(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab3", "field3")?.placeholder || "Enter number of sets"}
                  required={getFieldConfig("tab3", "field3")?.required}
                  min={getFieldConfig("tab3", "field3")?.min || 1}
                  max={getFieldConfig("tab3", "field3")?.max || 20}
                />
              </div>
            )}

            {/* Total Exercise Time (Calculated) */}
            {getFieldConfig("tab3", "field4")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="kegel-total-time"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab3", "field4")?.label || "Total Exercise Time"}
                </label>
                <input
                  type="text"
                  id="kegel-total-time"
                  value={kegelTotalTime > 0 ? `${kegelTotalTime} seconds` : ""}
                  readOnly
                  className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab3", "field4")?.placeholder || "Total seconds"}
                />
                {getFieldConfig("tab3", "field4")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab3", "field4")?.helpText}</p>
                )}
              </div>
            )}

            {/* Completed All Sets */}
            {getFieldConfig("tab3", "field5")?.enabled && (
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="kegel-completed"
                    checked={kegelCompleted}
                    onChange={(e) => setKegelCompleted(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="kegel-completed"
                    className="ml-2 text-lg font-medium text-gray-900 dark:text-gray-300"
                  >
                    {getFieldConfig("tab3", "field5")?.label || "Completed All Sets"}
                  </label>
                </div>
              </div>
            )}

            {/* Notes */}
            {getFieldConfig("tab3", "field6")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="kegel-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  {getFieldConfig("tab3", "field6")?.label || "Notes"}
                  {getFieldConfig("tab3", "field6")?.helpText && (
                    <span className="ml-2 text-sm text-gray-500">({getFieldConfig("tab3", "field6")?.helpText})</span>
                  )}
                </label>
                <textarea
                  id="kegel-notes"
                  value={kegelNotes}
                  onChange={(e) => setKegelNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder={
                    getFieldConfig("tab3", "field6")?.placeholder || "Add any additional notes about this exercise..."
                  }
                  required={getFieldConfig("tab3", "field6")?.required}
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{kegelNotes.length}/256 characters</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Urethral Stricture tab content */}
      {activeTab === "stricture" && isTabEnabled("tab4") && (
        <div className="max-w-[414px] mx-auto">
          <div className="form-group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            {/* Volume */}
            {getFieldConfig("tab4", "field1")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-volume"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab4", "field1")?.label || "Volume (mL)"}
                </label>
                <input
                  type="number"
                  id="stricture-volume"
                  value={strictureVolume}
                  onChange={(e) => setStrictureVolume(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab4", "field1")?.placeholder || "mL"}
                  required={getFieldConfig("tab4", "field1")?.required}
                  min={getFieldConfig("tab4", "field1")?.min || 0}
                  max={getFieldConfig("tab4", "field1")?.max || 800}
                />
                {getFieldConfig("tab4", "field1")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab4", "field1")?.helpText}</p>
                )}
              </div>
            )}

            {/* Duration with Timer */}
            {getFieldConfig("tab4", "field2")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-duration"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab4", "field2")?.label || "Duration (seconds)"}
                </label>
                <div className="flex flex-col">
                  <input
                    type="number"
                    id="stricture-duration"
                    value={strictureDuration}
                    onChange={(e) => setStrictureDuration(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 mb-2"
                    placeholder={getFieldConfig("tab4", "field2")?.placeholder || "Sec"}
                    required={getFieldConfig("tab4", "field2")?.required}
                    min={getFieldConfig("tab4", "field2")?.min || 0}
                    max={getFieldConfig("tab4", "field2")?.max || 600}
                  />

                  {/* Timer Display */}
                  {getFieldConfig("tab4", "field2")?.enableTimer &&
                    (isStrictureTimerRunning || strictureElapsedTime > 0) && (
                      <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg p-3 mb-2 text-center">
                        <div className="text-3xl font-mono font-bold text-orange-600 dark:text-orange-400">
                          {formatTime(strictureElapsedTime)}
                        </div>
                      </div>
                    )}

                  {/* Timer Controls */}
                  {getFieldConfig("tab4", "field2")?.enableTimer && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        onClick={isStrictureTimerRunning ? pauseStrictureTimer : startStrictureTimer}
                        className={`p-3 rounded-lg text-white font-medium ${
                          isStrictureTimerRunning
                            ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                            : "bg-green-500 hover:bg-green-600 active:bg-green-700"
                        }`}
                      >
                        {isStrictureTimerRunning ? "Pause Timer" : "Start Timer"}
                      </button>
                      <button
                        type="button"
                        onClick={resetStrictureTimer}
                        className="p-3 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium"
                      >
                        Reset Timer
                      </button>
                    </div>
                  )}
                </div>
                {getFieldConfig("tab4", "field2")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab4", "field2")?.helpText}</p>
                )}
              </div>
            )}

            {/* Flow Rate (Calculated) */}
            {getFieldConfig("tab4", "field3")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-flow-rate"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab4", "field3")?.label || "Flow Rate (mL/s)"}
                </label>
                <input
                  type="text"
                  id="stricture-flow-rate"
                  value={strictureFlowRate !== null ? strictureFlowRate.toString() : ""}
                  readOnly
                  className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab4", "field3")?.placeholder || "mL/s"}
                />
                {getFieldConfig("tab4", "field3")?.helpText && (
                  <p className="text-sm text-gray-500 mt-1">{getFieldConfig("tab4", "field3")?.helpText}</p>
                )}
              </div>
            )}

            {/* Urine Color */}
            {getFieldConfig("tab4", "field4")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-urine-color"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab4", "field4")?.label || "Urine Color"}
                </label>
                <select
                  id="stricture-urine-color"
                  value={strictureColor}
                  onChange={(e) => setStrictureColor(e.target.value as UrineColor)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab4", "field4")?.required}
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Urgency Rating */}
            {getFieldConfig("tab4", "field5")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-urgency-rating"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Clock size={20} className="mr-2 text-purple-500" />
                  {getFieldConfig("tab4", "field5")?.label || "Urgency Rating"}
                </label>
                <select
                  id="stricture-urgency-rating"
                  value={strictureUrgency}
                  onChange={(e) => setStrictureUrgency(e.target.value as UrgencyRating)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab4", "field5")?.required}
                >
                  {getFieldConfig("tab4", "field5")?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stricture Symptoms */}
            {getFieldConfig("tab4", "field6")?.enabled && (
              <div className="mb-4">
                <label className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300">
                  {getFieldConfig("tab4", "field6")?.label || "Stricture Symptoms"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getFieldConfig("tab4", "field6")?.options?.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`symptom-${option.value}`}
                        checked={strictureSymptoms.includes(option.value)}
                        onChange={() => toggleSymptom(option.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`symptom-${option.value}`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stream Quality */}
            {getFieldConfig("tab4", "field7")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stream-quality"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Activity size={20} className="mr-2 text-blue-500" />
                  {getFieldConfig("tab4", "field7")?.label || "Stream Quality"}
                </label>
                <select
                  id="stream-quality"
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab4", "field7")?.required}
                >
                  {getFieldConfig("tab4", "field7")?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pain Level */}
            {getFieldConfig("tab4", "field7")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="pain-level"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Thermometer size={20} className="mr-2 text-red-500" />
                  {getFieldConfig("tab4", "field7")?.label || "Pain Level"}
                </label>
                <select
                  id="pain-level"
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab4", "field7")?.required}
                >
                  {getFieldConfig("tab4", "field7")?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            {getFieldConfig("tab4", "field8")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="stricture-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  {getFieldConfig("tab4", "field8")?.label || "Notes"}
                  {getFieldConfig("tab4", "field8")?.helpText && (
                    <span className="ml-2 text-sm text-gray-500">({getFieldConfig("tab4", "field8")?.helpText})</span>
                  )}
                </label>
                <textarea
                  id="stricture-notes"
                  value={strictureNotes}
                  onChange={(e) => setStrictureNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder={
                    getFieldConfig("tab4", "field8")?.placeholder ||
                    "Add any additional notes about stricture symptoms..."
                  }
                  required={getFieldConfig("tab4", "field8")?.required}
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{strictureNotes.length}/256 characters</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hydration tab content */}
      {activeTab === "hydration" && isTabEnabled("tab5") && (
        <div className="max-w-[414px] mx-auto">
          <div className="form-group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
            {/* Beverage Type */}
            {getFieldConfig("tab5", "field1")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-beverage-type"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Coffee size={20} className="mr-2 text-blue-500" />
                  {getFieldConfig("tab5", "field1")?.label || "Beverage Type"}
                </label>
                <select
                  id="hydration-beverage-type"
                  value={hydrationBeverageType}
                  onChange={(e) => setHydrationBeverageType(e.target.value)}
                  className={`w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select ${
                    !hydrationBeverageType
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 animate-pulse"
                      : ""
                  }`}
                  required={getFieldConfig("tab5", "field1")?.required}
                >
                  <option value="">Select beverage type</option>
                  <option value="Water">Water</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                  <option value="Soda">Soda</option>
                  <option value="Juice">Juice</option>
                  <option value="Sports Drink">Sports Drink</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Custom Beverage Type */}
            {hydrationBeverageType === "Other" && getFieldConfig("tab5", "field2")?.enabled && (
              <div className="mb-4 animate-fade-in">
                <label
                  htmlFor="hydration-custom-type"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab5", "field2")?.label || "Custom Beverage Type"}
                </label>
                <input
                  type="text"
                  id="hydration-custom-type"
                  value={hydrationCustomType}
                  onChange={(e) => setHydrationCustomType(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab5", "field2")?.placeholder || "Enter beverage type"}
                  required={hydrationBeverageType === "Other" && getFieldConfig("tab5", "field2")?.required}
                />
              </div>
            )}

            {/* Amount */}
            {getFieldConfig("tab5", "field3")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-amount"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab5", "field3")?.label || "Amount"}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="hydration-amount"
                    value={hydrationAmount}
                    onChange={(e) => setHydrationAmount(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 mr-2"
                    placeholder={getFieldConfig("tab5", "field3")?.placeholder || "Amount"}
                    required={getFieldConfig("tab5", "field3")?.required}
                    min={getFieldConfig("tab5", "field3")?.min || 1}
                    max={getFieldConfig("tab5", "field3")?.max || 2000}
                  />
                  <select
                    id="hydration-unit"
                    value={hydrationUnit}
                    onChange={(e) => setHydrationUnit(e.target.value as "oz" | "mL" | "cups")}
                    className="p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  >
                    <option value="mL">mL</option>
                    <option value="oz">oz</option>
                    <option value="cups">cups</option>
                  </select>
                </div>
              </div>
            )}

            {/* Temperature */}
            {getFieldConfig("tab5", "field5")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-temperature"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Thermometer size={20} className="mr-2 text-red-500" />
                  {getFieldConfig("tab5", "field5")?.label || "Temperature"}
                </label>
                <select
                  id="hydration-temperature"
                  value={hydrationTemperature}
                  onChange={(e) => setHydrationTemperature(e.target.value)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab5", "field5")?.required}
                >
                  <option value="">Select temperature</option>
                  <option value="Cold">Cold</option>
                  <option value="Cool">Cool</option>
                  <option value="Room Temperature">Room Temperature</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            )}

            {/* Time of Day */}
            {getFieldConfig("tab5", "field6")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-time-of-day"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <Clock size={20} className="mr-2 text-purple-500" />
                  {getFieldConfig("tab5", "field6")?.label || "Time of Day"}
                </label>
                <select
                  id="hydration-time-of-day"
                  value={hydrationTimeOfDay}
                  onChange={(e) => setHydrationTimeOfDay(e.target.value)}
                  className="w-full p-2.5 border rounded-lg appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200 enhanced-select"
                  required={getFieldConfig("tab5", "field6")?.required}
                >
                  <option value="">Select time of day</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            )}

            {/* Hydration Goal */}
            {getFieldConfig("tab5", "field7")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-goal"
                  className="block mb-2 text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  {getFieldConfig("tab5", "field7")?.label || "Hydration Goal"}
                </label>
                <input
                  type="number"
                  id="hydration-goal"
                  value={hydrationGoal}
                  onChange={(e) => setHydrationGoal(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg text-gray-800 dark:text-gray-200"
                  placeholder={getFieldConfig("tab5", "field7")?.placeholder || "Daily goal in mL or oz"}
                  required={getFieldConfig("tab5", "field7")?.required}
                  min={getFieldConfig("tab5", "field7")?.min || 1}
                  max={getFieldConfig("tab5", "field7")?.max || 5000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {getFieldConfig("tab5", "field7")?.helpText || "Set your daily hydration goal"}
                </p>
              </div>
            )}

            {/* Notes */}
            {getFieldConfig("tab5", "field8")?.enabled && (
              <div className="mb-4">
                <label
                  htmlFor="hydration-notes"
                  className="block mb-2 flex items-center text-lg font-medium text-gray-800 dark:text-gray-300"
                >
                  <FileText size={20} className="mr-2 text-green-500" />
                  {getFieldConfig("tab5", "field8")?.label || "Notes"}
                  {getFieldConfig("tab5", "field8")?.helpText && (
                    <span className="ml-2 text-sm text-gray-500">({getFieldConfig("tab5", "field8")?.helpText})</span>
                  )}
                </label>
                <textarea
                  id="hydration-notes"
                  value={hydrationNotes}
                  onChange={(e) => setHydrationNotes(e.target.value.slice(0, 256))}
                  maxLength={256}
                  className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[80px] text-lg text-gray-800 dark:text-gray-200"
                  rows={2}
                  placeholder={
                    getFieldConfig("tab5", "field8")?.placeholder ||
                    "Add any additional notes about this hydration entry..."
                  }
                  required={getFieldConfig("tab5", "field8")?.required}
                ></textarea>
                <div className="text-right text-lg text-gray-600 mt-1">{hydrationNotes.length}/256 characters</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!isSaveEnabled}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            isSaveEnabled ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}

export default EntryForm
