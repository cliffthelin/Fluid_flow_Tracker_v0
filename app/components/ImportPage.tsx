"use client"
import { ArrowLeft } from "lucide-react"
import ImportWizard from "./ImportWizard"

interface ImportPageProps {
  onBack: () => void
}

export default function ImportPage({ onBack }: ImportPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Import Data</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
        <ImportWizard onComplete={onBack} onCancel={onBack} />
      </div>
    </div>
  )
}
