"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, ExternalLink, Edit } from "lucide-react"
import type { CustomResource } from "../types"
import { getCustomResources, addCustomResource, deleteCustomResource } from "../services/db"
import CollapsibleSection from "./CollapsibleSection"

const Resources = () => {
  const [customResources, setCustomResources] = useState<CustomResource[]>([])
  const [newResource, setNewResource] = useState({ title: "", url: "", category: "General" })
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [editingResource, setEditingResource] = useState<CustomResource | null>(null)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const resources = await getCustomResources()
        setCustomResources(resources)
      } catch (error) {
        console.error("Error loading custom resources:", error)
      }
    }

    loadResources()
  }, [])

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) return

    try {
      // Ensure URL has protocol
      let url = newResource.url
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url
      }

      const resource: CustomResource = {
        id: Date.now().toString(),
        title: newResource.title,
        url,
        category: newResource.category,
      }

      await addCustomResource(resource)
      setCustomResources([...customResources, resource])
      setNewResource({ title: "", url: "", category: "General" })
      setIsAddingResource(false)
    } catch (error) {
      console.error("Error adding custom resource:", error)
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteCustomResource(id)
      setCustomResources(customResources.filter((resource) => resource.id !== id))
    } catch (error) {
      console.error("Error deleting custom resource:", error)
    }
  }

  const handleUpdateResource = async () => {
    if (!editingResource || !editingResource.title || !editingResource.url) return

    try {
      // Ensure URL has protocol
      let url = editingResource.url
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url
      }

      const updatedResource = { ...editingResource, url }

      // Update in database
      await addCustomResource(updatedResource)

      // Update in state
      setCustomResources(
        customResources.map((resource) => (resource.id === editingResource.id ? updatedResource : resource)),
      )
      setEditingResource(null)
    } catch (error) {
      console.error("Error updating custom resource:", error)
    }
  }

  const resourceCategories = [
    { id: "general", title: "General Resources", icon: "📚" },
    { id: "medical", title: "Medical Resources", icon: "🏥" },
    { id: "dietary", title: "Dietary Recommendations", icon: "🥗" },
    { id: "exercise", title: "Exercise Recommendations", icon: "🏃" },
    { id: "custom", title: "My Resources", icon: "📌" },
  ]

  return (
    <div className="space-y-6">
      {/* General Resources */}
      <CollapsibleSection title="General Resources" defaultExpanded={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.urologyhealth.org/urologic-conditions/urinary-tract-infections-in-adults"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-medium">UTI Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Urology Care Foundation</p>
          </a>

          <a
            href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-medium">Bladder Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              National Institute of Diabetes and Digestive and Kidney Diseases
            </p>
          </a>

          <a
            href="https://www.mayoclinic.org/diseases-conditions/urinary-incontinence/symptoms-causes/syc-20352808"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-medium">Urinary Incontinence</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mayo Clinic</p>
          </a>

          <a
            href="https://www.health.harvard.edu/bladder-and-bowel/what-to-do-about-an-overactive-bladder"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-medium">Overactive Bladder</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Harvard Health</p>
          </a>
        </div>
      </CollapsibleSection>

      {/* Medical Resources */}
      <CollapsibleSection title="Medical Resources" defaultExpanded={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.auanet.org/guidelines/guidelines/benign-prostatic-hyperplasia-(bph)-guideline"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">👨‍⚕️</div>
            <h3 className="font-medium">BPH Guidelines</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">American Urological Association</p>
          </a>

          <a
            href="https://www.mayoclinic.org/diseases-conditions/urinary-tract-infection/diagnosis-treatment/drc-20353453"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">💊</div>
            <h3 className="font-medium">UTI Treatment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mayo Clinic</p>
          </a>

          <a
            href="https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🔬</div>
            <h3 className="font-medium">Prostate Problems</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              National Institute of Diabetes and Digestive and Kidney Diseases
            </p>
          </a>

          <a
            href="https://www.urologyhealth.org/urologic-conditions/kidney-stones"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🪨</div>
            <h3 className="font-medium">Kidney Stones</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Urology Care Foundation</p>
          </a>
        </div>
      </CollapsibleSection>

      {/* Dietary Recommendations */}
      <CollapsibleSection title="Dietary Recommendations" defaultExpanded={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">💧</div>
            <h3 className="font-medium">Water: How much should you drink?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mayo Clinic</p>
          </a>

          <a
            href="https://www.health.harvard.edu/blog/kidney-stones-what-foods-should-you-avoid-2020103121115"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🥗</div>
            <h3 className="font-medium">Kidney Stones: Foods to Avoid</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Harvard Health</p>
          </a>

          <a
            href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems/eating-drinking-habits"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="font-medium">Diet for Bladder Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              National Institute of Diabetes and Digestive and Kidney Diseases
            </p>
          </a>

          <a
            href="https://www.urologyhealth.org/healthy-living/care-blog/2018/foods-and-drinks-that-may-contribute-to-bladder-irritation-and-overactive-bladder-symptoms"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🚫</div>
            <h3 className="font-medium">Bladder Irritants</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Urology Care Foundation</p>
          </a>
        </div>
      </CollapsibleSection>

      {/* Exercise Recommendations */}
      <CollapsibleSection title="Exercise Recommendations" defaultExpanded={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/kegel-exercises/art-20045283"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">💪</div>
            <h3 className="font-medium">Kegel Exercises</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Mayo Clinic</p>
          </a>

          <a
            href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems/kegel-exercises"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">🏋️</div>
            <h3 className="font-medium">Pelvic Floor Exercises</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              National Institute of Diabetes and Digestive and Kidney Diseases
            </p>
          </a>

          <a
            href="https://www.health.harvard.edu/bladder-and-bowel/step-by-step-guide-to-performing-kegel-exercises"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-medium">Step-by-Step Kegel Guide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Harvard Health</p>
          </a>

          <a
            href="https://www.urologyhealth.org/healthy-living/urologyhealth-extra/magazine-archives/summer-2016/pelvic-floor-muscle-exercises-for-men"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="text-2xl mb-2">👨</div>
            <h3 className="font-medium">Exercises for Men</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Urology Care Foundation</p>
          </a>
        </div>
      </CollapsibleSection>

      {/* My Resources */}
      <CollapsibleSection title="My Resources" defaultExpanded={false}>
        <div className="mb-4">
          {!isAddingResource ? (
            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-2" />
              Add Resource
            </button>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3">Add New Resource</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    id="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="General">General</option>
                    <option value="Medical">Medical</option>
                    <option value="Dietary">Dietary</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleAddResource}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingResource(false)
                      setNewResource({ title: "", url: "", category: "General" })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {editingResource && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <h3 className="text-lg font-medium mb-3">Edit Resource</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  id="edit-url"
                  value={editingResource.url}
                  onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editingResource.category}
                  onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="Medical">Medical</option>
                  <option value="Dietary">Dietary</option>
                  <option value="Exercise">Exercise</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleUpdateResource}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {customResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customResources.map((resource) => (
              <div key={resource.id} className="resource-card relative group">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                    aria-label="Edit resource"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="p-1 text-gray-500 hover:text-red-500 focus:outline-none"
                    aria-label="Delete resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-2xl mb-2">📌</div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                    <ExternalLink size={14} className="mr-1" />
                    {resource.category}
                  </p>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center py-4">
            No custom resources yet. Add your first resource using the button above.
          </p>
        )}
      </CollapsibleSection>

      <style jsx>{`
       .resource-card {
         @apply bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 flex flex-col;
       }
     `}</style>
    </div>
  )
}

export default Resources
