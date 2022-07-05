import React from 'react'
import PrintHeader from './print_header'
import PrintSkuGroup from './print_sku_group'
import PrintFooter from './print_footer'
import SolidLine from './components/solid_line'
import { setTitle } from '@gm-common/tool'
import { i18next } from 'gm-i18n'
import { ORDER_PRINT_API } from '../../order_printer/api'
import { LoadingFullScreen } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import printLog from 'common/print_log'

setTitle(i18next.t('配送单打印'))

class ThermalPrintIndex extends React.Component {
  state = {
    printData: [],
  }

  async componentDidMount() {
    const {
      order_ids, // {string} 已JSON.stringify的司机ids数组
      delivery_type = 1, // 1: 老接口 2: 新接口
      filter,
    } = this.props.history.location.query

    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    //            非全选(包含当前页全选): 传ids    :   全选所有页: 传搜索条件，
    const query = order_ids
      ? { ids: order_ids, type: delivery_type }
      : { ...JSON.parse(filter), type: delivery_type }

    const fetchData = ORDER_PRINT_API[delivery_type]

    const list = await fetchData(query)

    this.setState({ printData: this.processData(list) })

    LoadingFullScreen.hide()
    window.print()

    printLog({
      sheet_type: 1,
      ids: JSON.stringify(list.map((o) => o.id)),
    })
  }

  processData(list) {
    return list.map((o) => {
      return {
        ...o,
        skuGroup: _.groupBy(o.details, (v) => v.category_title_1),
      }
    })
  }

  render() {
    const { printData } = this.state

    return printData.map((obj, i) => {
      return (
        <div style={{ width: '80mm' }} key={i} className='gm-padding-lr-10'>
          <PrintHeader data={obj} />
          <PrintSkuGroup data={obj.skuGroup} />
          <PrintFooter />
          <SolidLine style={{ margin: '30px 0' }} />
        </div>
      )
    })
  }
}

ThermalPrintIndex.propTypes = {
  history: PropTypes.object.isRequired,
}

export default ThermalPrintIndex
