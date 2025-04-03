/**
 * Bode Editor Module
 */

module.exports = {
  /**
   * Initialize module
   *
   * @param {object} config Module Config
   * @param {object} system System instance
   */
  async init(config, system) {
    // Initialize Bode Editor Module
    console.info(`Initializing Bode Editor Module...`)
    
    // Ensure the bode editor is registered with the version control system
    if (WIKI.models.pageHistory) {
      console.info(`Registering Bode Editor with version control system...`)
      
      // Add editor specific hooks for version control 
      WIKI.events.on('pageSave', async (opts) => {
        if (opts.editor === 'bode') {
          try {
            // Make sure we're tracking version properly
            if (!opts.versionDate) {
              opts.versionDate = new Date().toISOString()
            }
            
            // Add version hash for conflict detection
            if (!opts.hash) {
              const crypto = require('crypto')
              opts.hash = crypto.createHash('md5').update(opts.content).digest('hex')
            }
            
            console.info(`Bode Editor: Saving version for page ${opts.id} / ${opts.path}`)
          } catch (err) {
            console.error(`Bode Editor: Error in version control hook: ${err.message}`)
          }
        }
      })
      
      // Handle version comparison
      WIKI.events.on('pageVersionCompare', async (opts) => {
        if (opts.editor === 'bode') {
          try {
            console.info(`Bode Editor: Comparing versions ${opts.versionId} and ${opts.previousVersionId}`)
            
            // We don't need to do special handling as the default diff works fine for HTML
            return null
          } catch (err) {
            console.error(`Bode Editor: Error in version comparison: ${err.message}`)
          }
        }
      })
    }
  },

  /**
   * Module unload / cleanup
   */
  async deinit() {
    // Clean up event listeners 
    WIKI.events.removeAllListeners('pageSave')
    WIKI.events.removeAllListeners('pageVersionCompare')
  }
} 