import React from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen, Storage, Tip } from '@gmfe/react'
import { doBatchPrint } from 'gm-printer'
import { setTitle } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import formatData from '../config/data_to_key'
import PropTypes from 'prop-types'
import moment from 'moment'
import { sortByMultiRule } from '../../../common/util'
import { recordPrintLog } from '../../../common/print_log'
import globalStore from '../../../stores/global'

const getRuleList = (sort_by, sort_direction) => {
  if (!sort_direction) return []

  return sort_by === 'name'
    ? [{ sort_by: 'name', sort_direction }]
    : [
        { sort_by: 'category_name_1', sort_direction },
        { sort_by: 'category_name_2', sort_direction },
      ]
}

setTitle(i18next.t('入库单打印'))
const sortItem = Storage.get('list_sort_type_stock_in_receipt_detail')

class Print extends React.Component {
  async componentDidMount() {
    const { template_id, request_parameters } = this.props.location.query
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const [dataList, config] = await Promise.all([
      this.getDataList(JSON.parse(request_parameters)),
      this.getConfig(template_id),
    ])

    const list = dataList.map((data) => {
      if (sortItem)
        data.details = sortByMultiRule(
          data.details,
          getRuleList(sortItem.sort_by, sortItem.sort_direction),
        )

      return {
        config,
        data: formatData({
          ...data,
          print_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          print_operator: globalStore.user.name,
        }),
      }
    })

    LoadingFullScreen.hide()

    Tip.info('记录打印中')
    recordPrintLog({
      ids: dataList.map((o) => o.id),
      sheet_type: 2,
    })
      .then(async () => {
        await doBatchPrint(list)
      })
      .catch(() => {
        Tip.danger('记录打印失败， 请检测你的网络后重试')
      })
  }

  getConfig = (id) => {
    return Request('/fe/stock_in_tpl/get')
      .data({ id })
      .get()
      .then(
        (res) => res.data.content,
        () => {
          window.alert(i18next.t('模板配置发生变化，请重试！'))
        },
      )
  }

  getDataList = (request_parameters) => {
    return Request('/stock/in_stock_sheet/material/print')
      .data(request_parameters)
      .post()
      .then((res) => res.data)
  }

  render() {
    return null
  }
}

Print.propTypes = {
  location: PropTypes.object,
}

export default Print
