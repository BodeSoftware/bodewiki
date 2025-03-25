<template lang="pug">
  v-navigation-drawer.comments-drawer(
    v-model="drawer"
    app
    right
    width="400"
    temporary
  )
    .comments-header.pa-4
      .d-flex.align-center
        v-icon.mr-2 mdi-comment-multiple
        .title {{ $t('editor:bode.comments') }}
    .comments-content
      .comments-list.pa-4
        template(v-for="comment in comments")
          .comment-item.mb-4(:key="comment.id")
            .comment-header.d-flex.align-center.mb-2
              v-avatar(size="32" color="primary")
                span.white--text {{ comment.author.charAt(0).toUpperCase() }}
              .ml-2
                .comment-author.font-weight-bold {{ comment.author }}
                .comment-date.caption.grey--text {{ formatDate(comment.timestamp) }}
            .comment-text {{ comment.text }}
      .comment-input.pa-4
        v-textarea(
          v-model="newComment"
          outlined
          hide-details
          :placeholder="$t('editor:bode.addComment')"
          rows="3"
        )
        v-btn.mt-2(
          color="primary"
          :disabled="!newComment.trim()"
          @click="addComment"
        ) {{ $t('common:actions.add') }}
</template>

<script>
import { format } from 'date-fns'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    comments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      drawer: false,
      newComment: ''
    }
  },
  watch: {
    value(newValue) {
      this.drawer = newValue
    },
    drawer(newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    formatDate(date) {
      return format(new Date(date), 'PPpp')
    },
    addComment() {
      if (!this.newComment.trim()) return
      
      this.$emit('add', this.newComment.trim())
      this.newComment = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.comments-drawer {
  .comments-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .comments-content {
    height: calc(100% - 64px);
    display: flex;
    flex-direction: column;
  }

  .comments-list {
    flex: 1;
    overflow-y: auto;
  }

  .comment-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    padding-bottom: 1rem;

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-input {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style> 