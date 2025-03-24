<template lang="pug">
  v-card.wiki-form(elevation="0")
    v-form
      v-container.pa-3(fluid, grid-list-lg)
        v-card.mb-5(outlined)
          v-toolbar(flat, color='primary', dark, height='50')
            .subtitle-1.white--text {{$t('admin:system.features.title')}}
          v-card-text
            v-row
              v-col(cols='12', sm='6', lg='4')
                v-switch(
                  v-model='featurePageRatings'
                  :label='$t("admin:system.features.pageRatings")'
                  color='primary'
                  inset
                )
              v-col(cols='12', sm='6', lg='4')
                v-switch(
                  v-model='featurePageComments'
                  :label='$t("admin:system.features.pageComments")'
                  color='primary'
                  inset
                )
              v-col(cols='12', sm='6', lg='4')
                v-switch(
                  v-model='featurePersonalWikis'
                  :label='$t("admin:system.features.personalWikis")'
                  color='primary'
                  inset
                )
              v-col(cols='12', sm='6', lg='4')
                v-switch(
                  v-model='collaborativeEditor'
                  :label='$t("admin:system.features.collaborativeEditor")'
                  color='primary'
                  inset
                )
                .caption {{$t('admin:system.features.collaborativeEditorHint')}}

    v-card-chin
      v-spacer
      v-btn(color='primary', outlined, @click='save' :loading='loading') {{$t('common:actions.apply')}}
</template>

<script>
import { get } from 'vuex-pathify'

export default {
  data() {
    return {
      loading: false,
      featurePageRatings: false,
      featurePageComments: false,
      featurePersonalWikis: false,
      collaborativeEditor: false
    }
  },
  computed: {
    currentUser: get('user/current')
  },
  methods: {
    async save() {
      this.loading = true
      try {
        await this.$apollo.mutate({
          mutation: require('@/gql/admin/system/features-mutation.gql'),
          variables: {
            featurePageRatings: this.featurePageRatings,
            featurePageComments: this.featurePageComments,
            featurePersonalWikis: this.featurePersonalWikis,
            collaborativeEditor: this.collaborativeEditor
          }
        })
        this.$store.commit('showNotification', {
          message: this.$t('admin:system.features.updatedSuccess'),
          style: 'success',
          icon: 'check'
        })
      } catch (err) {
        this.$store.commit('showNotification', {
          message: err.message,
          style: 'error'
        })
      }
      this.loading = false
    }
  },
  mounted() {
    this.featurePageRatings = this.$store.get('site/features')?.featurePageRatings || false
    this.featurePageComments = this.$store.get('site/features')?.featurePageComments || false
    this.featurePersonalWikis = this.$store.get('site/features')?.featurePersonalWikis || false
    this.collaborativeEditor = this.$store.get('site/features')?.collaborativeEditor || false
  }
}
</script> 