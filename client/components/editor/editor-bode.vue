<template lang='pug'>
  .editor-bode
    div(ref='toolbarContainer', v-if="editor")
      editor-bode-toolbar(:editor="editor", @slash-command="toggleSlashCommand")
    div.contents(ref='editor')
    slash-command(
      v-if="editor"
      :editor="editor",
      :is-active="slashCommandActive",
      :position="slashCommandPosition",
      :query="slashCommandQuery",
      @select="onSlashCommandSelect",
      @close="slashCommandActive = false"
    )
    v-system-bar.editor-bode-sysbar(dark, status, color='grey darken-3')
      .caption.editor-bode-sysbar-locale {{locale.toUpperCase()}}
      .caption.px-3 /{{path}}
      template(v-if='$vuetify.breakpoint.mdAndUp')
        v-spacer
        .caption Bode Advanced Editor
        v-spacer
        .caption {{$t('editor:bode.stats', { chars: stats.characters, words: stats.words })}}
    editor-conflict(v-model='isConflict', v-if='isConflict')
    page-selector(mode='select', v-model='insertLinkDialog', :open-handler='insertLinkHandler', :path='path', :locale='locale')
</template>

<script>
import _ from 'lodash'
import { get, sync } from 'vuex-pathify'
import { Editor } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { html as beautify } from 'js-beautify/js/lib/beautifier.min.js'
import EditorBodeToolbar from './bode/toolbar.vue'
import SlashCommand from './bode/slash-command.vue'

/* global siteLangs, WIKI */

export default {
  components: {
    EditorBodeToolbar,
    SlashCommand
  },
  props: {
    save: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      editor: null,
      stats: {
        characters: 0,
        words: 0
      },
      content: '',
      isConflict: false,
      insertLinkDialog: false,
      slashCommandActive: false,
      slashCommandPosition: { top: 0, left: 0 },
      slashCommandQuery: '',
      slashCommandRange: null
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
    locale: get('page/locale'),
    path: get('page/path'),
    activeModal: sync('editor/activeModal')
  },
  methods: {
    insertLink () {
      this.insertLinkDialog = true
    },
    insertLinkHandler ({ locale, path }) {
      if (!this.editor) return
      
      try {
        const url = siteLangs.length > 0 ? `/${locale}/${path}` : `/${path}`
        
        // Set link on current selection
        this.editor.chain().focus().setLink({ href: url }).run()
      } catch (err) {
        console.error('Error inserting link:', err)
      }
    },
    updateStats() {
      if (!this.editor) return
      
      try {
        const text = this.editor.getText()
        this.stats = {
          characters: text.length,
          words: text.split(/\s+/).filter(Boolean).length
        }
      } catch (err) {
        console.error('Error updating stats:', err)
      }
    },
    toggleSlashCommand() {
      this.slashCommandActive = !this.slashCommandActive
      
      if (this.slashCommandActive && this.editor) {
        try {
          const { view } = this.editor
          const { selection } = view.state
          const { ranges } = selection
          const from = Math.min(...ranges.map(range => range.$from.pos))
          const coordinates = view.coordsAtPos(from)
          
          this.slashCommandPosition = {
            top: coordinates.top + coordinates.height,
            left: coordinates.left
          }
        } catch (err) {
          console.error('Error toggling slash command:', err)
          this.slashCommandActive = false
        }
      }
    },
    onSlashCommandSelect(item) {
      if (!item.command || !this.editor) {
        this.slashCommandActive = false
        return
      }
      
      try {
        item.command({
          editor: this.editor,
          range: this.slashCommandRange
        })
      } catch (err) {
        console.error('Error executing slash command:', err)
      } finally {
        this.slashCommandActive = false
      }
    }
  },
  async mounted () {
    this.$store.set('editor/editorKey', 'bode')

    try {
      // Initialize Tiptap editor
      this.editor = new Editor({
        element: this.$refs.editor,
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Type the page content here...'
          }),
          Image,
          Link.configure({
            openOnClick: false
          }),
          Table.configure({
            resizable: true
          }),
          TableRow,
          TableHeader,
          TableCell
        ],
        content: this.$store.get('editor/content'),
        onUpdate: ({ editor }) => {
          // Convert Tiptap content to HTML and store it
          const html = editor.getHTML()
          this.$store.set('editor/content', beautify(html, { indent_size: 2, end_with_newline: true }))
          this.updateStats()
        }
      })

      // Setup special handlers for slash commands
      if (this.editor) {
        this.editor.on('keydown', ({ event }) => {
          if (event.key === '/' && !this.slashCommandActive) {
            const { view } = this.editor
            const { selection } = view.state
            const { ranges } = selection
            const from = Math.min(...ranges.map(range => range.$from.pos))
            const coordinates = view.coordsAtPos(from)
            
            this.slashCommandActive = true
            this.slashCommandPosition = {
              top: coordinates.top + coordinates.height,
              left: coordinates.left
            }
            
            this.slashCommandRange = {
              from,
              to: from + 1
            }
            
            event.preventDefault()
          }
        })
      }
    } catch (err) {
      console.error('Failed to initialize Bode editor:', err)
    }

    // Set up event listeners for content insertion
    this.$root.$on('editorInsert', opts => {
      if (!this.editor) return
      
      try {
        switch (opts.kind) {
          case 'IMAGE':
            this.editor.chain().focus().setImage({ src: opts.path }).run()
            break
          case 'BINARY':
            this.editor.chain().focus().setLink({ href: opts.path }).run()
            break
          case 'DIAGRAM':
            // Insert diagram as an image
            this.editor.chain().focus().setImage({ src: `data:image/svg+xml;base64,${opts.text}` }).run()
            break
        }
      } catch (err) {
        console.error('Error inserting content:', err)
      }
    })

    this.$root.$on('editorLinkToPage', opts => {
      this.insertLink()
    })

    // Handle save conflict
    this.$root.$on('saveConflict', () => {
      this.isConflict = true
    })
    
    this.$root.$on('overwriteEditorContent', () => {
      if (!this.editor) return
      
      try {
        this.editor.commands.setContent(this.$store.get('editor/content'))
      } catch (err) {
        console.error('Error overwriting editor content:', err)
      }
    })
  },
  beforeDestroy () {
    if (this.editor) {
      try {
        this.editor.destroy()
      } catch (err) {
        console.error('Error destroying editor:', err)
      } finally {
        this.editor = null
      }
    }
    
    // Clean up event listeners
    this.$root.$off('editorInsert')
    this.$root.$off('editorLinkToPage')
    this.$root.$off('saveConflict')
    this.$root.$off('overwriteEditorContent')
  }
}
</script>

<style lang="scss">

$editor-height: calc(100vh - 64px - 24px);
$editor-height-mobile: calc(100vh - 56px - 16px);

.editor-bode {
  background-color: mc('grey', '200');
  flex: 1 1 50%;
  display: flex;
  flex-flow: column nowrap;
  height: $editor-height;
  max-height: $editor-height;
  position: relative;

  @at-root .theme--dark & {
    background-color: mc('grey', '900');
  }

  @include until($tablet) {
    height: $editor-height-mobile;
    max-height: $editor-height-mobile;
  }

  &-sysbar {
    padding-left: 0;

    &-locale {
      background-color: rgba(255,255,255,.25);
      display:inline-flex;
      padding: 0 12px;
      height: 24px;
      width: 63px;
      justify-content: center;
      align-items: center;
    }
  }

  .contents {
    background-color: mc('grey', '100');
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2rem;
    box-shadow: 0 0 5px hsla(0, 0, 0, .1);
    margin: 1rem auto 0;
    width: calc(100vw - 256px - 16vw);
    min-height: calc(100vh - 64px - 24px - 1rem - 40px);
    border-radius: 5px;

    @at-root .theme--dark & {
      background-color: #303030;
      color: #FFF;
    }

    @include until($widescreen) {
      width: calc(100vw - 2rem);
      margin: 1rem 1rem 0 1rem;
      min-height: calc(100vh - 64px - 24px - 1rem - 40px);
    }

    @include until($tablet) {
      width: 100%;
      margin: 0;
      min-height: calc(100vh - 56px - 24px - 76px);
    }

    // Adding styling for Tiptap editor
    .ProseMirror {
      outline: none;
      min-height: calc(100vh - 64px - 24px - 1rem - 40px - 4rem);
      
      &:focus {
        box-shadow: 0 0 10px rgba(mc('blue', '700'), .25);
      }
      
      p {
        margin: 1em 0;
      }
    
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      
      ul, ol {
        padding-left: 1.5em;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }

      blockquote {
        padding-left: 1em;
        border-left: 3px solid #ddd;
      }
      
      table {
        border-collapse: collapse;
        margin: 0;
        overflow: hidden;
        table-layout: fixed;
        width: 100%;
        
        td, th {
          border: 1px solid #ddd;
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5rem;
          position: relative;
          vertical-align: top;
          
          &.selectedCell {
            background-color: #e3f2fd;
            
            @at-root .theme--dark & {
              background-color: rgba(59, 130, 246, 0.3);
            }
          }
        }
        
        th {
          background-color: #f1f3f5;
          font-weight: bold;
          text-align: left;
          
          @at-root .theme--dark & {
            background-color: #1e293b;
          }
        }
      }
    }
  }
}
</style> 