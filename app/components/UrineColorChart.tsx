import type React from "react"
import { Droplet } from "lucide-react"
import CollapsibleSection from "./CollapsibleSection"

const UrineColorChart: React.FC = () => {
  const colorData = [
    {
      color: "Light Yellow",
      meaning: "Normal",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-800",
    },
    {
      color: "Clear",
      meaning: "Very hydrated or overhydrated",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
    {
      color: "Dark Yellow",
      meaning: "Mild dehydration",
      bgColor: "bg-yellow-300",
      textColor: "text-yellow-800",
    },
    {
      color: "Amber or Honey",
      meaning: "Dehydrated",
      bgColor: "bg-amber-300",
      textColor: "text-amber-800",
    },
    {
      color: "Orange",
      meaning: "Dehydration, Liver/bile duct issues, Certain medications",
      bgColor: "bg-orange-300",
      textColor: "text-orange-800",
    },
    {
      color: "Pink or Red",
      meaning: "Beets, blackberries, rhubarb, Blood in urine (hematuria)",
      bgColor: "bg-red-200",
      textColor: "text-red-800",
    },
    {
      color: "Blue or Green",
      meaning: "Medications",
      bgColor: "bg-teal-200",
      textColor: "text-teal-800",
    },
    {
      color: "Brown or Cola-colored",
      meaning: "Dyes in food or medications, Certain bacterial infections",
      bgColor: "bg-amber-700",
      textColor: "text-white",
    },
    {
      color: "Cloudy or Murky",
      meaning: "Urinary tract infection",
      bgColor: "bg-gray-300",
      textColor: "text-gray-800",
    },
    {
      color: "Foamy or Bubbly",
      meaning: "Excess protein in urine",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
  ]

  return (
    <CollapsibleSection title="Urine Color Chart" defaultExpanded={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colorData.map((item, index) => (
          <div key={index} className="flex items-center border rounded-lg overflow-hidden shadow-sm">
            <div className={`${item.bgColor} w-20 h-20 flex items-center justify-center`}>
              <Droplet size={28} className={item.textColor} />
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-medium text-base mb-1">{item.color}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.meaning}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong>Note:</strong> Urine color can be affected by medications, food, and hydration status. If you notice
          unusual colors that persist or are accompanied by other symptoms, consult a healthcare provider.
        </p>
      </div>
    </CollapsibleSection>
  )
}

export default UrineColorChart
