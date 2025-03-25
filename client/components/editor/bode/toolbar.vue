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
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleSubscript')
            v-icon mdi-format-subscript
        span {{$t('editor:markup.subscript')}}
      v-tooltip(bottom, color='primary')
        template(v-slot:activator='{ on }')
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleSuperscript')
            v-icon mdi-format-superscript
        span {{$t('editor:markup.superscript')}}
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
          v-btn.mx-0(icon, tile, v-on='on', @click='toggleTaskList')
            v-icon mdi-format-list-checks
        span {{$t('editor:markup.taskList')}}
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
      required: true,
      validator: function(value) {
        return value !== null && typeof value === 'object'
      }
    }
  },
  data() {
    return {
      isReady: false,
      isLoading: true,
      currentColor: '#000000',
      currentHighlight: '#FFEB3B',
      fonts: [
        { label: 'Default', value: 'default' },
        { label: 'Arial', value: 'Arial' },
        { label: 'Helvetica', value: 'Helvetica' },
        { label: 'Times New Roman', value: 'Times New Roman' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Georgia', value: 'Georgia' },
        { label: 'Trebuchet MS', value: 'Trebuchet MS' },
        { label: 'Verdana', value: 'Verdana' }
      ]
    }
  },
  watch: {
    editor: {
      immediate: true,
      handler(newVal) {
        this.isReady = !!newVal && !!newVal.commands
        this.isLoading = false
      }
    }
  },
  methods: {
    ensureEditor() {
      if (!this.isReady || !this.editor || !this.editor.commands) {
        console.warn('Editor not fully initialized')
        return false
      }
      return true
    },
    toggleBold() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleBold().run()
        } catch (err) {
          console.error('Error toggling bold:', err)
        }
      }
    },
    toggleItalic() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleItalic().run()
        } catch (err) {
          console.error('Error toggling italic:', err)
        }
      }
    },
    toggleStrike() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleStrike().run()
        } catch (err) {
          console.error('Error toggling strike:', err)
        }
      }
    },
    toggleSubscript() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleSubscript().run()
        } catch (err) {
          console.error('Error toggling subscript:', err)
        }
      }
    },
    toggleSuperscript() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleSuperscript().run()
        } catch (err) {
          console.error('Error toggling superscript:', err)
        }
      }
    },
    setHeading(level) {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleHeading({ level }).run()
        } catch (err) {
          console.error('Error setting heading:', err)
        }
      }
    },
    toggleBulletList() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleBulletList().run()
        } catch (err) {
          console.error('Error toggling bullet list:', err)
        }
      }
    },
    toggleOrderedList() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleOrderedList().run()
        } catch (err) {
          console.error('Error toggling ordered list:', err)
        }
      }
    },
    toggleTaskList() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleTaskList().run()
        } catch (err) {
          console.error('Error toggling task list:', err)
        }
      }
    },
    toggleBlockquote() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().toggleBlockquote().run()
        } catch (err) {
          console.error('Error toggling blockquote:', err)
        }
      }
    },
    setHorizontalRule() {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().setHorizontalRule().run()
        } catch (err) {
          console.error('Error setting horizontal rule:', err)
        }
      }
    },
    insertLink() {
      if (!this.ensureEditor()) return
      
      try {
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
      } catch (err) {
        console.error('Error inserting link:', err)
      }
    },
    setColor(color) {
      if (this.ensureEditor()) {
        try {
          this.currentColor = color
          this.editor.chain().focus().setColor(color).run()
        } catch (err) {
          console.error('Error setting color:', err)
        }
      }
    },
    setFontFamily(font) {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().setFontFamily(font).run()
        } catch (err) {
          console.error('Error setting font family:', err)
        }
      }
    },
    setTextAlign(align) {
      if (this.ensureEditor()) {
        try {
          this.editor.chain().focus().setTextAlign(align).run()
        } catch (err) {
          console.error('Error setting text alignment:', err)
        }
      }
    },
    setHighlight(color) {
      if (this.ensureEditor()) {
        try {
          this.currentHighlight = color
          this.editor.chain().focus().toggleHighlight({ color }).run()
        } catch (err) {
          console.error('Error setting highlight:', err)
        }
      }
    }
  }
}
</script>

<style lang="scss">
.editor-bode-toolbar {
  background-color: mc('grey', '300');
  border-bottom: 1px solid mc('grey', '400');
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  @at-root .theme--dark & {
    background-color: mc('grey', '800');
    border-bottom-color: mc('grey', '700');
  }

  .v-btn {
    margin: 0 2px;
  }
}
</style> 