<template lang="pug">
  v-navigation-drawer.version-history(
    v-model="isShown"
    app
    right
    temporary
    width="400"
  )
    v-toolbar(color="primary", dark, dense, flat)
      v-toolbar-title Version History
      v-spacer
      v-btn(icon, @click="close")
        v-icon mdi-close
    v-list.py-0
      template(v-for="version in versions")
        .version-item.mb-4(:key="version.id")
          v-list-item(@click="preview(version)")
            v-list-item-avatar
              v-icon mdi-history
            v-list-item-content
              v-list-item-title {{ formatDate(version.timestamp) }}
              v-list-item-subtitle {{ version.author }}
            v-list-item-action
              v-btn(icon, @click.stop="restore(version)")
                v-icon mdi-restore
          v-divider
    v-dialog(v-model="previewDialog" max-width="800")
      v-card
        v-card-title {{ $t('editor:bode.versionPreview') }}
        v-card-text
          .version-preview(v-html="previewContent")
        v-card-actions
          v-spacer
          v-btn(text @click="previewDialog = false") {{ $t('common:actions.close') }}
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'VersionHistory',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    versions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      previewDialog: false,
      previewContent: ''
    }
  },
  computed: {
    isShown: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    close() {
      this.isShown = false
    },
    formatDate(timestamp) {
      return format(new Date(timestamp), 'PPpp')
    },
    preview(version) {
      this.previewContent = version.content
      this.previewDialog = true
    },
    restore(version) {
      this.$dialog({
        title: 'Restore Version',
        message: 'Are you sure you want to restore this version? Current changes will be lost.',
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Restore',
            color: 'primary',
            handler: () => {
              this.$emit('restore', version)
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.version-history {
  .v-list-item {
    cursor: pointer;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}

.version-preview {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style> 