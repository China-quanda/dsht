import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入阿里字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器 styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入axios
import axios from 'axios'
// 配置请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 为请求头挂载Authorization
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// // 响应拦截
// axios.interceptors.response.use(response => {
//   if (response.data.code === 401) {
//     // 删除 过期的token
//     window.sessionStorage.removeItem('token')
//     router.replace({ path: '/login' })
//   }
// })
// 把axios挂载到vue原型上
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor /* { default global options } */)

// 定义全局过滤器
Vue.filter('dateFormat', originVal => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
