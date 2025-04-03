<template lang="pug">
  v-dialog(
    v-model="isActive"
    max-width="900px"
  )
    v-card
      v-card-title.headline {{ $t('editor:versionHistory.title') }}
      v-card-text
        v-data-table(
          :headers="headers"
          :items="formattedVersions"
          :loading="loading"
          :no-data-text="$t('editor:versionHistory.none')"
          :items-per-page="10"
          item-key="versionId"
        )
          template(v-slot:item.versionDate="{ item }")
            span {{ formatDate(item.versionDate) }}
          template(v-slot:item.actions="{ item }")
            v-btn(
              icon
              small
              @click="loadVersion(item)"
              :title="$t('editor:versionHistory.load')"
            )
              v-icon mdi-backup-restore
      v-card-actions
        v-spacer
        v-btn(
          text
          @click="close"
        ) {{ $t('common:actions.close') }}
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
      isActive: false,
      loading: false,
      headers: [
        { text: this.$t('editor:versionHistory.date'), value: 'versionDate', align: 'start' },
        { text: this.$t('editor:versionHistory.author'), value: 'authorName' },
        { text: this.$t('editor:versionHistory.action'), value: 'actionType' },
        { text: this.$t('editor:versionHistory.actions'), value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  computed: {
    formattedVersions() {
      return this.versions.map(v => ({
        ...v,
        actionType: this.formatAction(v.actionType)
      }))
    }
  },
  watch: {
    value(newValue) {
      this.isActive = newValue
    },
    isActive(newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '-'
      return format(new Date(date), 'MMM d, yyyy h:mm a')
    },
    formatAction(action) {
      const actionMap = {
        initial: this.$t('editor:versionHistory.actionTypes.initial'),
        edit: this.$t('editor:versionHistory.actionTypes.edit'),
        move: this.$t('editor:versionHistory.actionTypes.move'),
        delete: this.$t('editor:versionHistory.actionTypes.delete'),
        restore: this.$t('editor:versionHistory.actionTypes.restore')
      }
      return actionMap[action] || action
    },
    loadVersion(version) {
      this.$emit('load-version', version)
    },
    close() {
      this.isActive = false
    }
  }
}
</script>

<style lang="scss">
.v-data-table {
  background-color: transparent !important;
}
</style> 