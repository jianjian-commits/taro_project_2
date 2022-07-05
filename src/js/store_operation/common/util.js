import qs from 'query-string'
import { openNewTab } from '../../common/util'

/**
 * 返回分拣清单所需要的数据
 * @param list
 * @return {Array}
 */
export function buildSortingList(list) {
  let sortingList = []
  if (!list.length) {
    return sortingList
  } else {
    const tmp = {}
    const data_by_category_1 = []
    list.forEach(function (data) {
      if (tmp[data.category_id_1]) {
        tmp[data.category_id_1].push(data)
      } else {
        tmp[data.category_id_1] = [data]
      }
    })

    for (var a in tmp) {
      data_by_category_1.push(tmp[a])
    }

    sortingList = data_by_category_1
  }
  return sortingList
}

/**
 * 配送任务 分拣明细 打印单据
 * @param params
 * filter 搜索条件 过滤掉值为空的字段
 */
export function handleCommonOrderPrint(params) {
  const { URL, order_ids, isSelectAll, selectAllType, filter, ...rest } = params

  // selectAllType 1 非全选 传ids, 2 全选 传搜索条件
  const query =
    isSelectAll && selectAllType === 2
      ? qs.stringify({
          ...rest,
          // query-string不支持嵌套
          filter: JSON.stringify(filter),
        })
      : qs.stringify({ order_ids, ...rest })

  openNewTab(`${URL}?${query}`)
}
