import React from 'react'
import { LoadingFullScreen } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import defaultConfig from '../config/template_config/order_config'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { doBatchFinancePrint } from 'gm-printer'
import formatData from '../config/data_to_key'
import { setTitle } from '@gm-common/tool'
import { fillList } from '../util'

setTitle(i18next.t('打印'))

class FinanceVoucherPrinter extends React.Component {
  componentDidMount() {
    // 常规自定义打印↓
    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    this.getInfo()
  }

  async getInfo() {
    const { financeVoucherPrintSet } = this.props.history.location.query
    const objFinanceVoucherPrintSet = JSON.parse(financeVoucherPrintSet)
    defaultConfig.financeSpecialConfig = {
      pageFixLineNum: 7,
      ...objFinanceVoucherPrintSet,
    }
    // 修改打印抬头
    defaultConfig.header.blocks[0].text = objFinanceVoucherPrintSet.printHead

    const orderList = await this.getData()
    LoadingFullScreen.hide()
    doBatchFinancePrint(orderList)
  }

  getData() {
    const { order_id, isSelectAll } = this.props.history.location.query
    // 配送任务全选:传搜索条件
    const req =
      isSelectAll === 'true'
        ? JSON.parse(order_id)
        : { ids: JSON.parse(order_id) }
    return Request('/station/distribute/get_order_by_id')
      .data(req)
      .timeout(60000)
      .get()
      .then((json) => {
        const data = json.data
        return _.map(data, (item) => {
          // 定制需求
          // 每页展示固定的行数---7行,这里的14是因为是双列
          const fillData = fillList(item.details, 14)
          item.details = fillData

          return {
            data: formatData(item, false, '', defaultConfig),
            config: defaultConfig,
          }
        })
      })
  }

  render() {
    return null
  }
}
FinanceVoucherPrinter.propTypes = {
  history: PropTypes.object.isRequired,
}
export default FinanceVoucherPrinter
