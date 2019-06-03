<template>
  <FileUpload  :initfiles="files" @imageClick="imageClick" @CNodeImgeCount="getCNodeImgeCount">1</FileUpload>
</template>
<script>
import FileUpload from '@/components/webuploader/upload'
export default {
  name: 'demo',
  components: {FileUpload},
  data: function () {
    return {
      files: []
    }
  },
  methods: {
    imageClick: function (fileinfo) {
      console.info(fileinfo)
    },
    getCNodeImgeCount: function () {

    }
  }
}
</script>
