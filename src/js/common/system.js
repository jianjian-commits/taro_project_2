// 约定
// /c_xxx 是 c 的部分

const TYPE = {
  C: 'c',
  B: 'b'
}

// TODO 补充看不到的三级模块
const config = {
  /* 商品 - 商品管理 */
  // 商品库
  '/merchandise/manage/list': '/c_retail/basic_info/list',
  // 分类管理
  '/merchandise/manage/category_management':
    '/c_retail/basic_info/category_management',
  /* 系统 - 设置 */
  // 店铺运营
  '/system/setting/custom_page': '/c_retail/basic_info/custom_page',
  /* 营销 - 营销 */
  // 优惠券
  '/marketing/manage/coupon': '/c_retail/marketing/coupon',
  // 营销活动
  '/marketing/manage/market_tag': '/c_retail/marketing/market_tag',
}

function getType() {
  // /xxx/xxx/xxx
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('/c_')) {
    return TYPE.C
  } else {
    return TYPE.B
  }
}

// url /xxx/xxx or #/xxx/xxx
function mappingUrl(url) {
  const arr = url.split('/')
  const pre = arr.slice(1, 4).join('/')
  const _pre = `/${pre}`

  const type = getType()

  if (!config[_pre] || type === TYPE.B) {
    return url
  }

  return arr[0] + config[_pre] + '/' + arr.slice(4).join('/')
}

const System = {
  config,
  TYPE,
  // B
  isB() {
    return getType() === TYPE.B
  },
  // C
  isC() {
    return getType() === TYPE.C
  },
  // url /xxx/xxx or #/xxx/xxx
  getUrl(url) {
    return mappingUrl(url)
  }
}

export default System
