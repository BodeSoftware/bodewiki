<template lang="pug">
  v-dialog.search-dialog(
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  )
    v-card
      v-card-title.pa-0
        v-toolbar(dark color="primary")
          v-btn(icon dark @click="dialog = false")
            v-icon mdi-close
          v-toolbar-title {{ $t('editor:bode.search') }}
          v-spacer
          v-text-field(
            v-model="searchQuery"
            dark
            flat
            hide-details
            prepend-icon="mdi-magnify"
            :placeholder="$t('editor:bode.searchPlaceholder')"
            @keyup.enter="findNext"
            @keyup.esc="dialog = false"
          )
      v-card-text.pa-0
        .search-results(v-if="results.length > 0")
          .search-stats.pa-4
            .caption {{ $t('editor:bode.searchResults', { count: results.length }) }}
          v-list
            v-list-item(
              v-for="(result, index) in results"
              :key="index"
              @click="goToResult(result)"
              :class="{ 'v-list-item--active': currentResult === index }"
            )
              v-list-item-content
                v-list-item-title {{ result.text }}
                v-list-item-subtitle {{ result.context }}
        .no-results.pa-4.text-center(v-else-if="searchQuery")
          .title {{ $t('editor:bode.noResults') }}
        .search-help.pa-4(v-else)
          .title.mb-2 {{ $t('editor:bode.searchHelp') }}
          v-list(dense)
            v-list-item
              v-list-item-icon
                v-icon mdi-keyboard
              v-list-item-content
                v-list-item-title {{ $t('editor:bode.searchShortcuts') }}
                v-list-item-subtitle
                  .shortcut.mr-2
                    kbd Enter
                    span {{ $t('editor:bode.findNext') }}
                  .shortcut.mr-2
                    kbd Shift
                    span +
                    kbd Enter
                    span {{ $t('editor:bode.findPrevious') }}
                  .shortcut
                    kbd Esc
                    span {{ $t('editor:bode.closeSearch') }}
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      searchQuery: '',
      results: [],
      currentResult: -1
    }
  },
  watch: {
    value(newValue) {
      this.dialog = newValue
    },
    dialog(newValue) {
      this.$emit('input', newValue)
      if (!newValue) {
        this.searchQuery = ''
        this.results = []
        this.currentResult = -1
      }
    },
    searchQuery(newValue) {
      if (!newValue) {
        this.results = []
        this.currentResult = -1
        return
      }
      this.search()
    }
  },
  methods: {
    search() {
      if (!this.searchQuery) return
      
      const content = this.$store.get('editor/content')
      const regex = new RegExp(this.searchQuery, 'gi')
      const results = []
      let match
      
      while ((match = regex.exec(content)) !== null) {
        const start = Math.max(0, match.index - 50)
        const end = Math.min(content.length, match.index + match[0].length + 50)
        const context = content.substring(start, end)
        
        results.push({
          index: match.index,
          text: match[0],
          context: context
        })
      }
      
      this.results = results
      this.currentResult = results.length > 0 ? 0 : -1
      
      if (this.currentResult >= 0) {
        this.goToResult(this.results[this.currentResult])
      }
    },
    findNext() {
      if (this.results.length === 0) return
      this.currentResult = (this.currentResult + 1) % this.results.length
      this.goToResult(this.results[this.currentResult])
    },
    findPrevious() {
      if (this.results.length === 0) return
      this.currentResult = (this.currentResult - 1 + this.results.length) % this.results.length
      this.goToResult(this.results[this.currentResult])
    },
    goToResult(result) {
      this.$emit('search-result', result)
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style lang="scss" scoped>
.search-dialog {
  .search-results {
    height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .shortcut {
    display: inline-flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 8px;

    kbd {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 2px 4px;
      border-radius: 2px;
      margin-right: 4px;
    }
  }
}
</style> 