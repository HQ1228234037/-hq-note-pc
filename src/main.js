import Vue from 'vue'
import App from './App.vue'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import router from './router'
import Cache from './utils/cache'
import leMarkdownEditor from 'le-markdown-editor'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

Vue.use(ViewUI)
Vue.use(leMarkdownEditor)
Vue.use(mavonEditor)

Vue.config.productionTip = false
Vue.prototype.$cache = Cache

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
console.log('我要提PR');
