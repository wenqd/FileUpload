import FileUpload from './components/webuploader/upload.vue'
import _Vue from 'vue'

FileUpload.install = Vue => {
  if (!Vue) {
    window.Vue = Vue = _Vue
  }
  Vue.component(FileUpload.name, FileUpload)
}
export default FileUpload
