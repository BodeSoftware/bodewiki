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
      v-card-actions
        v-spacer
        v-btn(
          text
          @click='discard'
        ) Discard My Changes
        v-btn(
          color='primary'
          @click='overwrite'
        ) Keep My Changes

script.
  import { get } from 'vuex-pathify'

  export default {
    name: 'EditorConflict',
    data() {
      return {
        show: false
      }
    },
    computed: {
      currentContent() {
        return this.$store.get('editor/content')
      },
      serverContent() {
        return this.$store.get('editor/conflictContent')
      }
    },
    mounted() {
      this.$root.$on('saveConflict', () => {
        this.show = true
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
      discard() {
        this.$store.set('editor/content', this.serverContent)
        this.$root.$emit('overwriteEditorContent')
        this.show = false
      },
      overwrite() {
        this.$root.$emit('forceSave')
        this.show = false
      }
    }
  }

style(lang='scss').
  .v-card-text {
    max-height: 400px;
    overflow-y: auto;
  } 