<template lang="pug">
  v-navigation-drawer.page-tree-drawer(
    v-model="drawer"
    app
    right
    width="300"
    temporary
  )
    .page-tree-header.pa-4
      .d-flex.align-center
        v-icon.mr-2 mdi-folder-tree
        .title {{ $t('editor:bode.pageTree') }}
      v-text-field.mt-2(
        v-model="search"
        dense
        outlined
        hide-details
        prepend-icon="mdi-magnify"
        :placeholder="$t('editor:bode.searchPages')"
      )
    .page-tree-content
      v-treeview(
        v-model="selected"
        :items="filteredTree"
        item-key="id"
        open-all
        transition
        hoverable
        return-object
        @click="onPageClick"
      )
        template(v-slot:prepend="{ item }")
          v-icon(small) {{ item.icon }}
</template>

<script>
import { get } from 'vuex-pathify'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drawer: false,
      search: '',
      selected: [],
      tree: []
    }
  },
  computed: {
    filteredTree() {
      if (!this.search) return this.tree
      return this.filterTree(this.tree)
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
    async loadPageTree() {
      try {
        // Fetch page tree from API
        const response = await this.$apollo.query({
          query: gql`
            query GetPageTree {
              pages {
                id
                title
                path
                isPublished
                children {
                  id
                  title
                  path
                  isPublished
                }
              }
            }
          `
        })
        
        this.tree = this.transformPagesToTree(response.data.pages)
      } catch (err) {
        console.error('Error loading page tree:', err)
      }
    },
    transformPagesToTree(pages) {
      return pages.map(page => ({
        id: page.id,
        name: page.title,
        path: page.path,
        icon: page.isPublished ? 'mdi-file-document' : 'mdi-file-document-outline',
        children: page.children ? this.transformPagesToTree(page.children) : []
      }))
    },
    filterTree(items) {
      return items.filter(item => {
        const matches = item.name.toLowerCase().includes(this.search.toLowerCase())
        if (item.children) {
          item.children = this.filterTree(item.children)
          return matches || item.children.length > 0
        }
        return matches
      })
    },
    onPageClick(item) {
      this.$emit('select', item)
    }
  },
  mounted() {
    this.loadPageTree()
  }
}
</script>

<style lang="scss" scoped>
.page-tree-drawer {
  .page-tree-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .page-tree-content {
    height: calc(100% - 100px);
    overflow-y: auto;
  }
}
</style> 