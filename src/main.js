import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify - 核心樣式
import 'vuetify/styles'
// Material Design Icons 字體
import '@mdi/font/css/materialdesignicons.css' 

// 從 Vuetify 引入建立函式
import { createVuetify } from 'vuetify'
// 引入所有 Vuetify 元件和指令
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 建立 Vuetify 實例，並明確傳入所有元件和指令
const vuetify = createVuetify({
  components,
  directives,
})

// 建立 Vue 應用程式實例
const app = createApp(App)

// 依序使用 Pinia, Vue Router 和 Vuetify
app.use(createPinia())
app.use(router)
app.use(vuetify)

// 掛載應用程式
app.mount('#app')
