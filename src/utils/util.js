var Util = {
  imgSuffix: ['jpg', 'png', 'gif', 'jpeg'], // 常用图片后缀
  // 数组对象根据某个key相同合并分组
  arr2GroupArray: function (arr, field) {
    var map = {}
    var dest = []
    for (var i = 0; i < arr.length; i++) {
      var ai = arr[i]
      if (!map[ai[field]]) {
        dest.push({
          key: ai[field],
          data: [ai]
        })
        map[ai[[field]]] = ai
      } else {
        for (var j = 0; j < dest.length; j++) {
          var dj = dest[j]
          if (dj.key === ai[field]) {
            dj.data.push(ai)
            break
          }
        }
      }
    }
    return dest
  },
  // 金额保留2位小数 千分位
  moneyFormat (val) {
    var num = parseFloat(val).toFixed(2) + '' // 保留两位小数
    return num.replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
  },
  // 格式化时间
  timeFormat (val) {
    return val.substr(0, 4) + '-' + val.substr(4, 2) + '-' + val.substr(6, 2) + ' ' + val.substr(8, 2) + ':' + val.substr(10, 2) + ':' + val.substr(12, 2)
  },
  // 格式化时间
  dateFormat (val) {
    return val === '' ? '' : val.substr(0, 4) + '-' + val.substr(4, 2) + '-' + val.substr(6, 2)
  },
  // 生成影像地址
  createImgUrl: function (F_ATT_STO_KEY) {
    if (F_ATT_STO_KEY !== '' || F_ATT_STO_KEY !== undefined) {
      var imgurl = process.env.BASE_API + '/fileTransferDownloadAction.do?F_APP_ID=CPEFSS&F_NEED_APPLY=1&F_STORE_KEY='
      return imgurl + F_ATT_STO_KEY
    }
  }
}
export default Util
