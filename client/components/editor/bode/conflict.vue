template(lang='pug')
  v-dialog(
    v-model='show'
    persistent
    max-width='800'
  )
    v-card
      v-card-title.headline Version Conflict
      v-card-text
        v-alert(type='warning', text)
          | Another user has modified this page while you were editing.
          | Please choose how to proceed:
        v-row
          v-col(cols='6')
            v-card(outlined)
              v-card-title Your Changes
              v-card-text
                div(v-html='currentContent')
          v-col(cols='6')
            v-card(outlined)
              v-card-title Server Version
              v-card-text
                div(v-html='serverContent')
        v-alert(
          v-if="conflictDetails"
          type="info"
          text
          class="mt-4"
        )
          | This page was edited by {{ conflictDetails.authorName }} on {{ formatDate(conflictDetails.timestamp) }}.
      v-card-actions
        v-spacer
        v-btn(
          text
          @click='merge'
          color='info'
        ) Merge Changes
        v-btn(
          text
          @click='discard'
        ) Use Server Version
        v-btn(
          color='primary'
          @click='overwrite'
        ) Use My Version

script.
  import { get } from 'vuex-pathify'
  import gql from 'graphql-tag'
  import _ from 'lodash'

  export default {
    name: 'EditorConflict',
    props: {
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        show: false,
        conflictDetails: null
      }
    },
    computed: {
      currentContent() {
        return this.$store.get('editor/content')
      },
      serverContent() {
        return this.$store.get('editor/conflictContent') || ''
      }
    },
    watch: {
      value(newValue) {
        this.show = newValue
      },
      show(newValue) {
        this.$emit('input', newValue)
        if (newValue) {
          this.fetchConflictDetails()
        }
      }
    },
    mounted() {
      this.$root.$on('saveConflict', () => {
        this.show = true
        this.fetchLatestVersion()
      })
      this.$root.$on('resetEditorConflict', () => {
        this.show = false
      })
    },
    beforeDestroy() {
      this.$root.$off('saveConflict')
      this.$root.$off('resetEditorConflict')
    },
    methods: {
      async fetchLatestVersion() {
        try {
          const result = await this.$apollo.query({
            query: gql`
              query ($pageId: Int!) {
                pages {
                  single(id: $pageId) {
                    content
                    updatedAt
                    updatedBy {
                      name
                    }
                  }
                }
              }
            `,
            fetchPolicy: 'network-only',
            variables: {
              pageId: this.$store.get('page/id')
            }
          })
          
          const pageData = _.get(result, 'data.pages.single', {})
          if (pageData.content) {
            this.$store.set('editor/conflictContent', pageData.content)
            this.conflictDetails = {
              authorName: _.get(pageData, 'updatedBy.name', 'Unknown user'),
              timestamp: pageData.updatedAt
            }
          }
        } catch (err) {
          console.error('Error fetching latest version:', err)
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return 'Unknown date'
        return new Date(dateString).toLocaleString()
      },
      
      discard() {
        this.$store.set('editor/content', this.serverContent)
        this.$root.$emit('overwriteEditorContent')
        this.show = false
      },
      
      overwrite() {
        this.$root.$emit('forceSave')
        this.show = false
      },
      
      merge() {
        // Create a basic merge UI that shows both versions side by side
        // and allows the user to choose which sections to keep
        this.$store.set('editor/activeModal', 'editorModalMerge')
        this.$store.set('editor/mergeOriginalContent', this.currentContent)
        this.$store.set('editor/mergeServerContent', this.serverContent)
        this.show = false
      }
    }
  }

style(lang='scss').
  .v-card-text {
    max-height: 400px;
    overflow-y: auto;
  } 