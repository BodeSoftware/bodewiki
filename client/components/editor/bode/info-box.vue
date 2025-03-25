<template lang="pug">
  .info-box(:class="type")
    .info-box-header
      v-icon(color="white") {{ icon }}
      span.info-box-title {{ title }}
    .info-box-content
      slot
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'warning', 'tip'].includes(value)
    },
    title: {
      type: String,
      default: 'Info'
    }
  },
  computed: {
    icon() {
      switch (this.type) {
        case 'warning':
          return 'mdi-alert'
        case 'tip':
          return 'mdi-lightbulb'
        default:
          return 'mdi-information'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.info-box {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 4px;
  color: white;

  &.info {
    background-color: #2196F3;
  }

  &.warning {
    background-color: #FF9800;
  }

  &.tip {
    background-color: #4CAF50;
  }

  .info-box-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: bold;

    .v-icon {
      margin-right: 0.5rem;
    }
  }

  .info-box-content {
    opacity: 0.9;
  }
}
</style> 