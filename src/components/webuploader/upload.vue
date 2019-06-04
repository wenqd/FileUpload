<template>
  <div>
    <div class="page-container">
      <div id="uploader">
        <div class="statusBar" style="display:none">
          <div class="tab-view">
            <div ref="detailView" style="float:left" class="tab-active" @click="tabChange('detailView')">分类展示
              {{ CNodeImgeCount }}
            </div>
            <div v-if="uploadprops.config.shwoAlllist" ref="allView" style="float:left" @click="tabChange('allView')">全部展示{{ AllImgeCount }}</div>
            <div style="clear:both"/>
          </div>
          <div class="btns">
            <div class="progress">
              <span class="text">0%</span>
              <span class="percentage"/>
            </div>
            <div class="info">共 5 张</div>
            <div id="filePicker2"/>
            <div class="uploadBtn">开始上传</div>
          </div>
        </div>
        <div class="queueList">
          <div id="dndArea" class="placeholder">
            <div id="filePicker"/>
            <p>或将照片拖到这里{{ currentNode }}</p>
          </div>
          <ul class="filelist" style="height: 135px;"/>
        </div>
        <div class="queueAllList"/>
      </div>
    </div>
  </div>
</template>
<script>
import Util from '@/utils/util.js'
require('@/components/webuploader/css/demo.css')
require('@/components/webuploader/css/style.css')
require('@/components/webuploader/webuploader-0.1.5/webuploader.css')
var $ = require('jquery')
window.$ = $
window.jQuery = $
require('@/components/webuploader/webuploader-0.1.5/webuploader.js')

$(function () {})
export default {
  name: 'FileUpload',
  props: {
    currentNode: {// 当前选中分类
      type: String,
      default: ''
    },
    initfiles: {// 初始文件信息
      type: Array,
      default: function () {
        return []
      }
    },
    uploadprops: {
      type: Object,
      default: function () {
        return {
          config: {
            thumbWidth: 125, // 缩略图宽度，可省略，默认为110
            thumbHeight: 125, // 缩略图高度，可省略，默认为110
            wrapId: 'uploader', // 必填
            shwoAlllist: false, // 是否显示全部图片标签页
            fileformat: 'gif,jpg,jpeg,png,zip,pdf,xlsx,xls,doc,docx,ppt,rar'// 允许上传的文件格式
          },
          // 处理客户端新文件上传时，需要调用后台处理的地址, 必填
          uploadUrl: '',
          // 处理客户端原有文件更新时的后台处理地址，必填
          updateUrl: '',
          // 当客户端原有文件删除时的后台处理地址，必填
          removeUrl: '',
          // 初始化客户端上传文件，从后台获取文件的地址, 可选，当此参数为空时，默认已上传的文件为空
          initUrl: ''
        }
      }
    }
  },
  data () {
    return {
      vchrInfo: {},
      CNodeImgeCount: 0,
      AllImgeCount: 0
    }
  },
  watch: {
    currentNode: function (newval, oldval) {
      if (newval === '0') {
        this.tabChange('allView')
      } else {
        this.tabChange('detailView')
      }
      this.showImglist(newval)
      this.updataImgCount()
    }
  },
  mounted: function () {
    // require('@/components/webuploader/webuploader-0.1.5/extend-webuploader.js')
    // 获取url上的参数
    var _this = this
    _this.initWebUploader()
    window.onresize = function () {
      _this.showImglist(_this.currentNode)
    }
  },
  methods: {
    initWebUploader: function () {
      var _this = this
      /* eslint-disable */
      if (!this.uploadprops) {
        console.log("请配置好_this.uploadprops");
        $("#dndArea p").html("请配置好uploadprops");
        return false;
      }
      if (!this.uploadprops.config || !this.uploadprops.config.wrapId) {
        console.log("请配置好uploadprops.config.wrapId");
        $("#dndArea p").html("请配置好uploadprops.config.wrapId");
        return false;
      }
      if (!_this.uploadprops.uploadUrl) {
        console.log("请配置好_this.uploadprops.uploadUrl");
        $("#dndArea p").html("请配置好uploadprops.uploadUrl");
        return false;
      }
      if (!_this.uploadprops.updateUrl) {
        console.log("请配置好_this.uploadprops.updateUrl");
        $("#dndArea p").html("请配置好uploadprops.updateUrl");
        return false;
      }
      if (!_this.uploadprops.removeUrl) {
        console.log("请配置好_this.uploadprops.removeUrl");
        $("#dndArea p").html("请配置好uploadprops.removeUrl");
        return false;
      }
      var disX = 0;
      var disY = 0;
      var minZindex = 1;
      var origin;
      var is_moveing = false;
      var $wrap = $("#" + _this.uploadprops.config.wrapId);
      /* var $queue = $('<ul class="filelist"></ul>').appendTo(
        $wrap.find(".queueList")
      ); */
      var $queue = $(".filelist");
      var $statusBar = $wrap.find(".statusBar");
      var $info = $statusBar.find(".info");
      var $upload = $wrap.find(".uploadBtn");
      var $placeHolder = $wrap.find(".placeholder");
      var $progress = $statusBar.find(".progress").hide();
      var fileCount = 0;
      var fileSize = 0;
      var state = "pedding";
      var percentages = {};
      var supportTransition = (function() {
        var s = document.createElement("p").style,
          r =
            "transition" in s ||
            "WebkitTransition" in s ||
            "MozTransition" in s ||
            "msTransition" in s ||
            "OTransition" in s;
        s = null;
        //return r;  //暂时先写死  以后遇到问题再调试 wqd
        return true
      })();
      // 优化retina, 在retina下这个值是2
      var ratio = window.devicePixelRatio || 1;
      // 缩略图大小
      var thumbnailWidth = _this.uploadprops.config.thumbWidth || 110;
      thumbnailWidth *= ratio;
      var thumbnailHeight = _this.uploadprops.config.thumbHeight || 110;
      thumbnailHeight *= ratio;
      var uploader = WebUploader.create({
        swf: "http://cdn.staticfile.org/webuploader/0.1.0/Uploader.swf", //require('@/components/webuploader/webuploader-0.1.5/Uploader.swf')
        server: _this.uploadprops.uploadUrl,
        pick: {
          id: "#filePicker",
          label: "点击选择图片"
        },
        dnd: ".queueList",
        paste: document.body,
        accept: {
          title: "Images",
          extensions: _this.uploadprops.config.fileformat,
          mimeTypes: "*"
        },
        resize: false,
        disableGlobalDnd: true,
        chunked: true,
        fileNumLimit: 9999
      });

      function setDragEvent() {
        $(this).on("drop", function(e) {
          var $from = $(origin).parents("li");
          var $to = $(e.target).parents("li");
          var origin_pos = $from.position();
          var target_pos = $to.position();
          var from_sort = $from.attr("data-sort");
          var to_sort = $to.attr("data-sort");

          $from.addClass("move").animate(target_pos, "fast", function() {
            $(this).removeClass("move");
          }).attr("data-sort", to_sort);

          $to.addClass("move").animate(origin_pos, "fast", function() {
            $(this).removeClass("move");
          }).attr("data-sort", from_sort);
        })
          .on("dragstart", function(e) {
            if (is_moveing) {
              return false;
            }
            is_moveing = true;
            e.originalEvent.dataTransfer.effectAllowd = "move";
            origin = this;
          })
          .on("dragover", function(e) {
            if (e.preventDefault) e.preventDefault();
            is_moveing = false;
            e.originalEvent.dataTransfer.dropEffect = "move";
          });
      }

      //更新服务端附件
      function updateServerFiles() {
        var postData = {};
        $('[data-src="server"]').each(function(index, obj) {
          postData[$(obj).attr("data-key")] = $(obj).attr("data-sort");
        });
        $.ajax({
          type: "post",
          url: _this.uploadprops.updateUrl,
          data: postData,
          dataType: "json",
          success: function(data) {
            //setState('finish');
            alert("更新成功");
            $upload.removeClass("disabled");
            setState("ready");
            uploader.reset();
          }
        });
      }

      //删除服务端附件
      function removeServerFile(file,data,a,b) {
        var sendData = {
          'service': 'ImgCommonService',
          'method': 'deleteImage',
          'F_IMG_INFOS': [
            {
              'F_PKEY': file.F_PKEY,
            }
          ]
        }
        $.ajax({
          url: process.env.BASE_API + '/commAction.do',
          type: 'POST',
          data: { jsondata: JSON.stringify(sendData) },
          dataType: 'json',
          async: false,
          success: function(data) {
            if (data.F_CODE === '0') {
              fileCount--;
              updateStatus();
            }
            var text = data.F_MESSAGE
            _this.$info({
              title: '提示',
              okText: '确认',
              content: text
            })
            // _this.$router.go(0) // 刷新当前页面
          }
        })
        /* $.ajax({
          type: "get",
          url: _this.uploadprops.removeUrl,
          data: { id: file.name },
          dataType: "json",
          success: function(data) {
            fileCount--;
            updateStatus();
          }
        }); */
      }

      //初始化服务端附件
      function initServerFile() {
        if (_this.uploadprops.initUrl) {
          $.each(_this.initfiles,function(k,fl){
            $.each(fl.F_ATTACHS,function(index,file){
              file.F_FILE_TP = file.F_FILE_TP.toLowerCase()
              var src = ""//图片地址
              try {
                src = $.inArray(file.F_FILE_TP, Util.imgSuffix) !== -1?Util.createImgUrl(file.F_ATT_STO_KEY):require('@/assets/imageview/suffix/' + file.F_FILE_TP + '.png')
              } catch (error) {
                src = $.inArray(file.F_FILE_TP, Util.imgSuffix) !== -1?Util.createImgUrl(file.F_ATT_STO_KEY):require('@/assets/imageview/suffix/other.png')
              }
              var obj  = {
                id:"SVR_FILE_" + index,
                src:'server',
                name:file.F_ATT_TITLE,
                path : src,
                rotation:0,
                size:parseFloat(file.F_ATT_SIZE),
                type:file.F_FILE_TP,
                F_FILE_TP:file.F_FILE_TP,
                F_PKEY:file.F_PKEY,
                F_PARENT:file.F_PARENT,
                F_IMG_CODE:fl.F_IMG_CODE,
                F_ROTATE:fl.F_ROTATE//旋转度数
              }
              fileQueue(obj);
            })
          })
          _this.showImglist(_this.currentNode)
          /* var len = data.length;
              for (var i = 0; i < len; i++) {
                data[i].src = "server";
                data[i].id = "SVR_FILE_" + i;
                data[i].rotation = 0;
                fileQueue(data[i]);
              } */
        }
      }

      //添加附件到webuploader中
      function addFile(file) {
        var datatype = _this.currentNode
        file.F_ROTATE = file.F_ROTATE||0
        if(file.src === 'server'){
          datatype = file.F_PARENT
        }else{
          file.F_IMG_TYPE = datatype
        }
        $.each(_this.initfiles,function(k,v){
          if(v.key === datatype){
            file.F_IMG_CODE = v.F_IMG_CODE
          }
        })
        var index = $queue.find("li[data-type='" + datatype + "']").length;
        /* var imgLeft = index * (thumbnailWidth + 10);
        var imgTop = 0;
        var wrapHeight = thumbnailHeight + 20;
        var wrapWidth = $queue.width();
        if (imgLeft + (thumbnailWidth + 10) >= wrapWidth) {
          imgTop =
            parseInt((imgLeft + (thumbnailWidth + 10)) / wrapWidth) *
            (thumbnailHeight + 10);
          wrapHeight = imgTop + wrapHeight;
          imgLeft =
            (index % parseInt(wrapWidth / (thumbnailWidth + 10))) *
            (thumbnailWidth + 10);
        } */

        $(".vchrimage .middle").css("overflow-y","hidden")
        $(".vchrimage .category-view").css("overflow-y","hidden")
        var liHeight = thumbnailHeight+25;
        var wrapWidth = $queue.width();
        var wrapHeight = liHeight + 20;
        var imgNum = parseInt(wrapWidth / (thumbnailWidth + 10)) // 每行有几张图片
        var imgTop = 0
        var imgLeft = index * (thumbnailWidth + 10)
        if (index + 1 > imgNum) {
          imgTop = parseInt(index / imgNum) * (liHeight+10)
          imgLeft = (index % imgNum) * (thumbnailWidth + 10)
          wrapHeight = imgTop + liHeight + 10
        }


        $queue.height(wrapHeight);
        var $li = $(
            '<li data-key="' +
              file.key +
              '"  data-src="' +
              file.src +
              '" data-sort="' +
              index +
               '" data-deg="' +
              file.F_ROTATE +
              '" data-type="' +
              datatype +
              '" draggable="true" id="' +
              file.id +
              '" style="position:absolute;margin:0;cursor:move;width:' +
              thumbnailWidth +
              "px;height:" +
              liHeight +
              "px;left:" +
              imgLeft +
              "px;top:" +
              imgTop +
              'px">' +
              '<p class="imgWrap"></p>' +
              '<p class="title">' +
              file.name +
              "</p>" +
              '<p class="progress"><span></span></p>' +
              "</li>"
          ),
          $btns = $(
            '<div class="file-panel">' + '<span class="cancel">删除</span>'+
            '<span class="rotateRight">向右旋转</span>' +
            '<span class="rotateLeft">向左旋转</span></div>'
          ).appendTo($li),
          $progess = $li.find("p.progress span"),
          $wrap = $li.find("p.imgWrap"),
          $info = $('<p class="error"></p>'),
          showError = function(code) {
            var text = ""
            switch (code) {
              case "exceed_size":
                text = "文本大小超出";
                break;
              case "interrupt":
                text = "上传暂停";
                break;
              default:
                text = "上传失败";
                break;
            }
            $info.text(text).appendTo($li);
          };
          if (supportTransition) {
            var degs = "rotate(" + file.rotation||0 + "deg)";
              $wrap.css({
                "-webkit-transform": degs,
                "-mos-transform": degs,
                "-o-transform": degs,
                transform: degs
              });
            }
           //图片点击事件
          $li.on("click",function(){
            var file = $(this).data("fileinfo")
            _this.$emit("imageClick",file)
          })
          if (file.src == "client") {
            if (file.getStatus() == "invalid") {
              showError(file.statusText);
            } else {
              $wrap.text("预览中");
              uploader.makeThumb(
                file,
                function(error, src) {
                  if (error) {
                    /* $wrap.text("不能预览");
                    return; */
                    file.F_FILE_TP = file.ext.toLowerCase()
                    try {
                      src = $.inArray(file.F_FILE_TP, Util.imgSuffix) !== -1?Util.createImgUrl(file.F_ATT_STO_KEY):require('@/assets/imageview/suffix/' + file.ext + '.png')
                    } catch (error) {
                      src = $.inArray(file.F_FILE_TP, Util.imgSuffix) !== -1?Util.createImgUrl(file.F_ATT_STO_KEY):require('@/assets/imageview/suffix/other.png')
                    }
                  }
                  file.path = src;
                  var img = $('<img draggable="true" style="width:'+thumbnailWidth+'px;height:'+thumbnailHeight+'px" src="' + src + '">');
                  img.bind("load", setDragEvent);
                  $wrap.empty().append(img);
                },
                0.8,
                0.8
                /* thumbnailWidth,
                thumbnailHeight */
              );
              percentages[file.id] = [fileSize, 0];
              file.rotation = 0;
          }
          file.on("statuschange", function(cur, prev) {
            if (prev == "progress") {
              $progress.hide().width(0);
            } else if (prev == "queued") {
              //wqd 20190507注释  上传成功后还允许删除
              //$li.off('mouseenter mouseleave');
              //$btns.remove();
            }

            if (cur == "error" || cur == "invalid") {
              showError(file.statusText);
              percentages[file.id][1] = 1;
            } else if (cur == "interrupt") {
              showError("interrupt");
            } else if (cur == "queued") {
              percentages[file.id][1] = 0;
            } else if (cur == "progress") {
              $info.remove();
              $progress.css("display", "block");
            } else if (cur == "complete") {
              $li.append('<span class="success"></span>');
            }

            $li.removeClass("state-" + prev).addClass("state-" + cur);
            updateStatus();
          });
        } else {
          var img = $('<img draggable="true" style="width:'+thumbnailWidth+'px;height:'+thumbnailHeight+'px" src="' + file.path + '">');
          img.bind("load", setDragEvent);
          $wrap.empty().append(img);
          $li.append('<span class="success"></span>');
           $(".vchrimage .middle").css("overflow-y","auto")
          $(".vchrimage .category-view").css("overflow-y","auto")
        }

        $li.on("mouseenter", function() {
          $btns.stop().animate({ height: 30 });
        });
        $li.on("mouseleave", function() {
          $btns.stop().animate({ height: 0 });
        });

        $btns.on("click", "span", function() {
          var index = $(this).index(),
            deg;

          switch (index) {
            case 0:
              //修改删除后面所有图片的位置
              var allImgs = {};
              var del_sort = parseInt($("#" + file.id).attr("data-sort"));
              $queue.find("li").each(function(index, obj) {
                if ($(obj).attr("data-sort") > del_sort) {
                  var sort = parseInt($(obj).attr("data-sort"));
                  var $prevObj = $("li[data-sort=" + (sort - 1) + "]");
                  if ($prevObj) {
                    allImgs[$(obj).attr("id")] = $prevObj.position();
                  }
                }
              });
              for (var k in allImgs) {
                var sort = parseInt($("#" + k).attr("data-sort"));
                $("#" + k)
                  .attr("data-sort", sort - 1)
                  .css({
                    left: allImgs[k].left + "px",
                    top: allImgs[k].top + "px"
                  });
              }
              allImgs = null;
              if (file.src == "client") uploader.removeFile(file);
              else {
                removeServerFile(file);
                $("#" + file.id).remove();
                _this.updataImgCount()
              }
              _this.showImglist(_this.currentNode)
              return;
            case 1:
              file.rotation += 90;
              break;
            case 2:
              file.rotation -= 90;
              break;
          }

          if (supportTransition) {
            deg = "rotate(" + file.rotation + "deg)";
            $wrap.css({
              "-webkit-transform": deg,
              "-mos-transform": deg,
              "-o-transform": deg,
              transform: deg
            });
            $wrap.parent().attr("data-deg",file.rotation)
          } else {
          }
        });
        $li.appendTo($queue);
        $li.data("fileinfo",file)
        _this.updataImgCount()
      }
      //删除webupload中的图片
      function removeFile(file) {
        var $li = $("#" + file.id);
        delete percentages[file.id];
        updateTotalProgress();
        $li.off().find(".file-panel").off().end().remove();
        _this.updataImgCount()
      }

      //更新webuploader中图片上传的进度
      function updateTotalProgress() {
        var loaded = 0,
          total = 0,
          spans = $progress.children(),
          percent;

        $.each(percentages, function(k, v) {
          total += v[0];
          loaded += v[0] * v[1];
        });

        percent = total ? loaded / total : 0;

        spans.eq(0).text(Math.round(percent * 100) + "%");
        spans.eq(1).css("width", Math.round(percent * 100) + "%");
        updateStatus();
      }

      //更新webuploader中的状态
      function updateStatus() {
        var text = "",
          stats;
        if (state == "ready") {
          text =
            "共" +
            WebUploader.formatSize(fileSize) +
            ".";
        } else if (state == "confirm") {
          stats = uploader.getStats();
          if (stats.uploadFailNum) {
            text =
              "上传成功" +
              stats.successNum +
              "张影像，上传失败:" +
              stats.uploadFailNum +
              //'张照片上传失败,<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>';
              '张影像，<a class="retry" href="#">重新上传</a>失败影像';
          }
        } else {
          stats = uploader.getStats();
          text =
            "共" +
            fileCount +
            "张(" +
            WebUploader.formatSize(fileSize) +
            ")，已上传" +
            stats.successNum +
            "张";
          if (stats.uploadFailNum) {
            text += ",失败" + stats.uploadFailNum + "张";
          }
        }
        $info.html(text);
      }

      //设置webuploader的状态
      function setState(val) {
        var file, stats;
        if (val == state) {
          return;
        }
        $upload.removeClass("state-" + state);
        $upload.addClass("state-" + val);
        state = val;

        switch (state) {
          case "pedding":
            $placeHolder.removeClass("element-invisible");
            $queue.parent().removeClass("filled");
            $queue.hide();
            $statusBar.addClass("element-invisible");
            uploader.refresh();
            break;
          case "ready":
            $placeHolder.addClass("element-invisible");
            $("#filePicker2").removeClass("element-invisible");
            $queue.parent().addClass("filled");
            $queue.show();
            $statusBar.removeClass("element-invisible");
            uploader.refresh();
            break;
          case "uploading":
            $("filePicker2").addClass("element-invisible");
            $progress.show();
            $upload.text("暂停上传");
            break;
          case "paused":
            $progress.show();
            $upload.text("继续上传");
            break;
          case "confirm":
            $progress.hide();
            //wqd 20190508 注释
            // $upload.text('开始上传').addClass('disabled');
            $upload.text("开始上传");
            stats = uploader.getStats();
            if (stats.successNum && !stats.uploadFailNum) {
              //wqd 20190508 注释
              //setState( 'finish' );
              return;
            }
            break;
          case "finish":
            stats = uploader.getStats();
            if (stats.successNum) {
              alert("上传成功");
            } else {
              state = "done";
              location.reload();
            }
            break;
        }
        updateStatus();
      }

      //文件加入到webuploader中的队列
      function fileQueue(file) {
        file.src = file.src || "client";
        fileCount++;
        fileSize += file.size;

        if (fileCount == 1) {
          $placeHolder.addClass("element-invisible");
          $statusBar.show();
        }

        addFile(file);
        setState("ready");
        updateTotalProgress();
      }

      if (!WebUploader.Uploader.support()) {
        console.log("WebUploader 不支持");
        throw new Error("WebUploader does not support");
      }

      uploader.addButton({
        id: "#filePicker2",
        label: "继续添加"
      });

      uploader.on("uploadProgress", function(file, percentage) {
        var $li = $("#" + file.id),
          $percent = $li.find(".progress span");
        $percent.css({"width": percentage * 100 + "%","display":"none"})
        updateTotalProgress();
      });

      uploader.on("fileQueued", fileQueue);

      uploader.on("fileDequeued", function(file) {
        fileCount--;
        fileSize -= file.size;
        if (!fileCount) {
          setState("pedding");
        }
        removeFile(file);
        updateTotalProgress();
      });

      uploader.on("uploadSuccess", function(file, data) {
        if (data.F_CODE === "0") {
          $("#" + file.id)
            .find("p.state")
            .text("已上传");
        }
      });

      uploader.on("uploadError", function(file, b) {
        console.log(file.id + "上传出错");
      });

      uploader.on("uploadComplete", function(file, a, b) {
        $("#" + file.id)
          .find("p.state")
          .fadeOut();
      });

      uploader.on("all", function(type) {
        if (type == "uploadFinished") {
          setState("confirm");
        } else if (type == "startUpload") {
          setState("uploading");
        } else if (type == "stopUpload") {
          setState("paused");
        }
      });

      uploader.on("uploadBeforeSend", function(block, data) {
        data.sort = $("#" + data.id).attr("data-sort");
        var file = $("#" + data.id).data("fileinfo")
        var obj = {
          "F_APP_ID": "TAIKANG",//来源系统标识
          "F_ACCESS_TOKEN": "",
          "F_USER_ID": "tianmeng",//操作人
          "F_USER_NAME":"",//操作人名称
          "F_NEED_APPLY": "1",  //是否需要申请 默认1
          "F_BILL_ID":"LKRL201812110014",//单据编号
          "F_BILL_TYPE":"TTFS_JS_LKRLD",//单据类型
          "F_BIZ_TYPE":"TTFS_JS_LKRLD",//业务类型
          "F_AMT":"",//金额
          "F_CURR":"",//币种
          "F_SC_CODE":"",//共享中心
          "F_POOL_ID":"",//业务池
          "F_ATT_TYPE":"0",//上传方式 0普通上传 1 集中扫描
          "F_APPLY_FILES": [
            {
              "F_TYPE": "0",
              "F_OBJECT": "1234567890",
              "F_IMG_CODE":file.F_IMG_CODE,//影像关键码
              "F_IMG_TYPE":file.F_IMG_TYPE,//影像类别
              "F_FILES": [
                {
                  "F_FILE_NAME": data.name,
                  "F_FILE_NAME1": data.name,
                  "F_FILE_PATH": "",
                  "F_FILE_SIZE": data.size,
                  "F_FILE_MD5": "",
                  "F_UPLOAD_ZIP": "",
                  "F_ENCRYPT": "",
                  "F_ENCRYPT_KEY": "",
                  "F_BIZ_INFO":"",//摘要
                  "F_OPER_TYPE":"",//操作类型 默认空表示制单人上传 1表示审批人加批注或编辑图片
                  "F_ORIG_IMG_KEY": "",//审批人编辑及批注图片时有用
                  "F_NODE_ID":"",//签批节点
                  "F_NODE_NAME":"",//签批节点名称
                  "F_SIGN_USR_NAME":"",//签批人名称
                  "F_SIGN_NOTE":"",//签批内容
                  "F_OP_ACTION":"",//操作动作
                  "F_ROTATE":file.rotation,//旋转度数
                  "F_FILE_ORDER":$("#" + data.id).attr("data-sort"),//显示序号
                  "F_ISHIDE":"0",//是否隐藏：1是，0否
                  "F_RISK_TYPE":""//风险类别
                }
              ]
            }
          ]
        }
        data.jsondata = JSON.stringify(obj);
        var $li = $("#" + data.id),
          $percent = $li.find(".progress span");
        $percent.css({"width": "100%","display":"block"})
      });

      $upload.on("click", function() {
        uploader.sort(function(obj1, obj2) {
          return $("#" + obj1.id).attr("data-sort") > $("#" + obj2.id) ? -1 : 1;
        });
        if ($(this).hasClass("disabled")) {
          return false;
        }
        if (state == "ready") {
          if (uploader.getFiles().length < 1) updateServerFiles();
          else uploader.upload();
        } else if (state == "paused") {
          uploader.upload();
        } else if (state == "uploading") {
          uploader.stop();
        }
      });

      $info.on("click", ".retry", function() {
        uploader.retry();
      });

      $info.on("click", ".ignore", function() {
        alert("todo");
      });

      $upload.addClass("state-" + state);
      updateTotalProgress();

      initServerFile();
    },
    /* eslint-enable */
    showImglist: function (type) {
      $(".filelist>li[data-type!='" + type + "']").hide()
      $(".filelist>li[data-type='" + type + "']").show()
      $('.vchrimage .middle').css('overflow-y', 'hidden')
      $('.vchrimage .category-view').css('overflow-y', 'hidden')
      // 重新计算图片的位置
      var $queue = $('.filelist')
      // 优化retina, 在retina下这个值是2
      var ratio = window.devicePixelRatio || 1
      // 缩略图大小
      var thumbnailWidth = this.uploadprops.config.thumbWidth || 110
      thumbnailWidth *= ratio
      var thumbnailHeight = this.uploadprops.config.thumbHeight || 110
      thumbnailHeight = thumbnailHeight + 25
      thumbnailHeight *= ratio
      var wrapHeight = thumbnailHeight + 10
      var wrapWidth = $queue.width()
      var imgNum = parseInt(wrapWidth / (thumbnailWidth + 10)) // 每行有几张图片
      $(".filelist>li[data-type='" + type + "']").each(function (index, v) {
        var imgTop = 0
        var imgLeft = index * (thumbnailWidth + 10)
        if (index + 1 > imgNum) {
          imgTop = parseInt(index / imgNum) * (thumbnailHeight + 10)
          imgLeft = (index % imgNum) * (thumbnailWidth + 10)
          wrapHeight = imgTop + thumbnailHeight + 10
        }
        $(this).css({ left: imgLeft + 'px', top: imgTop + 'px' })
      })
      $queue.css('height', wrapHeight + 'px')
      $('.vchrimage .middle').css('overflow-y', 'auto')
      $('.vchrimage .category-view').css('overflow-y', 'auto')
    },
    // tab页签点击
    tabChange: function (ref) {
      $(this.$refs[ref]).addClass('tab-active').siblings().removeClass('tab-active')
      if (ref === 'allView') {
        $('.queueAllList').show().empty()
        $('.imgWrap img').clone().appendTo($('.queueAllList'))
        $('.queueList').hide()
        $('.queueAllList img').css('margin', '10px')
        this.AllImgeCount = $('.queueAllList img').length
      } else {
        $('.queueList').show()
        $('.queueAllList').hide()
      }
    },
    updataImgCount: function () {
      var $queue = $('.filelist')
      var count = $queue.find("li[data-type='" + this.currentNode + "']").length
      this.CNodeImgeCount = count
      this.$emit('CNodeImgeCount', count)
      var allCount = $queue.find('li').length
      this.AllImgeCount = allCount
    }
  }
}
</script>
<style scoped>
  .tab-view div{
    padding: 0 20px;
    cursor: pointer;
  }
  .tab-view .tab-active{
    border-bottom: 2px solid #1094fa;
  }
</style>
