require('core-js/stable')
require('regenerator-runtime/runtime')

/* global siteConfig */
/* eslint-disable no-unused-expressions */

switch (window.document.documentElement.lang) {
  case 'ar':
  case 'fa':
    import(/* webpackChunkName: "fonts-arabic" */ './scss/fonts/arabic.scss')
    break
  default:
    import(/* webpackChunkName: "fonts-default" */ './scss/fonts/default.scss')
    break
}

require('modernizr')

require('./scss/app.scss')
import(/* webpackChunkName: "theme" */ './themes/' + siteConfig.theme + '/scss/app.scss')

import(/* webpackChunkName: "mdi" */ '@mdi/font/css/materialdesignicons.css')

require('./helpers/compatibility.js')
require('./client-app.js')
import(/* webpackChunkName: "theme" */ './themes/' + siteConfig.theme + '/js/app.js')

import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'
