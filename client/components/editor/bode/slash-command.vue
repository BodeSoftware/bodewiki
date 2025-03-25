<template lang='pug'>
  .slash-command-menu(v-if="isActive", :style="{ top: `${position.top}px`, left: `${position.left}px` }")
    .slash-command-menu-item(
      v-for="(item, index) in filteredItems",
      :key="index",
      :class="{ 'is-selected': selectedIndex === index }",
      @click="selectItem(index)"
    )
      v-icon.mr-2 {{ item.icon }}
      .item-title {{ item.title }}
      .item-description {{ item.description }}
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      default: () => ([
        {
          title: 'Heading 1',
          description: 'Large section heading',
          icon: 'mdi-format-header-1',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode('heading', { level: 1 })
              .run()
          }
        },
        {
          title: 'Heading 2',
          description: 'Medium section heading',
          icon: 'mdi-format-header-2',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode('heading', { level: 2 })
              .run()
          }
        },
        {
          title: 'Bullet List',
          description: 'Create a bulleted list',
          icon: 'mdi-format-list-bulleted',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBulletList()
              .run()
          }
        },
        {
          title: 'Numbered List',
          description: 'Create a numbered list',
          icon: 'mdi-format-list-numbered',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleOrderedList()
              .run()
          }
        },
        {
          title: 'Table',
          description: 'Add a table',
          icon: 'mdi-table',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        },
        {
          title: 'Blockquote',
          description: 'Add a quote block',
          icon: 'mdi-format-quote-close',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleBlockquote()
              .run()
          }
        },
        {
          title: 'Code Block',
          description: 'Add a code block',
          icon: 'mdi-code-tags',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleCodeBlock()
              .run()
          }
        },
        {
          title: 'Image',
          description: 'Add an image',
          icon: 'mdi-image',
          command: ({ editor, range }) => {
            const url = prompt('Enter image URL')
            if (url) {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setImage({ src: url })
                .run()
            }
          }
        }
      ])
    },
    isActive: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ top: 0, left: 0 })
    },
    query: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedIndex: 0
    }
  },
  computed: {
    filteredItems() {
      if (!this.query) {
        return this.items
      }
      
      const lowerCaseQuery = this.query.toLowerCase()
      
      return this.items.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) || 
        item.description.toLowerCase().includes(lowerCaseQuery)
      )
    }
  },
  watch: {
    filteredItems() {
      this.selectedIndex = 0
    },
    isActive() {
      this.selectedIndex = 0
    }
  },
  methods: {
    ensureEditor() {
      if (!this.editor) {
        console.warn('Editor not initialized')
        return false
      }
      return true
    },
    selectItem(index) {
      const item = this.filteredItems[index]
      
      if (item && this.ensureEditor()) {
        this.$emit('select', item)
      }
    },
    onKeyDown(event) {
      if (!this.isActive || !this.ensureEditor()) return

      if (event.key === 'ArrowUp') {
        this.upHandler()
        event.preventDefault()
      }
      
      if (event.key === 'ArrowDown') {
        this.downHandler()
        event.preventDefault()
      }
      
      if (event.key === 'Enter') {
        this.enterHandler()
        event.preventDefault()
      }
      
      if (event.key === 'Escape') {
        this.$emit('close')
        event.preventDefault()
      }
    },
    
    upHandler() {
      this.selectedIndex = ((this.selectedIndex + this.filteredItems.length) - 1) % this.filteredItems.length
    },
    
    downHandler() {
      this.selectedIndex = (this.selectedIndex + 1) % this.filteredItems.length
    },
    
    enterHandler() {
      this.selectItem(this.selectedIndex)
    }
  },
  
  mounted() {
    document.addEventListener('keydown', this.onKeyDown)
  },
  
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeyDown)
  }
}
</script>

<style lang="scss">
.slash-command-menu {
  position: absolute;
  z-index: 1000;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 0.2rem;
  margin-top: 0.5rem;
  width: 240px;
  max-height: 400px;
  overflow-y: auto;
  
  // Dark theme support
  @at-root .theme--dark & {
    background-color: #424242;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  
  &-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin: 0.2rem 0;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f5f5;
      
      @at-root .theme--dark & {
        background-color: #303030;
      }
    }
    
    &.is-selected {
      background-color: #e3f2fd;
      
      @at-root .theme--dark & {
        background-color: #1e3a8a;
      }
    }
    
    .item-title {
      font-weight: 500;
      margin-right: 0.5rem;
    }
    
    .item-description {
      font-size: 0.8rem;
      color: #666;
      
      @at-root .theme--dark & {
        color: #aaa;
      }
    }
  }
}
</style> 