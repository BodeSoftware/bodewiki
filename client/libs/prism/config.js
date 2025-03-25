import Prism from 'prismjs'

// Import core plugins
import 'prismjs/plugins/autoloader/prism-autoloader'
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace'
import 'prismjs/plugins/toolbar/prism-toolbar'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

// Import commonly used languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'

// Configure autoloader
Prism.plugins.autoloader.languages_path = '/_assets/js/prism/'

// Configure normalize whitespace
Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2
})

export default Prism 