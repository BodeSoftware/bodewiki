<template lang='pug'>
  .editor-bode
    div(ref='toolbarContainer')
      editor-bode-toolbar(v-if="isEditorReady", :editor="editor", @slash-command="toggleSlashCommand")
    div.contents(ref='editor')
    slash-command(
      v-if="isEditorReady && slashCommandActive",
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
    info-box(v-model='showPageTree', :title='$t("editor:bode.pageTree")')
    expand-collapse(v-model='showComments', :title='$t("editor:bode.comments")')
    version-history(v-model='showVersionHistory', :versions='versions', @load-version='loadVersion')
    search-bar(v-model='showSearch', @search='search')
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
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import { html as beautify } from 'js-beautify'
import EditorBodeToolbar from './bode/toolbar.vue'
import SlashCommand from './bode/slash-command.vue'
import InfoBox from './bode/info-box.vue'
import ExpandCollapse from './bode/expand-collapse.vue'
import PageTree from './bode/page-tree.vue'
import Comments from './bode/comments.vue'
import VersionHistory from './bode/version-history.vue'
import SearchBar from './bode/search-bar.vue'
import EditorConflict from './bode/conflict.vue'

/* global siteLangs, WIKI */

// Configure CodeBlockLowlight with lowlight
CodeBlockLowlight.configure({
  lowlight
})

export default {
  name: 'EditorBode',
  components: {
    EditorBodeToolbar,
    SlashCommand,
    InfoBox,
    ExpandCollapse,
    PageTree,
    Comments,
    VersionHistory,
    SearchBar,
    EditorConflict
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
      isEditorReady: false,
      stats: {
        characters: 0,
        words: 0
      },
      content: '',
      isConflict: false,
      insertLinkDialog: false,
      slashCommandActive: false,
      slashCommandPosition: { x: 0, y: 0 },
      slashCommandQuery: '',
      slashCommandRange: null,
      showPageTree: false,
      showComments: false,
      showVersionHistory: false,
      showSearch: false,
      currentVersion: null,
      comments: [],
      versions: [],
      searchResults: []
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
    locale: get('page/locale'),
    path: get('page/path'),
    mode: get('editor/mode'),
    activeModal: sync('editor/activeModal'),
    checkoutDateActive: sync('editor/checkoutDateActive')
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
      
      const text = this.editor.state.doc.textContent
      this.stats = {
        characters: text.length,
        words: text.split(/\s+/).filter(w => w.length > 0).length
      }
    },
    toggleSlashCommand() {
      if (!this.editor) return
      
      const { view } = this.editor
      const { selection } = view.state
      const coords = view.coordsAtPos(selection.$anchor.pos)
      
      this.slashCommandPosition = {
        x: coords.left,
        y: coords.bottom
      }
      this.slashCommandActive = true
      this.slashCommandQuery = ''
    },
    onSlashCommandSelect(command) {
      if (!this.editor) return
      
      command.action(this.editor)
      this.slashCommandActive = false
    },
    togglePageTree() {
      this.showPageTree = !this.showPageTree
    },
    toggleComments() {
      this.showComments = !this.showComments
    },
    toggleVersionHistory() {
      this.showVersionHistory = !this.showVersionHistory
    },
    toggleSearch() {
      this.showSearch = !this.showSearch
    },
    addComment(comment) {
      this.comments.push({
        id: Date.now(),
        text: comment,
        author: this.$store.get('user/name'),
        timestamp: new Date().toISOString()
      })
    },
    loadVersion(version) {
      if (!this.editor) return
      this.currentVersion = version
      this.editor.commands.setContent(version.content)
      this.showVersionHistory = false
      this.checkoutDateActive = version.timestamp
      this.$root.$emit('resetEditorConflict')
    },
    search(query) {
      if (!this.editor) return
      
      try {
        const content = this.editor.getText()
        const results = []
        let pos = content.toLowerCase().indexOf(query.toLowerCase())
        
        while (pos !== -1) {
          results.push({
            text: content.substr(pos - 20, 40),
            position: pos
          })
          pos = content.toLowerCase().indexOf(query.toLowerCase(), pos + 1)
        }
        
        this.searchResults = results
      } catch (err) {
        console.error('Error performing search:', err)
      }
    }
  },
  async mounted () {
    this.$store.set('editor/editorKey', 'bode')

    if (this.mode === 'create' && !this.$store.get('editor/content')) {
      this.$store.set('editor/content', '<h1>Header</h1><p>Your content here</p>')
    }

    try {
      // Wait for the editor element to be mounted
      await this.$nextTick()
      const editorElement = this.$refs.editor
      const toolbarContainer = this.$refs.toolbarContainer
      
      if (!editorElement || !toolbarContainer) {
        throw new Error('Required editor elements not found')
      }

      // Initialize Tiptap editor with essential features first
      this.editor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Write something...'
          }),
          Image.configure({
            allowBase64: true,
            HTMLAttributes: {
              class: 'editor-image'
            }
          }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'editor-link'
            }
          }),
          Table.configure({
            resizable: true
          }),
          TableRow,
          TableHeader,
          TableCell,
          TextStyle.configure({
            types: ['textStyle']
          }),
          Color.configure({
            types: ['textStyle']
          }),
          FontFamily.configure({
            types: ['textStyle']
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph']
          }),
          Highlight.configure({
            multicolor: true
          }),
          Subscript.configure(),
          Superscript.configure(),
          TaskList,
          TaskItem.configure({
            nested: true
          }),
          CodeBlockLowlight.configure({
            lowlight
          })
        ],
        content: this.$store.get('editor/content'),
        autofocus: true,
        onUpdate: ({ editor }) => {
          try {
            const html = editor.getHTML()
            this.$store.set('editor/content', beautify(html, { indent_size: 2, end_with_newline: true }))
            this.updateStats()
          } catch (err) {
            console.error('Error in editor update:', err)
          }
        }
      })

      // Verify editor was created successfully
      if (!this.editor) {
        throw new Error('Failed to initialize editor')
      }

      // Setup special handlers for slash commands
      this.editor.on('keydown', ({ event }) => {
        if (event.key === '/' && !this.slashCommandActive) {
          event.preventDefault()
          this.toggleSlashCommand()
        }
      })

      // Initial stats update
      this.updateStats()
      
      // Load version history if available
      try {
        this.$apollo.query({
          query: gql`
            query ($id: Int!) {
              pages {
                history (id: $id) {
                  trail {
                    authorName
                    content
                    createdAt
                    versionId
                  }
                }
              }
            }
          `,
          variables: {
            id: this.$store.get('page/id')
          }
        }).then(resp => {
          this.versions = _.get(resp, 'data.pages.history.trail', []).map(h => ({
            id: h.versionId,
            content: h.content,
            author: h.authorName,
            timestamp: h.createdAt
          }))
        })
      } catch (err) {
        console.error('Error loading version history:', err)
      }
      
      // Mark editor as ready only after successful initialization
      this.isEditorReady = true

    } catch (err) {
      console.error('Error initializing editor:', err)
      this.$store.commit('showNotification', {
        message: 'Failed to initialize editor: ' + err.message,
        style: 'error'
      })
    }

    // Set up event listeners for content insertion
    this.$root.$on('editorInsert', opts => {
      if (!this.editor || !this.isEditorReady) return
      
      try {
        switch (opts.kind) {
          case 'IMAGE':
            this.editor.chain().focus().setImage({ src: opts.path }).run()
            break
          case 'BINARY':
            this.editor.chain().focus().setLink({ href: opts.path }).run()
            break
          case 'DIAGRAM':
            this.editor.chain().focus().setImage({ src: `data:image/svg+xml;base64,${opts.text}` }).run()
            break
          case 'INFO_BOX':
            this.editor.chain().focus().insertContent({
              type: 'infoBox',
              attrs: { type: opts.type || 'info' },
              content: [{ type: 'paragraph' }]
            }).run()
            break
          case 'EXPAND_COLLAPSE':
            this.editor.chain().focus().insertContent({
              type: 'expandCollapse',
              attrs: { title: opts.title || 'Expand/Collapse' },
              content: [{ type: 'paragraph' }]
            }).run()
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