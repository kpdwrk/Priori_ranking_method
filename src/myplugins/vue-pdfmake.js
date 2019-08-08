import pdfmake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

export default {
  install(Vue, options) {
    const {vfs} = vfsFonts.pdfMake;
    pdfmake.vfs = vfs;
    Vue.prototype.$pdfmake = pdfmake
  }
}


