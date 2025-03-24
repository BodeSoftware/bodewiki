<template lang='pug'>
  .editor-bode-toolbar
    v-toolbar(dense, color='primary', dark, flat, style='overflow-x: hidden;')
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleBold')
            v-icon mdi-format-bold
        span {{$t('editor:markup.bold')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleItalic')
            v-icon mdi-format-italic
        span {{$t('editor:markup.italic')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleStrike')
            v-icon mdi-format-strikethrough
        span {{$t('editor:markup.strikethrough')}}
      v-menu(offset-y, open-on-hover)
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on')
            v-icon mdi-format-header-pound
        v-list.py-0
          template(v-for='n in 6')
            v-list-item(:key='n', @click='setHeading(n)')
              v-list-item-action
                v-icon(:size='24 - (n - 1) * 2') mdi-format-header-{{n}}
              v-list-item-title {{$t('editor:markup.heading', { level: n })}}
            v-divider(v-if='n < 6')
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleBulletList')
            v-icon mdi-format-list-bulleted
        span {{$t('editor:markup.unorderedList')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleOrderedList')
            v-icon mdi-format-list-numbered
        span {{$t('editor:markup.orderedList')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleBlockquote')
            v-icon mdi-format-quote-close
        span {{$t('editor:markup.blockquote')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='setHorizontalRule')
            v-icon mdi-minus
        span {{$t('editor:markup.horizontalBar')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='insertLink')
            v-icon mdi-link-plus
        span {{$t('editor:markup.insertLink')}}
      v-spacer
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='$emit("slash-command")')
            v-icon mdi-slash-forward
        span Slash Commands
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  methods: {
    toggleBold() {
      this.editor.chain().focus().toggleBold().run()
    },
    toggleItalic() {
      this.editor.chain().focus().toggleItalic().run()
    },
    toggleStrike() {
      this.editor.chain().focus().toggleStrike().run()
    },
    setHeading(level) {
      this.editor.chain().focus().toggleHeading({ level }).run()
    },
    toggleBulletList() {
      this.editor.chain().focus().toggleBulletList().run()
    },
    toggleOrderedList() {
      this.editor.chain().focus().toggleOrderedList().run()
    },
    toggleBlockquote() {
      this.editor.chain().focus().toggleBlockquote().run()
    },
    setHorizontalRule() {
      this.editor.chain().focus().setHorizontalRule().run()
    },
    insertLink() {
      const previousUrl = this.editor.getAttributes('link').href
      const url = window.prompt('URL', previousUrl)
      
      // cancelled
      if (url === null) {
        return
      }
      
      // empty
      if (url === '') {
        this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }
      
      // update link
      this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }
}
</script>

<style lang="scss">
.editor-bode-toolbar {
  // Your custom toolbar styling here
}
</style> 