import type React from "react"
import { getActiveTrackers } from "../services/trackerService"
import CollapsibleSection from "./CollapsibleSection"

const TrackerHelp: React.FC = () => {
  const activeTrackerGroups = getActiveTrackers()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Custom Trackers</h3>

      {activeTrackerGroups.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No active trackers configured. You can activate trackers in the Configuration section.
        </p>
      ) : (
        <div className="space-y-4">
          {activeTrackerGroups.map((group, index) => (
            <CollapsibleSection key={index} title={group.group} defaultExpanded={index === 0}>
              <div className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="font-medium flex items-center">
                      {item.Name} <span className="text-xs ml-2 text-gray-500">({item.Acronym})</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item["Entry Text"]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Common Units: {item["Common Units"]} ({item["Common Units Full Name"]})
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrackerHelp
