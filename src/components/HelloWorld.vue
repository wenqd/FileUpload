<template>
  <FileUpload  :initfiles="files" :uploadprops="uploadprops" @imageClick="imageClick" @CNodeImgeCount="getCNodeImgeCount">1</FileUpload>
</template>
<script>
import FileUpload from '../../dist/filesupload'
export default {
  name: 'demo',
  components: {FileUpload},
  data: function () {
    return {
      files: [],
      uploadprops: {
        config: {
          thumbWidth: 125, // 缩略图宽度，可省略，默认为110
          thumbHeight: 125, // 缩略图高度，可省略，默认为110
          wrapId: 'uploader', // 必填
          shwoAlllist: false, // 是否显示全部图片标签页
          fileformat: 'gif,jpg,jpeg,png,zip,pdf,xlsx,xls,doc,docx,ppt,rar'// 允许上传的文件格式
        },
        // 处理客户端新文件上传时，需要调用后台处理的地址, 必填
        uploadUrl: process.env.BASE_API + '/fileTransferUploadActionImg.do',
        // 处理客户端原有文件更新时的后台处理地址，必填
        updateUrl: process.env.BASE_API + '/fileTransferUploadActionImg.do',
        // 当客户端原有文件删除时的后台处理地址，必填
        removeUrl: process.env.BASE_API + '/commAction.do',
        // 初始化客户端上传文件，从后台获取文件的地址, 可选，当此参数为空时，默认已上传的文件为空
        initUrl: process.env.BASE_API + '/commAction.do'
      }
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
