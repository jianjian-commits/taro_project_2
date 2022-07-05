import qs from 'query-string'
import { openNewTab } from 'common/util'

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
