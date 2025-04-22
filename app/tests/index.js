// Use ES module imports
import { testManualComponent } from "./manual.test.js"
import { testHeaderNotSticky } from "./header.test.js"

// Export all test functions using ES modules
export { testManualComponent, testHeaderNotSticky }

// Also export as default for compatibility
export default { testManualComponent, testHeaderNotSticky }
