import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen, Storage, Tip } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import { sortByMultiRule } from '../../../common/util'
import { formatBill, formatTask } from '../config/data_to_key'

const getRuleList = (sort_by, sort_direction) => {
  if (!sort_direction) return []

  return sort_by === 'name'
    ? [{ sort_by: 'spec_name', sort_direction }]
    : [
        { sort_by: 'category_name_1', sort_direction },
        { sort_by: 'category_name_2', sort_direction },
      ]
}

setTitle(i18next.t('打印'))
const sortItem = Storage.get('list_sort_type_purchase_task_detail')

class PurchasePrinter extends React.Component {
  async componentDidMount() {
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const { print_what } = this.props.location.query
    let list = null

    if (print_what === 'bill') {
      list = await this.getBillData()
    } else {
      list = await this.getTaskData()
    }

    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  getBillData() {
    const { sheet_no, tpl_id } = this.props.location.query

    const reqList = [
      Request('/stock/purchase_sheet/details', { timeout: 60000 })
        .data({ sheet_no })
        .get()
        .then((json) => json.data),
      Request('/fe/purchase_tpl/get')
        .data({ id: tpl_id })
        .get()
        .then((json) => json.data),
    ]
    return Promise.all(reqList)
      .then((res) => {
        const [item, config] = res
        if (sortItem) {
          item.tasks = sortByMultiRule(
            item.tasks,
            getRuleList(sortItem.sort_by, sortItem.sort_direction),
          )
        }
        return [
          {
            data: formatBill(item),
            config: config.content,
          },
        ]
      })
      .catch(() => {
        window.alert(i18next.t('模板配置发生变化，请返回上一页'))
      })
  }

  getTaskData() {
    const { tpl_id, ...query } = this.props.location.query
    const req = { ...query, is_print: 1 }

    const reqList = [
      Request('/purchase/task/print', { timeout: 60000 })
        .data(req)
        .get()
        .then((json) => json.data),
      Request('/fe/purchase_tpl/get')
        .data({ id: tpl_id })
        .get()
        .then((json) => json.data),
    ]

    return Promise.all(reqList)
      .then((res) => {
        const [list, config] = res
        if (list.length === 0) {
          Tip.danger('打印数据为空，请检查筛选条件!')
          return
        }
        return list.map((item) => {
          return {
            data: formatTask(item),
            config: config.content,
          }
        })
      })
      .catch(() => {
        window.alert(i18next.t('模板配置发生变化，请返回上一页'))
      })
  }

  render() {
    return null
  }
}

export default PurchasePrinter
