<template lang="pug">
  .expand-collapse
    .expand-collapse-header(@click="isExpanded = !isExpanded")
      v-icon(:color="isExpanded ? 'primary' : 'grey'") {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      span.expand-collapse-title {{ title }}
    v-expand-transition
      .expand-collapse-content(v-show="isExpanded")
        slot
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Expand/Collapse'
    },
    expanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: this.expanded
    }
  },
  watch: {
    expanded(newValue) {
      this.isExpanded = newValue
    }
  }
}
</script>

<style lang="scss" scoped>
.expand-collapse {
  margin: 1rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;

  .expand-collapse-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    background-color: #f5f5f5;
    border-radius: 4px 4px 0 0;

    &:hover {
      background-color: #eeeeee;
    }

    .v-icon {
      margin-right: 0.5rem;
    }

    .expand-collapse-title {
      font-weight: 500;
    }
  }

  .expand-collapse-content {
    padding: 1rem;
  }
}
</style> 