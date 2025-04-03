<template lang="pug">
  v-dialog(
    v-model="isActive"
    max-width="1200px"
    persistent
  )
    v-card
      v-card-title.headline Merge Changes
      v-card-text
        v-alert(
          type="info"
          text
          class="mb-4"
        ) Select which sections to keep from each version by toggling the checkboxes.
        
        v-row
          v-col(cols="6")
            v-card(outlined)
              v-card-title Your Version
              v-card-text
                v-checkbox(
                  v-for="(section, idx) in yourSections"
                  :key="'your-' + idx"
                  v-model="section.selected"
                  :label="'Section ' + (idx + 1)"
                  color="primary"
                )
                .section-content(
                  v-for="(section, idx) in yourSections"
                  :key="'your-content-' + idx"
                  :class="{ 'section-selected': section.selected }"
                )
                  div(v-html="section.content")
          
          v-col(cols="6")
            v-card(outlined)
              v-card-title Server Version
              v-card-text
                v-checkbox(
                  v-for="(section, idx) in serverSections"
                  :key="'server-' + idx"
                  v-model="section.selected"
                  :label="'Section ' + (idx + 1)"
                  color="primary"
                )
                .section-content(
                  v-for="(section, idx) in serverSections"
                  :key="'server-content-' + idx"
                  :class="{ 'section-selected': section.selected }"
                )
                  div(v-html="section.content")
        
        v-expansion-panel.mt-4
          v-expansion-panel-header Merged Preview
          v-expansion-panel-content
            div(v-html="mergedContent")
      
      v-card-actions
        v-spacer
        v-btn(
          text
          @click="close"
        ) Cancel
        v-btn(
          color="primary"
          @click="applyMerge"
        ) Apply Merged Content
</template>

<script>
import { get, sync } from 'vuex-pathify'
import _ from 'lodash'
import diffMatchPatch from 'diff-match-patch'

export default {
  name: 'EditorModalMerge',
  data() {
    return {
      yourSections: [],
      serverSections: [],
      isActive: false
    }
  },
  computed: {
    activeModal: sync('editor/activeModal'),
    originalContent: get('editor/mergeOriginalContent'),
    serverContent: get('editor/mergeServerContent'),
    
    mergedContent() {
      let merged = ''
      
      // Combine selected sections from both versions
      const allSections = []
      
      // Add your selected sections
      this.yourSections.forEach((section, idx) => {
        if (section.selected) {
          allSections.push({
            content: section.content,
            order: section.order
          })
        }
      })
      
      // Add server selected sections
      this.serverSections.forEach((section, idx) => {
        if (section.selected) {
          allSections.push({
            content: section.content,
            order: section.order
          })
        }
      })
      
      // Sort sections by original order
      allSections.sort((a, b) => a.order - b.order)
      
      // Combine sections
      merged = allSections.map(s => s.content).join('')
      
      return merged
    }
  },
  watch: {
    activeModal(val) {
      this.isActive = val === 'editorModalMerge'
      if (this.isActive) {
        this.initializeSections()
      }
    }
  },
  methods: {
    initializeSections() {
      // Create diff between versions
      const dmp = new diffMatchPatch()
      const diffs = dmp.diff_main(this.originalContent || '', this.serverContent || '')
      dmp.diff_cleanupSemantic(diffs)
      
      // Parse the diffs into sections
      let yourSections = []
      let serverSections = []
      let order = 0
      
      diffs.forEach(diff => {
        const [diffType, content] = diff
        
        // Equal - both sides have this content
        if (diffType === 0) {
          yourSections.push({
            content,
            selected: true,
            order: order
          })
          
          serverSections.push({
            content,
            selected: false,
            order: order
          })
          
          order++
        } 
        // Original content only
        else if (diffType === -1) {
          yourSections.push({
            content,
            selected: true,
            order: order
          })
          order++
        }
        // Server content only 
        else if (diffType === 1) {
          serverSections.push({
            content,
            selected: true,
            order: order
          })
          order++
        }
      })
      
      // Handle edge case with empty content
      if (yourSections.length === 0 && this.originalContent) {
        yourSections.push({
          content: this.originalContent,
          selected: true,
          order: 0
        })
      }
      
      if (serverSections.length === 0 && this.serverContent) {
        serverSections.push({
          content: this.serverContent,
          selected: true,
          order: 0
        })
      }
      
      this.yourSections = yourSections
      this.serverSections = serverSections
    },
    
    applyMerge() {
      // Apply the merged content to the editor
      this.$store.set('editor/content', this.mergedContent)
      this.$root.$emit('overwriteEditorContent')
      this.close()
    },
    
    close() {
      this.activeModal = null
      this.isActive = false
    }
  }
}
</script>

<style lang="scss">
.section-content {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px dashed #ccc;
  position: relative;
  
  &.section-selected {
    border-color: #2196F3;
    background-color: rgba(33, 150, 243, 0.05);
  }
}
</style> 