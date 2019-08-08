import Vue from 'vue'
import App from './App.vue'
import vuepdfmake from './myplugins/vue-pdfmake.js'

Vue.use(vuepdfmake)

Vue.filter('toFix', function (value, number) {
  if (!value) return ''
  return value.toFixed(number)

}),

  new Vue({
    el: '#app',
    render: h => h(App)
  })
