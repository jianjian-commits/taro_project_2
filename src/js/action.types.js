import { keyMirror } from '@gm-common/tool'

export default keyMirror(
  Object.assign({
    // 获取商品库单位
    GLOBAL_GET_UNIT_NAME: null,
    // 获得常规分拣商品码的打印类型+（加上）获取地磅相关信息
    GLOBAL_GET_SORTING_PRODUCT_CODE_TYPE: null,
  })
)
